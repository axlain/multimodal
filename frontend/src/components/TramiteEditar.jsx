import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { editarTramite, tramitesPorArea } from '../services/tramite';

export default function TramiteEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tramiteState = useLocation().state?.tramite;

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
  }, []);
  const userAreaId = Number(usuario?.id_area || 0);

  const [nombre, setNombre] = useState(tramiteState?.nombre || '');
  const [descripcion, setDescripcion] = useState(tramiteState?.descripcion || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    const traer = async () => {
      if (tramiteState || !userAreaId || !id) return;
      try {
        const res = await tramitesPorArea(userAreaId);
        const t = (res?.data || []).find(x => Number(x.id) === Number(id));
        if (t) { setNombre(t.nombre || ''); setDescripcion(t.descripcion || ''); }
      } catch {}
    };
    traer();
  }, [tramiteState, userAreaId, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setErr('El nombre es requerido'); return; }
    try {
      setLoading(true); setErr(null);
      await editarTramite(Number(id), { nombre: nombre.trim(), descripcion });
      navigate('/');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  };

  const cerrar = () => navigate(-1);

  return (
    <div className="modal-backdrop" onClick={cerrar}>
      <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">Editar trámite</h3>
          <button className="btn btn-outline" onClick={cerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="label">Nombre *</label>
          <input
            className="input"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre del trámite"
            maxLength={100}
            autoFocus
          />

          <label className="label">Descripción</label>
          <textarea
            className="input"
            rows={4}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describe brevemente el trámite"
          />

          {err && <p className="mt-12" style={{ color:'var(--accent-700)' }}>{err}</p>}

          <div className="mt-16" style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={cerrar} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
