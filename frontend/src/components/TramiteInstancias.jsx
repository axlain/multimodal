import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { listarInstanciasPorTramite, buscarInstanciasPorMaestro, iniciarTramite } from '../services/instancias';
import { generarConstancia } from '../services/tramite'; // ✅ importa desde el servicio

export default function TramiteInstancias() {
  const { id } = useParams(); // id_tramite
  const id_tramite = Number(id);
  const navigate = useNavigate();
  const { state } = useLocation();
  const tramite = state?.tramite || null;

  // Estados
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [tramiteEstado, setTramiteEstado] = useState('En proceso'); // 👈 estado del trámite

  // Título dinámico
  const titulo = useMemo(
    () => tramite?.nombre ? `${tramite.nombre} – Instancias` : `Trámite #${id_tramite} – Instancias`,
    [tramite, id_tramite]
  );

  // Cargar instancias y estado del trámite
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await listarInstanciasPorTramite(id_tramite);
        setItems(Array.isArray(res?.data) ? res.data : []);
        // Si el backend devuelve el estado_tramite en la respuesta:
        if (res?.estado_tramite) setTramiteEstado(res.estado_tramite);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id_tramite]);

  // Buscar instancias por nombre del maestro
  const doBuscar = async () => {
    setLoading(true);
    setErr(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Iniciar un nuevo trámite
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

  // Generar documento Word (constancia)
  const handleGenerarWord = async () => {
    try {
      setGenerando(true);
      await generarConstancia(id_tramite);
      alert('✅ Constancia generada correctamente');
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerando(false);
    }
  };

  // Mostrar botón solo si trámite está completado
  const tramiteCompletado = tramiteEstado === 'Completado';

  return (
    <div className="container section">
      <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        ← Volver
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h2 className="section-title" style={{ margin: 0 }}>{titulo}</h2>
        <button className="btn btn-primary" onClick={handleIniciar}>Iniciar nuevo</button>

        {/* 👇 Botón para generar Word si el trámite está completo */}
        {tramiteCompletado && (
          <button
            className="btn btn-success"
            onClick={handleGenerarWord}
            disabled={generando}
          >
            {generando ? 'Generando...' : 'Generar documento Word'}
          </button>
        )}
      </div>

      {/* Estado visual del trámite */}
      <p style={{
        color: tramiteCompletado ? 'green' : '#999',
        marginTop: 0,
        fontWeight: 600
      }}>
        Estado: {tramiteEstado}
      </p>

      {/* Barra de búsqueda */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre del docente…"
          />
          <button className="btn btn-outline" onClick={doBuscar}>Buscar</button>
          {!!q && (
            <button
              className="btn btn-outline"
              onClick={() => { setQ(''); doBuscar(); }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de instancias */}
      {loading ? (
        <p>Cargando…</p>
      ) : err ? (
        <p style={{ color: 'var(--accent)' }}>{err}</p>
      ) : items.length === 0 ? (
        <div className="card" style={{ borderStyle: 'dashed' }}>Sin instancias.</div>
      ) : (
        <div className="grid-cards">
          {items.map(it => (
            <div key={it.id_instancia} className="card">
              <div style={{ fontSize: 12, color: '#777' }}>Docente</div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{it.maestro_nombre}</div>

              <div style={{ fontSize: 12, color: '#777' }}>Estado</div>
              <div className="card-sub" style={{ marginBottom: 6 }}>{it.estado}</div>

              {!!it.created_at && (
                <>
                  <div style={{ fontSize: 12, color: '#777' }}>Creado</div>
                  <div>{it.created_at}</div>
                </>
              )}

              <div className="mt-12">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/instancias/${it.id_instancia}`)}
                >
                  Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
