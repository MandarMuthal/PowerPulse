// Thin fetch wrapper used by every service. Talks only to our own /api proxy.
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request(path, { params, signal } = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  let res;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the PowerPulse server. Make sure it is running and try again.', { code: 'NETWORK' });
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status}).`, { status: res.status, code: body?.code });
  }
  return body;
}
