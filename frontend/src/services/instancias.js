import { API_BASE, fetchWithToken } from './api';

export async function iniciarTramite({ id_tramite, maestro_nombre }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_tramite, maestro_nombre })
  });
}

export async function obtenerInstanciaDetalle(id_instancia) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/detalle?id=${id_instancia}`);
}

export async function guardarValor({ id_instancia, id_requisito, valor }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/llenar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_instancia, id_requisito, valor })
  });
}

export async function buscarInstanciasPorMaestro(q) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/buscar?q=${encodeURIComponent(q)}`);
}

/** NUEVO: listar instancias por tipo de trámite */
export async function listarInstanciasPorTramite(id_tramite) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/porTramite?id_tramite=${id_tramite}`);
}

export async function editarRequisito({ id_requisito, titulo, tipo, obligatorio }) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_requisito, titulo, tipo, obligatorio: !!obligatorio })
  });
}
