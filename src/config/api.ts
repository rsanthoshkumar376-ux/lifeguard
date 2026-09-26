const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('lifeguard_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('lifeguard_auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('lifeguard_auth_token');
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}
