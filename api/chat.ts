import { randomUUID } from 'node:crypto';
import { ServerResponse } from 'node:http';
import { ChatAttachment, ChatMessage, Conversation } from '../src/types';
import {
  assertSameOrigin,
  ChatApiError,
  ChatRequest,
  clearAdminSession,
  createAdminSession,
  enforceRateLimit,
  getAdminUsername,
  getChatAdminClient,
  readRequestBody,
  requireAdmin,
  sendJson,
  validateVisitorId,
  verifyAdminCredentials,
} from '../server/chat';

const CHAT_BUCKET = 'chat-attachments';
const MAX_ATTACHMENTS = 4;
const MAX_TEXT_LENGTH = 2000;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const AUDIO_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a']);
const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
};

function getQuery(request: ChatRequest): URLSearchParams {
  return new URL(request.url || '/', 'https://local.invalid').searchParams;
}

function normalizeMimeType(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().split(';')[0].trim();
}

function mapMessage(row: Record<string, unknown>, attachments: ChatAttachment[]): ChatMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    sender: row.sender === 'admin' ? 'admin' : 'customer',
    channel: 'website',
    customerName: String(row.customer_name || ''),
    customerHandle: typeof row.customer_handle === 'string' ? row.customer_handle : undefined,
    text: String(row.text || ''),
    attachments,
    timestamp: String(row.timestamp),
    isRead: Boolean(row.is_read),
    productId: typeof row.product_id === 'string' ? row.product_id : undefined,
    productTitle: typeof row.product_title === 'string' ? row.product_title : undefined,
  };
}

function mapConversation(
  row: Record<string, unknown>,
  messages: ChatMessage[] = []
): Conversation {
  return {
    id: String(row.id),
    customerName: String(row.customer_name || 'Website Visitor'),
    customerHandle: String(row.customer_handle || 'Website Visitor'),
    channel: 'website',
    lastMessage: String(row.last_message || ''),
    lastUpdated: String(row.last_updated || row.created_at || ''),
    unreadCount: Number(row.unread_count || 0),
    status: row.status === 'archived' ? 'archived' : row.status === 'replied' ? 'replied' : 'open',
    productId: typeof row.product_id === 'string' ? row.product_id : undefined,
    productTitle: typeof row.product_title === 'string' ? row.product_title : undefined,
    messages,
  };
}

async function signAttachments(
  client: ReturnType<typeof getChatAdminClient>,
  input: unknown
): Promise<ChatAttachment[]> {
  if (!Array.isArray(input)) return [];
  const signed = await Promise.all(input.map(async (value): Promise<ChatAttachment | null> => {
    if (!value || typeof value !== 'object') return null;
    const item = value as Record<string, unknown>;
    if (typeof item.path !== 'string') return null;
    const { data, error } = await client.storage.from(CHAT_BUCKET).createSignedUrl(item.path, 60 * 60);
    if (error || !data?.signedUrl) {
      throw new ChatApiError(502, 'Could not create a secure link for a chat attachment.');
    }
    return {
      path: item.path,
      url: data.signedUrl,
      type: item.type === 'audio' ? 'audio' : 'image',
      name: typeof item.name === 'string' ? item.name : 'attachment',
      mimeType: typeof item.mimeType === 'string' ? item.mimeType : '',
      size: Number(item.size || 0),
    } satisfies ChatAttachment;
  }));
  return signed.filter((item): item is ChatAttachment => item !== null);
}

async function loadMessages(
  client: ReturnType<typeof getChatAdminClient>,
  conversationId: string,
  limit = 500
): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })
    .limit(limit);
  if (error) throw new ChatApiError(502, `Could not load chat messages: ${error.message}`);

  return Promise.all((data || []).map(async (row) => {
    const attachments = await signAttachments(client, row.attachments);
    return mapMessage(row, attachments);
  }));
}

async function getConversation(
  client: ReturnType<typeof getChatAdminClient>,
  row: Record<string, unknown>
): Promise<Conversation> {
  const messages = await loadMessages(client, String(row.id));
  return mapConversation(row, messages);
}

