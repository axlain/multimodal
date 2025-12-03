// src/services/api.js
export const API_BASE = 'http://localhost:8080';

export async function fetchWithToken(url, opts = {}) {
  const token = localStorage.getItem('token');
  const { headers: h = {}, body } = opts;

  const headers = {
    ...(body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...h,
  };

  const resp = await fetch(url, { ...opts, headers });

  // Lee texto primero para soportar respuestas no-JSON
  const text = await resp.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }

  if (!resp.ok || (json && json.ok === false)) {
    const msg = (json && (json.error || json.message)) || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return json ?? {};
}
