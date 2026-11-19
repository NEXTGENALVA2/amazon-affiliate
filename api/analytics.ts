import { ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import {
  AdminApiError,
  assertAdminRequestOrigin,
  readAdminRequestBody,
  requireAdmin,
  sendAdminJson,
} from '../server/admin-auth.js';
import type { AdminRequest } from '../server/admin-auth.js';

const DEVICES = new Set(['desktop', 'mobile', 'tablet']);
const PERIODS = new Set(['today', '7days', 'this_month', '30days', 'yearly', 'all']);

function getDatabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new AdminApiError(503, 'Analytics database is not configured on the server.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getPeriodStart(period: string): string | null {
  const now = new Date();
  const start = new Date(now);
  if (period === 'today') {
    start.setUTCHours(0, 0, 0, 0);
  } else if (period === '7days') {
    start.setUTCDate(start.getUTCDate() - 7);
    start.setUTCHours(0, 0, 0, 0);
  } else if (period === 'this_month') {
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
  } else if (period === '30days') {
    start.setUTCDate(start.getUTCDate() - 30);
    start.setUTCHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    start.setUTCMonth(0, 1);
    start.setUTCHours(0, 0, 0, 0);
  } else {
    return null;
  }
  return start.toISOString();
}

function boundedString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
    throw new AdminApiError(400, `Invalid ${name}.`);
  }
  return value;
}

function assertTrackingSession(sessionId: unknown): string {
  const value = boundedString(sessionId, 'session ID', 128);
  if (!/^[A-Za-z0-9_-]{12,128}$/.test(value)) {
    throw new AdminApiError(400, 'Invalid session ID.');
  }
  return value;
}

function assertAnalyticsTableConfigured(error: { code?: string; message?: string }): void {
  if (error.code === 'PGRST202' || error.code === '42P01' || error.message?.includes('analytics_events')) {
    throw new AdminApiError(503, 'Analytics database is not set up. Run supabase/analytics.sql in the Supabase SQL Editor.');
  }
  throw new AdminApiError(502, `Analytics database request failed: ${error.message || 'unknown error'}`);
}

export default async function handler(request: AdminRequest, response: ServerResponse): Promise<void> {
  try {
    if (request.method === 'POST') {
      if (!request.headers.origin) {
        throw new AdminApiError(403, 'Tracking request origin could not be verified.');
      }
      assertAdminRequestOrigin(request);
      const body = readAdminRequestBody(request);
      const type = body.type;
      const sessionId = assertTrackingSession(body.sessionId);
      const device = boundedString(body.device, 'device', 16);
      if (!DEVICES.has(device)) throw new AdminApiError(400, 'Invalid device.');

      const userAgent = request.headers['user-agent'] || '';
      if (/\b(bot|crawler|spider|slurp|headless|preview)\b/i.test(userAgent)) {
        response.statusCode = 204;
        response.end();
        return;
      }

      const row: Record<string, unknown> = {
        id: `visit_${sessionId}`,
        event_type: 'visitor',
        session_id: sessionId,
        device,
        page: typeof body.page === 'string' && body.page.startsWith('/')
          ? body.page.slice(0, 500)
          : '/',
      };

      if (type === 'outbound_click') {
        const eventId = boundedString(body.eventId, 'event ID', 160);
        if (!/^[A-Za-z0-9_-]+$/.test(eventId)) throw new AdminApiError(400, 'Invalid event ID.');
        const productId = boundedString(body.productId, 'product ID', 160);
        const productTitle = boundedString(body.productTitle, 'product title', 300);
        const targetUrl = boundedString(body.targetUrl, 'retailer URL', 2000);
        let parsedUrl: URL;
        try {
          parsedUrl = new URL(targetUrl);
        } catch {
          throw new AdminApiError(400, 'Invalid retailer URL.');
        }
        if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
          throw new AdminApiError(400, 'Retailer URL must be a public HTTPS link.');
        }
        row.id = `click_${eventId}`;
        row.event_type = 'outbound_click';
        row.product_id = productId;
        row.product_title = productTitle;
        row.target_url = parsedUrl.toString();
        row.browser = typeof body.browser === 'string' ? body.browser.slice(0, 40) : 'Other';
        delete row.page;
      } else if (type !== 'visitor') {
        throw new AdminApiError(400, 'Unknown analytics event type.');
      }

      const client = getDatabaseClient();
      if (type === 'outbound_click') {
        const { error: visitorError } = await client
          .from('analytics_events')
          .upsert({
            id: `visit_${sessionId}`,
            event_type: 'visitor',
            session_id: sessionId,
            device,
            page: '/',
          }, { onConflict: 'id', ignoreDuplicates: true });
        if (visitorError) assertAnalyticsTableConfigured(visitorError);
      }
      const { error } = await client
        .from('analytics_events')
        .upsert(row, { onConflict: 'id', ignoreDuplicates: true });
      if (error) assertAnalyticsTableConfigured(error);
      response.statusCode = 204;
      response.end();
      return;
    }

    if (request.method === 'GET') {
      requireAdmin(request);
      const url = new URL(request.url || '/api/analytics', 'http://localhost');
      const period = url.searchParams.get('period') || 'this_month';
      if (!PERIODS.has(period)) throw new AdminApiError(400, 'Invalid analytics period.');

      const client = getDatabaseClient();
      const { data, error } = await client.rpc('get_store_analytics', {
        p_since: getPeriodStart(period),
      });
      if (error) assertAnalyticsTableConfigured(error);
      sendAdminJson(response, 200, { data });
      return;
    }

    response.setHeader('Allow', 'GET, POST');
    throw new AdminApiError(405, 'Method not allowed.');
  } catch (error) {
    const status = error instanceof AdminApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Analytics request failed.';
    if (status >= 500) console.error('Analytics API request failed', error);
    sendAdminJson(response, status, { error: message });
  }
}
