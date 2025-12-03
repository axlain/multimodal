// src/services/requisito.js
import { API_BASE, fetchWithToken } from './api';

export async function agregarRequisito({ id_tramite, titulo, tipo, obligatorio, orden = 1 }) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_tramite: Number(id_tramite),
      titulo,
      tipo,
      obligatorio: !!obligatorio,
      orden: Number(orden),
    }),
  });
}

export async function editarRequisito({ id_requisito, titulo, tipo, obligatorio, orden }) {
  // El backend quiere { id_requisito, data: {...} }
  const data = {};
  if (typeof titulo !== 'undefined') data.titulo = titulo;
  if (typeof tipo !== 'undefined') data.tipo = tipo;
  if (typeof obligatorio !== 'undefined') data.obligatorio = !!obligatorio;
  if (typeof orden !== 'undefined') data.orden = Number(orden);

  return fetchWithToken(`${API_BASE}/api/sitev/requisito/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_requisito: Number(id_requisito),
      data,
    }),
  });
}

export async function eliminarRequisito(id_requisito) {
  // DELETE con body JSON (no usar query ?id=)
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/eliminar`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_requisito: Number(id_requisito) }),
  });
}
