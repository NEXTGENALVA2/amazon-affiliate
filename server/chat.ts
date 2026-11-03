import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ChatRequest extends IncomingMessage {
  body?: unknown;
}

export class ChatApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const SESSION_COOKIE = 'kefayaan_chat_session';
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const rateLimits = new Map<string, number[]>();

export function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

export function readRequestBody(request: ChatRequest): Record<string, unknown> {
  const body = request.body;
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    return body as Record<string, unknown>;
  }

  const rawBody = Buffer.isBuffer(body) ? body.toString('utf8') : body;
  if (typeof rawBody === 'string') {
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      throw new ChatApiError(400, 'Request body must be valid JSON.');
    }
  }
  return {};
}

export function assertSameOrigin(request: ChatRequest): void {
  const origin = request.headers.origin;
  if (!origin) return;

  const forwardedHost = request.headers['x-forwarded-host'];
  const expectedHost = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || request.headers.host;
  if (!expectedHost) throw new ChatApiError(403, 'Request origin could not be verified.');

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ChatApiError(403, 'Request origin could not be verified.');
  }
  if (originHost.toLowerCase() !== expectedHost.toLowerCase()) {
    throw new ChatApiError(403, 'Cross-origin chat requests are not allowed.');
  }
}

export function enforceRateLimit(request: ChatRequest, action: string, limit: number, windowMs: number): void {
  const forwardedFor = request.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0].trim() || 'unknown';
  const key = `${action}:${ip}`;
  const now = Date.now();
  const recent = (rateLimits.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) throw new ChatApiError(429, 'Too many requests. Please try again later.');
  recent.push(now);
  rateLimits.set(key, recent);
}

function getSessionSecret(): string {
  const secret = process.env.CHAT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new ChatApiError(503, 'Chat admin authentication is not configured on the server.');
  }
  return secret;
}

function signSession(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createAdminSession(username: string): string {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  })).toString('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${payload}.${signSession(payload)}; HttpOnly; SameSite=Strict; Path=/api/chat; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function clearAdminSession(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/chat; Max-Age=0${secure}`;
}

export function getAdminUsername(request: ChatRequest): string | null {
  const cookieHeader = request.headers.cookie || '';
  const value = cookieHeader.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  let expectedSignature: string;
  try {
    expectedSignature = signSession(payload);
  } catch {
    return null;
  }
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      username?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof session.username !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now()
    ) return null;
    return session.username;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const configuredUsername = process.env.CHAT_ADMIN_USERNAME;
  const configuredPassword = process.env.CHAT_ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) {
    throw new ChatApiError(503, 'Chat admin authentication is not configured on the server.');
  }
  const expected = createHash('sha256').update(`${configuredUsername}\0${configuredPassword}`).digest();
  const received = createHash('sha256').update(`${username}\0${password}`).digest();
  return timingSafeEqual(expected, received);
}

export function requireAdmin(request: ChatRequest): string {
  const username = getAdminUsername(request);
  if (!username) throw new ChatApiError(401, 'Not authenticated.');
  return username;
}

export function getChatAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new ChatApiError(503, 'Chat database is not configured on the server.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function validateVisitorId(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(value)) {
    throw new ChatApiError(400, 'A valid visitor ID is required.');
  }
  return value;
}
