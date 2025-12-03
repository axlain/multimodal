// src/services/files.js
import { getAuthToken } from './api';

function isHtmlLike(ct = '') {
  return /text\/html|application\/xhtml\+xml/i.test(ct);
}
function isJson(ct = '') {
  return /application\/json/i.test(ct);
}

/**
 * Descarga autenticado y devuelve:
 *  - blobUrl (con type correcto)
 *  - contentType
 */
export async function getBlobUrlWithAuth(url) {
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}`, Accept: '*/*' } : { Accept: '*/*' },
    credentials: 'include',
  });

  const ct = res.headers.get('Content-Type') || '';
  if (!res.ok) {
    // Intenta mostrar cuerpo de error legible
    let more = '';
    try { more = (await res.text()).slice(0, 180); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}. ${more}`);
  }

  // Si el servidor redirige a login, suele venir HTML
  if (isHtmlLike(ct)) {
    const text = await res.text();
    throw new Error('El servidor respondió HTML (posible login/redirección). No es un PDF/imagen válido.');
  }

  // Usa arrayBuffer para crear Blob con el tipo correcto
  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: ct || 'application/octet-stream' });
  const blobUrl = URL.createObjectURL(blob);

  return { blobUrl, contentType: ct };
}

export async function openInNewTabAuth(url) {
  const { blobUrl } = await getBlobUrlWithAuth(url);
  const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
  if (!win) console.warn('Ventana bloqueada por el navegador');
}

/** Descarga forzada usando blob y nombre sugerido */
export async function downloadWithAuth(url, filename = 'archivo') {
  const { blobUrl } = await getBlobUrlWithAuth(url);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // No revocar inmediatamente; da tiempo a que el navegador lea el blob
  setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
}
