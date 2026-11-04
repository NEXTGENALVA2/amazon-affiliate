import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface AdminRequest extends IncomingMessage {
  body?: unknown;
}

export class AdminApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const SESSION_COOKIE = 'kefayaan_admin_session';
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const loginAttempts = new Map<string, number[]>();

export function sendAdminJson(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

export function readAdminRequestBody(request: AdminRequest): Record<string, unknown> {
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
      throw new AdminApiError(400, 'Request body must be valid JSON.');
    }
  }
  return {};
}

export function assertAdminRequestOrigin(request: AdminRequest): void {
  const origin = request.headers.origin;
  if (!origin) return;

  const forwardedHost = request.headers['x-forwarded-host'];
  const expectedHost = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || request.headers.host;
  if (!expectedHost) throw new AdminApiError(403, 'Request origin could not be verified.');

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AdminApiError(403, 'Request origin could not be verified.');
  }
  if (originHost.toLowerCase() !== expectedHost.toLowerCase()) {
    throw new AdminApiError(403, 'Cross-origin admin requests are not allowed.');
  }
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CHAT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new AdminApiError(503, 'Admin authentication is not configured on the server.');
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
  return `${SESSION_COOKIE}=${payload}.${signSession(payload)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function clearAdminSession(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secure}`;
}

export function getAdminUsername(request: AdminRequest): string | null {
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
    if (typeof session.username !== 'string' || typeof session.expiresAt !== 'number' || session.expiresAt <= Date.now()) {
      return null;
    }
    return session.username;
  } catch {
    return null;
  }
}

export function requireAdmin(request: AdminRequest): string {
  const username = getAdminUsername(request);
  if (!username) throw new AdminApiError(401, 'Not authenticated.');
  return username;
}

export function enforceAdminLoginRateLimit(request: AdminRequest): void {
  const forwardedFor = request.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (loginAttempts.get(ip) || []).filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  if (recent.length >= 5) throw new AdminApiError(429, 'Too many login attempts. Please try again later.');
  recent.push(now);
  loginAttempts.set(ip, recent);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const configuredUsername = process.env.ADMIN_USERNAME || process.env.CHAT_ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD || process.env.CHAT_ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) {
    throw new AdminApiError(503, 'Admin authentication is not configured on the server.');
  }
  const expected = createHash('sha256').update(`${configuredUsername}\0${configuredPassword}`).digest();
  const received = createHash('sha256').update(`${username}\0${password}`).digest();
  return timingSafeEqual(expected, received);
}
