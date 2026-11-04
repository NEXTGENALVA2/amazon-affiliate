import { ServerResponse } from 'node:http';
import {
  AdminApiError,
  assertAdminRequestOrigin,
  clearAdminSession,
  createAdminSession,
  enforceAdminLoginRateLimit,
  getAdminUsername,
  readAdminRequestBody,
  sendAdminJson,
  verifyAdminCredentials,
} from '../server/admin-auth.js';
import type { AdminRequest } from '../server/admin-auth.js';

function getAction(request: AdminRequest): string | null {
  return new URL(request.url || '/', 'https://local.invalid').searchParams.get('action');
}

export default async function handler(request: AdminRequest, response: ServerResponse): Promise<void> {
  try {
    const action = getAction(request);
    if (request.method === 'GET' && action === 'session') {
      const username = getAdminUsername(request);
      if (!username) throw new AdminApiError(401, 'Not authenticated.');
      response.setHeader('Set-Cookie', createAdminSession(username));
      sendAdminJson(response, 200, { data: { username } });
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      throw new AdminApiError(405, 'Method not allowed.');
    }

    assertAdminRequestOrigin(request);
    if (action === 'login') {
      enforceAdminLoginRateLimit(request);
      const body = readAdminRequestBody(request);
      const username = typeof body.username === 'string' ? body.username.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!verifyAdminCredentials(username, password)) {
        throw new AdminApiError(401, 'Invalid Admin ID or Password.');
      }
      response.setHeader('Set-Cookie', createAdminSession(username));
      sendAdminJson(response, 200, { data: { username } });
      return;
    }

    if (action === 'logout') {
      response.setHeader('Set-Cookie', clearAdminSession());
      sendAdminJson(response, 200, { data: null });
      return;
    }

    throw new AdminApiError(404, 'Unknown admin action.');
  } catch (error) {
    if (error instanceof AdminApiError) {
      sendAdminJson(response, error.status, { error: error.message });
      return;
    }
    console.error('Admin authentication request failed', error);
    sendAdminJson(response, 500, { error: 'Admin request failed. Please try again later.' });
  }
}
