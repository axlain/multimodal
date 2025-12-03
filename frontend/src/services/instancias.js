// src/services/instancias.js
import { API_BASE, fetchWithToken } from './api';

// --- helpers ---
function buildMaestroNombre(maestro) {
  if (!maestro) return '';
  return [maestro.nombre, maestro.ap_paterno, maestro.ap_materno]
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Crear instancia (payload “grande” del Dashboard).
 * Tu back hoy espera { id_tramite, maestro_nombre }, por eso traducimos aquí.
 */
export async function crearInstancia(payload) {
  const id_tramite = Number(payload?.id_tramite);
  const maestro_nombre =
    payload?.maestro_nombre ||
    buildMaestroNombre(payload?.maestro) ||
    'SIN NOMBRE';

  return fetchWithToken(`${API_BASE}/api/sitev/instancia/crear`, {
    method: 'POST',
    body: JSON.stringify({ id_tramite, maestro_nombre }),
  });
}

// (Opcional) Atajo equivalente al de arriba:
export async function iniciarTramite({ id_tramite, maestro_nombre }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/crear`, {
    method: 'POST',
    body: JSON.stringify({ id_tramite, maestro_nombre }),
  });
}

export async function obtenerInstanciaDetalle(id_instancia) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/detalle?id=${id_instancia}`);
}

export async function guardarValor({ id_instancia, id_requisito, valor }) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/llenar`, {
    method: 'POST',
    body: JSON.stringify({ id_instancia, id_requisito, valor }),
  });
}

export async function buscarInstanciasPorMaestro(q) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/buscar?q=${encodeURIComponent(q)}`);
}

/** Listar todas las instancias de un área, con filtros opcionales */
export async function listarInstancias({ id_area, q = '', tipo = '', maestro = '' }) {
  const params = new URLSearchParams({ id_area, q, tipo, maestro });
  return fetchWithToken(`${API_BASE}/api/sitev/instancias?${params.toString()}`);
}

/** Listar instancias por tipo de trámite específico */
export async function listarInstanciasPorTramite(id_tramite) {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/porTramite?id_tramite=${id_tramite}`);
}

// OJO: esto edita requisitos (si lo usas en otro flujo de admin)
export async function editarRequisito({ id_requisito, titulo, tipo, obligatorio }) {
  return fetchWithToken(`${API_BASE}/api/sitev/requisito/editar`, {
    method: 'PUT',
    body: JSON.stringify({ id_requisito, titulo, tipo, obligatorio: !!obligatorio }),
  });
}
export async function listarInstanciasUsuario() {
  return fetchWithToken(`${API_BASE}/api/sitev/instancia/mis`);
}

export async function finalizarInstancia(id_instancia) {
  const url = `${API_BASE}/api/sitev/instancia/finalizar`;
  return fetchWithToken(url, {
    method: 'POST',
    body: JSON.stringify({ id_instancia }),
  });
}
