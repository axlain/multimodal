import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearTramite } from '../services/tramite';

export default function TramiteNuevo() {
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
  }, []);
  const userAreaId = Number(usuario?.id_area || 0);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setErr('El nombre es requerido'); return; }
    if (!userAreaId) { setErr('No se detectó tu área. Vuelve a iniciar sesión.'); return; }
    try {
      setLoading(true); setErr(null);
      await crearTramite({ nombre: nombre.trim(), descripcion: descripcion || null, id_area: userAreaId });
      localStorage.setItem('selectedAreaId', String(userAreaId));
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
          <h3 className="modal-title">Nuevo trámite</h3>
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
              {loading ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
