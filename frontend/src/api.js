const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

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
