interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(action: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin-auth?action=${encodeURIComponent(action)}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Admin API is unavailable. Check the deployment and try again.');
  }
  const result = await response.json() as ApiResponse<T>;
  if (!response.ok) throw new Error(result.error || `Admin request failed (${response.status}).`);
  return result.data as T;
}

export function loginAdmin(username: string, password: string): Promise<{ username: string }> {
  return request('login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function verifyAdminSession(): Promise<{ username: string } | null> {
  return request<{ username: string }>('session').catch((error: unknown) => {
    if (error instanceof Error && error.message === 'Not authenticated.') return null;
    throw error;
  });
}

export function logoutAdmin(): Promise<void> {
  return request('logout', { method: 'POST', body: JSON.stringify({}) });
}
