import { ChatAttachment, ChatMessage, Conversation } from '../types';

const VISITOR_ID_KEY = 'kefayaan_chat_visitor_id_v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  action: string,
  options: RequestInit = {},
  query: Record<string, string> = {}
): Promise<T> {
  const params = new URLSearchParams({ action, ...query });
  const response = await fetch(`/api/chat?${params}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Chat API is unavailable. Use the Vercel deployment or run the API with `vercel dev` locally.');
  }
  const result = await response.json() as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(result.error || `Chat request failed (${response.status}).`);
  }
  return result.data as T;
}

export function getChatVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function getVisitorConversation(visitorId: string): Promise<Conversation | null> {
  return request('visitor', {}, { visitorId });
}

export function getAdminConversations(): Promise<Conversation[]> {
  return request('admin-conversations');
}

export function getAdminUnreadCount(): Promise<{ unreadCount: number }> {
  return request('admin-count');
}

export function sendCustomerChatMessage(input: {
  visitorId: string;
  customerName: string;
  text: string;
  attachments: ChatAttachment[];
  productId?: string;
  productTitle?: string;
}): Promise<ChatMessage> {
  return request('send', {
    method: 'POST',
    body: JSON.stringify({ ...input, sender: 'customer' }),
  });
}

export function sendAdminChatReply(conversationId: string, text: string): Promise<ChatMessage> {
  return request('send', {
    method: 'POST',
    body: JSON.stringify({ sender: 'admin', conversationId, text }),
  });
}

export function markChatConversationRead(conversationId: string): Promise<void> {
  return request('mark-read', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });
}

export function loginChatAdmin(username: string, password: string): Promise<{ username: string }> {
  return request('login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function verifyChatAdminSession(): Promise<{ username: string } | null> {
  return request<{ username: string }>('admin-session').catch((error: unknown) => {
    if (error instanceof Error && error.message === 'Not authenticated.') return null;
    throw error;
  });
}

export function logoutChatAdmin(): Promise<void> {
  return request('logout', { method: 'POST', body: JSON.stringify({}) });
}
