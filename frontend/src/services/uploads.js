import { API_BASE, fetchWithTokenForm } from './api';

export async function subirArchivo({ id_instancia, id_tramite, id_requisito, archivo }) {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('id_instancia', id_instancia); // 👈 NUEVO
  formData.append('id_tramite', id_tramite);
  formData.append('id_requisito', id_requisito);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/sitev/archivo/subir`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return await res.json();
}
