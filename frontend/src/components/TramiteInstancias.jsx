import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { listarInstanciasPorTramite, buscarInstanciasPorMaestro, iniciarTramite } from '../services/instancias';

export default function TramiteInstancias() {
  const { id } = useParams(); // id_tramite
  const id_tramite = Number(id);
  const navigate = useNavigate();
  const { state } = useLocation();
  const tramite = state?.tramite || null;

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const titulo = useMemo(
    () => tramite?.nombre ? `${tramite.nombre} – Instancias` : `Trámite #${id_tramite} – Instancias`,
    [tramite, id_tramite]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true); setErr(null);
      try {
        const res = await listarInstanciasPorTramite(id_tramite);
        setItems(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally { setLoading(false); }
    };
    load();
  }, [id_tramite]);

  const doBuscar = async () => {
    setLoading(true); setErr(null);
    try {
      if (!q.trim()) {
        const res = await listarInstanciasPorTramite(id_tramite);
        setItems(Array.isArray(res?.data) ? res.data : []);
      } else {
        const res = await buscarInstanciasPorMaestro(q.trim());
        const arr = Array.isArray(res?.data) ? res.data : [];
        setItems(arr.filter(x => Number(x.id_tramite) === id_tramite));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setItems([]);
    } finally { setLoading(false); }
  };

  const handleIniciar = async () => {
    const maestro = prompt('Nombre del docente para este trámite:');
    if (!maestro) return;
    try {
      const res = await iniciarTramite({ id_tramite, maestro_nombre: maestro });
      const id_instancia = Number(res?.id_instancia || 0);
      if (id_instancia > 0) navigate(`/instancias/${id_instancia}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="container section">
      <button className="btn btn-outline" onClick={()=>navigate(-1)} style={{ marginBottom: 12 }}>← Volver</button>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 8 }}>
        <h2 className="section-title" style={{ margin:0 }}>{titulo}</h2>
        <button className="btn btn-primary" onClick={handleIniciar}>Iniciar nuevo</button>
      </div>

      <div className="card" style={{ marginBottom:12 }}>
        <div style={{display:'flex', gap:8}}>
          <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nombre del docente…" />
          <button className="btn btn-outline" onClick={doBuscar}>Buscar</button>
          {!!q && <button className="btn btn-outline" onClick={()=>{ setQ(''); doBuscar(); }}>Limpiar</button>}
        </div>
      </div>

      {loading ? <p>Cargando…</p> : err ? (
        <p style={{color:'var(--accent)'}}>{err}</p>
      ) : items.length === 0 ? (
        <div className="card" style={{ borderStyle:'dashed' }}>Sin instancias.</div>
      ) : (
        <div className="grid-cards">
          {items.map(it => (
            <div key={it.id_instancia} className="card">
              <div style={{ fontSize:12, color:'#777' }}>Docente</div>
              <div style={{ fontWeight:800, marginBottom:6 }}>{it.maestro_nombre}</div>

              <div style={{ fontSize:12, color:'#777' }}>Estado</div>
              <div className="card-sub" style={{ marginBottom:6 }}>{it.estado}</div>

              {!!it.created_at && (
                <>
                  <div style={{ fontSize:12, color:'#777' }}>Creado</div>
                  <div>{it.created_at}</div>
                </>
              )}

              <div className="mt-12">
                <button className="btn btn-outline" onClick={()=>navigate(`/instancias/${it.id_instancia}`)}>Abrir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
