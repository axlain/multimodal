// src/Hooks/useAuthUser.js
export default function useAuthUser() {
  let usuario = {};
  try { 
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}'); 
  } catch (err) {
    console.error("Error al parsear el usuario desde localStorage", err);
  }

  const token = localStorage.getItem('token') || '';
  const areaId = Number(usuario?.id_area || localStorage.getItem('areaId') || 0);
  const name = usuario?.nombre || usuario?.email || 'Usuario';
  
  return { usuario, token, areaId, name };
}
