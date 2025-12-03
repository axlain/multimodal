import { API_BASE, fetchWithToken } from './api';

export async function crearMaestro(payload) {
  const res = await fetchWithToken(`${API_BASE}/api/sitev/maestro/crear`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data; // { id_maestro }
}

export async function buscarMaestros(q, limit = 20) {
  const res = await fetchWithToken(`${API_BASE}/api/sitev/maestro/buscar?q=${encodeURIComponent(q)}&limit=${limit}`, { method: 'GET' });
  return Array.isArray(res?.data) ? res.data : [];
}
