// Thin wrapper around fetch() that talks to the Spring Boot backend.
// Because of the proxy in vite.config.js, "/api/..." is forwarded to
// http://localhost:8080/api/... automatically — no CORS setup needed.

const TOKEN_KEY = "technova_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. network failure before the server responded)
  }

  if (!res.ok || (body && body.code && body.code !== 200)) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body ? body.data : null;
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  del: (path) => request(path, { method: "DELETE" }),
};
