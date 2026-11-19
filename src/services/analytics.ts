import type { OutboundClick } from '../types';

export type AnalyticsPeriod = 'today' | '7days' | 'this_month' | '30days' | 'yearly' | 'all';

export interface AnalyticsSummary {
  totalVisitors: number;
  uniqueSessions: number;
  totalClicks: number;
  clickRate: string;
  timeSeries: Array<{ date: string; visitors: number; clicks: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  topClickedProducts: Array<{ id: string; title: string; clicks: number }>;
  recentClicks: OutboundClick[];
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export function emptyAnalyticsSummary(): AnalyticsSummary {
  return {
    totalVisitors: 0,
    uniqueSessions: 0,
    totalClicks: 0,
    clickRate: '0.0',
    timeSeries: [],
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    topClickedProducts: [],
    recentClicks: [],
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as ApiResponse<unknown>;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function recordAnalyticsEvent(event: Record<string, unknown>): Promise<void> {
  const response = await fetch('/api/analytics', {
    method: 'POST',
    credentials: 'same-origin',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error(await readError(response, `Analytics event was rejected (${response.status}).`));
  }
}

export async function fetchAnalytics(period: AnalyticsPeriod): Promise<AnalyticsSummary> {
  const response = await fetch(`/api/analytics?period=${encodeURIComponent(period)}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Analytics API is unavailable. Check the deployment and database setup.');
  }
  const body = await response.json() as ApiResponse<AnalyticsSummary>;
  if (!response.ok) {
    throw new Error(body.error || `Analytics request failed (${response.status}).`);
  }
  if (!body.data) throw new Error('Analytics API returned an empty response.');
  return body.data;
}
