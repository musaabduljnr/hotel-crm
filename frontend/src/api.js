function resolveBaseUrl() {
  const envUrl = (process.env.REACT_APP_API_URL || '').trim();
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn(
      'REACT_APP_API_URL is not set in this environment. Falling back to http://localhost:5000/api which will cause "Failed to fetch" on live sites.'
    );
  }

  return 'http://localhost:5000/api';
}

const BASE_URL = resolveBaseUrl();

function unwrapSuccessPayload(data) {
  if (!data || data.success === false) {
    return data;
  }

  const knownCollections = ['guests', 'bookings', 'rooms', 'complaints', 'feedback', 'notifications', 'payments', 'tickets'];
  const collectionKey = knownCollections.find((key) => Array.isArray(data[key]));
  if (collectionKey) {
    return data[collectionKey];
  }

  const collectionKeys = knownCollections.filter((key) => key in data);
  if (collectionKeys.length === 1) {
    return data[collectionKeys[0]];
  }

  return data;
}

// Thin wrapper around fetch: attaches the JWT (if present) and
// normalizes error handling so every screen can just `await api(...)`
// and catch a single Error with a readable message.
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (netErr) {
    if (netErr?.name === 'TypeError' || netErr?.message === 'Failed to fetch') {
      throw new Error(
        `Unable to reach backend API at ${BASE_URL}. If your backend is on Render free tier, it may be waking up (please wait 30s and retry). Otherwise check that REACT_APP_API_URL on Vercel and CORS settings on Render are configured.`
      );
    }
    throw netErr;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204) - fine
  }

  if (!res.ok) {
    const message = data?.error?.message || data?.message || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return unwrapSuccessPayload(data);
}

export const api = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  del: (path, token) => request(path, { method: 'DELETE', token })
};
