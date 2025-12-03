import { API_BASE, fetchWithToken } from '../services/api';
import { useEffect, useState } from 'react';

export default function useAreaName(areaId) {
  const [name, setName] = useState('');
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const r = await fetchWithToken(`${API_BASE}/api/sitev/area/obtenerTodas`, { method: 'GET' });
        const list = Array.isArray(r?.data) ? r.data : [];
        const a = list.find(x => Number(x.id ?? x.id_area) === Number(areaId));
        if (!abort) setName(a?.nombre || '');
      } catch {}
    })();
    return () => { abort = true; };
  }, [areaId]);
  return name;
}