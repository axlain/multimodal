// src/services/tramite.js
import { API_BASE, fetchWithToken } from './api';

// Crear
export async function crearTramite({ nombre, descripcion, id_area }) {
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/crear`, {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion, id_area }),
  });
}

// Editar
export async function editarTramite(id, payload) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/editar?${qs}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Eliminar
export async function eliminarTramite(id) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/eliminar?${qs}`, {
    method: 'DELETE',
  });
}

// (opcional) Listar por área
export async function tramitesPorArea(id_area) {
  const qs = new URLSearchParams({ id: String(id_area) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/porArea?${qs}`);
}
