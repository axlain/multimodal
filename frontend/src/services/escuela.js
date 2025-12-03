import { API_BASE, fetchWithToken } from './api';

export async function crearEscuela(payload) {
  const res = await fetchWithToken(`${API_BASE}/api/sitev/escuela/crear`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data; // { id_escuela }
}

export async function buscarEscuelas(q, limit = 20) {
  const res = await fetchWithToken(`${API_BASE}/api/sitev/escuela/buscar?q=${encodeURIComponent(q)}&limit=${limit}`, { method: 'GET' });
  return Array.isArray(res?.data) ? res.data : [];
}
