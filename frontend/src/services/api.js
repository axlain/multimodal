// src/services/api.js
export const API_BASE = 'http://localhost:8080';

/** Parseo robusto: intenta JSON; si falla, devuelve texto plano */
async function parseSmart(resp) {
  const text = await resp.text();
  try {
    return { json: text ? JSON.parse(text) : null, text };
  } catch {
    return { json: null, text };
  }
}

/** Header de autorización (útil para FormData y peticiones personalizadas) */
export function authHeader() {
  try {
    const token = localStorage.getItem('token'); // ajusta la clave si usas otra
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** Fetch sin token (para login/registro u otros públicos) */
export async function postJSON(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  const { json, text } = await parseSmart(resp);

  if (!resp.ok || (json && json.ok === false)) {
    const msg =
      (json && (json.error || json.message)) ||
      (text && text.slice(0, 280)) ||
      `${resp.status} ${resp.statusText}`;
    throw new Error(msg);
  }
  return json ?? {};
}

/**
 * Fetch con token (JSON). Si hay body, setea Content-Type: application/json.
 * Úsalo para GET/POST/PUT/DELETE con JSON.
 */
export async function fetchWithToken(url, opts = {}) {
  const token = localStorage.getItem('token');
  const { headers: h = {}, body } = opts;

  const headers = {
    ...(body != null ? { 'Content-Type': 'application/json' } : {}), // sólo si mandas JSON
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...h,
  };

  const resp = await fetch(url, { ...opts, headers });
  const { json, text } = await parseSmart(resp);

  if (!resp.ok || (json && json.ok === false)) {
    const msg =
      (json && (json.error || json.message)) ||
      (text && text.slice(0, 280)) ||
      `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return json ?? {};
}

/**
 * Fetch con token para FormData (subidas de archivo).
 * - NO establece Content-Type (el navegador lo define con boundary).
 * - Acepta headers extra vía opts.headers.
 * - Por defecto usa método POST (puedes sobreescribir con opts.method).
 */
export async function fetchWithTokenForm(url, formData, opts = {}) {
  const { headers: h = {}, method = 'POST', ...rest } = opts;
  const headers = { ...authHeader(), ...h }; // sin 'Content-Type'

  const resp = await fetch(url, { method, body: formData, headers, ...rest });
  const { json, text } = await parseSmart(resp);

  if (!resp.ok || (json && json.ok === false)) {
    const msg =
      (json && (json.error || json.message)) ||
      (text && text.slice(0, 280)) ||
      `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return json ?? {};
}
