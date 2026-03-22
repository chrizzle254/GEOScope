import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