function validateAttachments(input: unknown, visitorId: string): ChatAttachment[] {
  if (input === undefined) return [];
  if (!Array.isArray(input) || input.length > MAX_ATTACHMENTS) {
    throw new ChatApiError(400, `You can attach up to ${MAX_ATTACHMENTS} files per message.`);
  }

  return input.map((value) => {
    if (!value || typeof value !== 'object') throw new ChatApiError(400, 'Invalid chat attachment.');
    const item = value as Record<string, unknown>;
    const mimeType = normalizeMimeType(item.mimeType);
    const type = item.type === 'image' ? 'image' : item.type === 'audio' ? 'audio' : null;
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 12 * 1024 * 1024;
    const allowed = type === 'image' ? IMAGE_TYPES : AUDIO_TYPES;
    const expectedPrefix = `${visitorId}/`;
    if (
      !type ||
      !allowed.has(mimeType) ||
      typeof item.path !== 'string' ||
      !item.path.startsWith(expectedPrefix) ||
      !/^[a-zA-Z0-9-]{36}\.[a-z0-9]+$/i.test(item.path.slice(expectedPrefix.length)) ||
      typeof item.size !== 'number' ||
      item.size <= 0 ||
      item.size > maxSize
    ) {
      throw new ChatApiError(400, 'Invalid or unsupported chat attachment.');
    }
    return {
      path: item.path,
      type,
      name: typeof item.name === 'string' ? item.name.slice(0, 120) : 'attachment',
      mimeType,
      size: item.size,
    };
  });
}

async function handleGet(request: ChatRequest, response: ServerResponse): Promise<void> {
  const query = getQuery(request);
  const action = query.get('action');

  if (action === 'admin-session') {
    const username = getAdminUsername(request);
    if (!username) throw new ChatApiError(401, 'Not authenticated.');
    sendJson(response, 200, { data: { username } });
    return;
  }

  const client = getChatAdminClient();
  if (action === 'visitor') {
    const visitorId = validateVisitorId(query.get('visitorId'));
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .eq('visitor_id', visitorId)
      .maybeSingle();
    if (error) throw new ChatApiError(502, `Could not load your conversation: ${error.message}`);
    sendJson(response, 200, { data: data ? await getConversation(client, data) : null });
    return;
  }

  requireAdmin(request);
  if (action === 'conversation') {
    const conversationId = query.get('conversationId');
    if (!conversationId) throw new ChatApiError(400, 'A conversation ID is required.');
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();
    if (error) throw new ChatApiError(502, `Could not load the conversation: ${error.message}`);
    sendJson(response, 200, { data: data ? await getConversation(client, data) : null });
    return;
  }

  if (action === 'admin-conversations') {
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(100);
    if (error) throw new ChatApiError(502, `Could not load the inbox: ${error.message}`);
    const conversationRows = data || [];
    if (conversationRows.length === 0) {
      sendJson(response, 200, { data: [] });
      return;
    }

    const conversationIds = conversationRows.map((row) => String(row.id));
    const { data: messageRows, error: messagesError } = await client
      .from('chat_messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('timestamp', { ascending: false })
      .limit(3000);
    if (messagesError) throw new ChatApiError(502, `Could not load inbox messages: ${messagesError.message}`);

    const mappedMessages = await Promise.all((messageRows || []).map(async (row) =>
      mapMessage(row, await signAttachments(client, row.attachments))
    ));
    const messagesByConversation = new Map<string, ChatMessage[]>();
    for (const message of mappedMessages) {
      const conversationId = message.conversationId;
      const messages = messagesByConversation.get(conversationId) || [];
      messages.push(message);
      messagesByConversation.set(conversationId, messages);
    }
    const conversations = conversationRows.map((row) => {
      const messages = messagesByConversation.get(String(row.id)) || [];
      messages.sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
      return mapConversation(row, messages);
    });
    sendJson(response, 200, { data: conversations });
    return;
  }

  if (action === 'admin-count') {
    const { data, error } = await client
      .from('chat_conversations')
      .select('unread_count')
      .gt('unread_count', 0)
      .limit(1000);
    if (error) throw new ChatApiError(502, `Could not load unread message count: ${error.message}`);
    const unreadCount = (data || []).reduce((total, row) => total + Number(row.unread_count || 0), 0);
    sendJson(response, 200, { data: { unreadCount } });
    return;
  }

  throw new ChatApiError(404, 'Unknown chat action.');
}

async function handleLogin(request: ChatRequest, response: ServerResponse): Promise<void> {
  enforceRateLimit(request, 'admin-login', 5, 15 * 60 * 1000);
  const body = readRequestBody(request);
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!verifyAdminCredentials(username, password)) {
    throw new ChatApiError(401, 'Invalid Admin ID or Password.');
  }
  response.setHeader('Set-Cookie', createAdminSession(username));
  sendJson(response, 200, { data: { username } });
}

