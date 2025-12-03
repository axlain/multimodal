import { API_BASE, fetchWithToken } from './api';

// ---------------- CRUD ----------------

export async function crearTramite({ nombre, descripcion, id_area }) {
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/crear`, {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion, id_area }),
  });
}

export async function editarTramite(id, payload) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/editar?${qs}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function eliminarTramite(id) {
  const qs = new URLSearchParams({ id: String(id) }).toString();
  return fetchWithToken(`${API_BASE}/api/sitev/tramite/eliminar?${qs}`, {
    method: 'DELETE',
  });
}

// -------------- LISTADOS ----------------
export async function tramitesPorArea(id_area) {
  const url = `${API_BASE}/api/sitev/tramite/porArea?id_area=${Number(id_area)}`;
  const r = await fetchWithToken(url, { method: 'GET' });

  const list = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : []);
  return list.map(t => ({
    id: Number(t.id ?? t.id_tramite),
    nombre: t.nombre ?? '',
    id_area: Number(t.id_area ?? t.area_id),
    descripcion: t.descripcion ?? '',
  }));
}

// 🛟 Fallback: prueba varias rutas/params y filtra si vino /todos
export async function tramitesPorAreaFallback(id_area) {
  const id = Number(id_area);
  const urls = [
    `${API_BASE}/api/sitev/tramite/porArea?id_area=${id}`,
    `${API_BASE}/api/sitev/tramite/porArea?id=${id}`,
    `${API_BASE}/api/sitev/tramite/porArea/${id}`,
    `${API_BASE}/api/sitev/tramite/todos`,
  ];

  for (const u of urls) {
    try {
      const r = await fetchWithToken(u, { method: 'GET' });
      const list = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : []);
      const mapped = list.map(t => ({
        id: Number(t.id ?? t.id_tramite),
        nombre: t.nombre ?? '',
        id_area: Number(t.id_area ?? t.area_id),
        descripcion: t.descripcion ?? '',
      }));
      if (u.endsWith('/todos')) {
        return mapped.filter(x => !id || x.id_area === id);
      }
      return mapped;
    } catch {
      // probar siguiente url
    }
  }
  return [];
}

// -------------- GENERAR CONSTANCIA ----------------
export const generarConstancia = async (idTramite) => {
  try {
    const res = await api.get(`/tramite/constancia/${idTramite}`, {
      responseType: "blob", // 👈 necesario para recibir archivo binario
    });

    // Crear URL temporal para descargar el archivo
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = window.URL.createObjectURL(blob);

    // Forzar descarga
    const a = document.createElement("a");
    a.href = url;
    a.download = `Constancia_Tramite_${idTramite}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Liberar URL temporal
    window.URL.revokeObjectURL(url);
    return { ok: true };
  } catch (error) {
    console.error("Error al generar constancia:", error);
    return {
      ok: false,
      error:
        error.response?.data?.error ||
        "No se pudo generar la constancia. Verifica tu conexión o permisos.",
    };
  }
};