async function handleUploadUrl(request: ChatRequest, response: ServerResponse): Promise<void> {
  enforceRateLimit(request, 'chat-upload', 30, 60 * 60 * 1000);
  const body = readRequestBody(request);
  const visitorId = validateVisitorId(body.visitorId);
  const type = body.type === 'image' ? 'image' : body.type === 'audio' ? 'audio' : null;
  const mimeType = normalizeMimeType(body.mimeType);
  const size = typeof body.size === 'number' ? body.size : 0;
  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 12 * 1024 * 1024;
  const allowedTypes = type === 'image' ? IMAGE_TYPES : AUDIO_TYPES;
  if (!type || !allowedTypes.has(mimeType) || size <= 0 || size > maxSize) {
    throw new ChatApiError(400, 'Unsupported file type or size.');
  }

  const extension = FILE_EXTENSIONS[mimeType];
  const path = `${visitorId}/${randomUUID()}.${extension}`;
  const client = getChatAdminClient();
  const { data, error } = await client.storage.from(CHAT_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.token) {
    throw new ChatApiError(502, `Could not prepare the attachment upload: ${error?.message || 'Unknown storage error.'}`);
  }
  sendJson(response, 200, { data: { path, token: data.token } });
}

async function handleSend(request: ChatRequest, response: ServerResponse): Promise<void> {
  enforceRateLimit(request, 'chat-send', 30, 60 * 60 * 1000);
  const body = readRequestBody(request);
  const sender = body.sender;
  if (sender !== 'customer' && sender !== 'admin') {
    throw new ChatApiError(400, 'Invalid message sender.');
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (text.length > MAX_TEXT_LENGTH) throw new ChatApiError(400, 'Message is too long.');
  const client = getChatAdminClient();
  let conversation: Record<string, unknown>;
  let visitorId: string;
  let customerName: string;
  let customerHandle: string;
  let attachments: ChatAttachment[] = [];

  if (sender === 'customer') {
    visitorId = validateVisitorId(body.visitorId);
    customerName = typeof body.customerName === 'string'
      ? body.customerName.trim().slice(0, 100) || 'Website Visitor'
      : 'Website Visitor';
    customerHandle = visitorId;
    attachments = validateAttachments(body.attachments, visitorId);
    if (!text && attachments.length === 0) throw new ChatApiError(400, 'Add a message or an attachment.');

    const { data: existing, error: existingError } = await client
      .from('chat_conversations')
      .select('*')
      .eq('visitor_id', visitorId)
      .maybeSingle();
    if (existingError) throw new ChatApiError(502, `Could not open your conversation: ${existingError.message}`);
    if (existing) {
      conversation = existing;
    } else {
      const newConversation = {
        id: randomUUID(),
        visitor_id: visitorId,
        customer_name: customerName,
        customer_handle: customerHandle,
        status: 'open',
        unread_count: 0,
        last_message: '',
      };
      const { data, error } = await client
        .from('chat_conversations')
        .insert(newConversation)
        .select('*')
        .single();
      if (error?.code === '23505') {
        const { data: createdByAnotherRequest, error: reloadError } = await client
          .from('chat_conversations')
          .select('*')
          .eq('visitor_id', visitorId)
          .single();
        if (reloadError) throw new ChatApiError(502, `Could not open your conversation: ${reloadError.message}`);
        conversation = createdByAnotherRequest;
      } else if (error || !data) {
        throw new ChatApiError(502, `Could not create your conversation: ${error?.message || 'Unknown database error.'}`);
      } else {
        conversation = data;
      }
    }
  } else {
    requireAdmin(request);
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : '';
    if (!conversationId) throw new ChatApiError(400, 'A conversation ID is required.');
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (error || !data) throw new ChatApiError(404, 'Conversation not found.');
    conversation = data;
    visitorId = String(data.visitor_id);
    customerName = 'Kefayaan Support';
    customerHandle = String(data.customer_handle || visitorId);
    if (!text) throw new ChatApiError(400, 'Reply cannot be empty.');
  }

  const conversationId = String(conversation.id);
  const preview = text || (attachments[0]?.type === 'audio' ? 'Voice message' : 'Image attachment');
  const messageRow = {
    id: randomUUID(),
    conversation_id: conversationId,
    sender,
    channel: 'website',
    customer_name: customerName,
    customer_handle: customerHandle,
    text,
    attachments,
    timestamp: new Date().toISOString(),
    is_read: sender === 'admin',
    product_id: sender === 'customer' && typeof body.productId === 'string' ? body.productId.slice(0, 120) : null,
    product_title: sender === 'customer' && typeof body.productTitle === 'string' ? body.productTitle.slice(0, 200) : null,
  };
  const { data: inserted, error: insertError } = await client
    .from('chat_messages')
    .insert(messageRow)
    .select('*')
    .single();
  if (insertError || !inserted) {
    throw new ChatApiError(502, `Could not save your message: ${insertError?.message || 'Unknown database error.'}`);
  }

  const unreadCount = sender === 'customer'
    ? Number(conversation.unread_count || 0) + 1
    : 0;
  const { error: updateError } = await client
    .from('chat_conversations')
    .update({
      customer_name: sender === 'customer' ? customerName : conversation.customer_name,
      last_message: sender === 'admin' ? `You: ${preview}` : preview,
      last_updated: messageRow.timestamp,
      unread_count: unreadCount,
      status: sender === 'admin' ? 'replied' : 'open',
      ...(sender === 'customer' && typeof body.productId === 'string'
        ? { product_id: body.productId, product_title: body.productTitle || null }
        : {}),
    })
    .eq('id', conversationId);
  if (updateError) throw new ChatApiError(502, `Message saved, but inbox status could not be updated: ${updateError.message}`);

  const safeAttachments = await signAttachments(client, attachments);
  sendJson(response, 200, { data: mapMessage(inserted, safeAttachments) });
}

async function handleMarkRead(request: ChatRequest, response: ServerResponse): Promise<void> {
  requireAdmin(request);
  const body = readRequestBody(request);
  const conversationId = typeof body.conversationId === 'string' ? body.conversationId : '';
  if (!conversationId) throw new ChatApiError(400, 'A conversation ID is required.');
  const client = getChatAdminClient();
  const { error: messagesError } = await client
    .from('chat_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('sender', 'customer');
  if (messagesError) throw new ChatApiError(502, `Could not mark messages as read: ${messagesError.message}`);
  const { error } = await client
    .from('chat_conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
  if (error) throw new ChatApiError(502, `Could not update inbox status: ${error.message}`);
  sendJson(response, 200, { data: null });
}

export default async function handler(request: ChatRequest, response: ServerResponse): Promise<void> {
  try {
    const action = getQuery(request).get('action');
    if (request.method === 'GET') {
      await handleGet(request, response);
      return;
    }
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      throw new ChatApiError(405, 'Method not allowed.');
    }

    assertSameOrigin(request);
    if (action === 'login') {
      await handleLogin(request, response);
      return;
    }
    if (action === 'logout') {
      response.setHeader('Set-Cookie', clearAdminSession());
      sendJson(response, 200, { data: null });
      return;
    }
    if (action === 'upload-url') {
      await handleUploadUrl(request, response);
      return;
    }
    if (action === 'send') {
      await handleSend(request, response);
      return;
    }
    if (action === 'mark-read') {
      await handleMarkRead(request, response);
      return;
    }
    throw new ChatApiError(404, 'Unknown chat action.');
  } catch (error) {
    if (error instanceof ChatApiError) {
      sendJson(response, error.status, { error: error.message });
      return;
    }
    console.error('Chat API request failed', error);
    sendJson(response, 500, { error: 'Chat request failed. Please try again later.' });
  }
}
