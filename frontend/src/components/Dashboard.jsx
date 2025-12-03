import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, fetchWithToken } from '../services/api.js';
import { iniciarTramite, buscarInstanciasPorMaestro } from '../services/instancias';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- State
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [userAreaId, setUserAreaId] = useState(null);
  const [userAreaNombre, setUserAreaNombre] = useState('');
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Buscador por maestro (global)
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // --- Usuario
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
  }, []);
  const nombreUsuario = usuario?.nombre || usuario?.email || 'Usuario';

  // --- Helpers
  const loadTramitesForArea = async (idArea) => {
    const idNum = Number(idArea);
    setLoading(true); setErr(null);
    try {
      const t = await fetchWithToken(`${API_BASE}/api/sitev/area/tramites?id=${idNum}`);
      const lista = Array.isArray(t?.data) ? t.data : [];
      lista.sort((x, y) => (x?.nombre || '').localeCompare(y?.nombre || ''));
      setTramites(lista);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setTramites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArea = async (idArea) => {
    const idNum = Number(idArea);
    if (idNum === Number(selectedAreaId)) return;
    setSelectedAreaId(idNum);
    localStorage.setItem('selectedAreaId', String(idNum));
    await loadTramitesForArea(idNum);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    localStorage.removeItem('areaId');
    localStorage.removeItem('selectedAreaId');
    navigate('/login');
  };

  // --- Bootstrap
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const bootstrap = async () => {
      setLoadingAreas(true); setErr(null);
      try {
        // 1) Áreas para navbar
        const resAreas = await fetchWithToken(`${API_BASE}/api/sitev/area/obtenerTodas`);
        const lista = Array.isArray(resAreas?.data) ? resAreas.data : [];
        lista.sort((a, b) => (a?.nombre || '').localeCompare(b?.nombre || ''));
        setAreas(lista);

        // 2) Área del usuario (header)
        const uaId = Number(usuario?.id_area || 0);
        setUserAreaId(uaId);
        if (uaId > 0) {
          try {
            const a = await fetchWithToken(`${API_BASE}/api/sitev/area/mostrarNombre?id=${uaId}`);
            setUserAreaNombre(a?.nombre || '');
          } catch {
            setUserAreaNombre('');
          }
        }

        // 3) Área seleccionada inicial
        const storedSelected = Number(localStorage.getItem('selectedAreaId') || 0);
        const firstAreaId = Number(lista[0]?.id || 0);
        const initialId = uaId > 0 ? uaId : (storedSelected > 0 ? storedSelected : firstAreaId);

        if (initialId > 0) {
          const initNum = Number(initialId);
          setSelectedAreaId(initNum);
          localStorage.setItem('selectedAreaId', String(initNum));
          await loadTramitesForArea(initNum);
        } else {
          setErr('No hay áreas configuradas');
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingAreas(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // --- Derivados
  const selId = Number(selectedAreaId ?? 0);
  const myId = Number(userAreaId ?? 0);
  const soloConsulta = myId > 0 && selId > 0 && selId !== myId;

  // --- Acciones
  const onIniciar = async (id_tramite) => {
    if (soloConsulta) return;
    const maestro = prompt('Nombre del maestro para este trámite:');
    if (!maestro) return;
    try {
      const res = await iniciarTramite({ id_tramite, maestro_nombre: maestro });
      const id_instancia = Number(res?.id_instancia || 0);
      if (id_instancia > 0) navigate(`/instancias/${id_instancia}`);
      else alert('No se pudo iniciar el trámite');
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const doBuscar = async () => {
    setBuscando(true); setErr(null);
    try {
      const res = await buscarInstanciasPorMaestro(q.trim());
      setResultados(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  // --- UI
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container app-header-inner">
          <div>
            <div style={{ fontSize: 12, color: '#777' }}>Área</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{userAreaNombre || '—'}</div>

            {selId && selId !== myId && (
              <div style={{ fontSize: 12, color: '#999' }}>
                Consultando: {areas.find(a => Number(a.id) === selId)?.nombre || '—'}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#777' }}>Usuario</div>
            <div style={{ fontWeight: 700 }}>{nombreUsuario}</div>
            <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>

        {/* NAVBAR de Áreas */}
        <nav className="areas-nav">
          <div className="container areas-nav-inner">
            {loadingAreas ? (
              <span>Cargando áreas…</span>
            ) : areas.length === 0 ? (
              <span style={{ color: '#C92C2C' }}>Sin áreas</span>
            ) : (
              <ul className="areas-list" role="tablist">
                {areas.map(a => {
                  const aId = Number(a.id);
                  return (
                    <li key={aId}>
                      <button
                        role="tab"
                        aria-selected={selId === aId}
                        className={`areas-chip ${selId === aId ? 'active' : ''}`}
                        onClick={() => handleSelectArea(aId)}
                        title={a.descripcion || a.nombre}
                      >
                        {a.nombre}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="app-main">
        <div className="container section">
          {/* Buscador global por maestro */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="card-title">Buscar instancias por maestro</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="input"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={doBuscar} disabled={buscando || !q.trim()}>
                {buscando ? 'Buscando…' : 'Buscar'}
              </button>
              {!!q && (
                <button className="btn btn-outline" onClick={() => { setQ(''); setResultados([]); }}>
                  Limpiar
                </button>
              )}
            </div>

            {resultados.length > 0 && (
              <ul className="mt-12">
                {resultados.map(r => (
                  <li key={r.id_instancia} style={{ marginBottom: 6 }}>
                    <button className="btn btn-outline" onClick={() => navigate(`/instancias/${r.id_instancia}`)}>
                      #{r.id_instancia} – {r.nombre_tramite} – {r.maestro_nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {loading ? (
            <p>Cargando…</p>
          ) : err ? (
            <p style={{ color: '#C92C2C' }}>{err}</p>
          ) : (
            <>
              <h2 className="section-title">Trámites disponibles</h2>

              {!soloConsulta && (
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h3 className="card-title">Nuevo trámite</h3>
                  <p className="card-sub">Crear una solicitud desde cero.</p>
                  <button
                    className="btn btn-primary mt-12"
                    onClick={() => navigate('/tramites/nuevo')}
                  >
                    +
                  </button>
                </div>
              )}

              {tramites.length === 0 ? (
                <div className="card" style={{ borderStyle:'dashed' }}>
                  <p className="card-sub">No hay trámites para esta área.</p>
                </div>
              ) : (
                tramites.map(t => (
                  <div key={t.id} className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title">{t.nombre || `Trámite #${t.id}`}</h3>
                    <p className="card-sub">{t.descripcion || 'Sin descripción.'}</p>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <button
                        className={`btn btn-primary ${soloConsulta ? 'btn-disabled' : ''}`}
                        disabled={!!soloConsulta}
                        title={soloConsulta ? 'Solo consulta en áreas ajenas' : 'Iniciar trámite'}
                        onClick={() => onIniciar(t.id)}
                      >
                        Iniciar
                      </button>

                      <button
                        className="btn btn-outline"
                        title="Ver instancias de este trámite"
                        onClick={() => navigate(`/tramites/${t.id}/instancias`, { state: { tramite: t } })}
                      >
                        Ver instancias
                      </button>

                      {!soloConsulta && (
                        <>
                          <button
                            className="btn btn-outline"
                            title="Editar trámite"
                            onClick={() => navigate(`/tramites/${t.id}/editar`, { state: { tramite: t } })}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-danger"
                            title="Eliminar trámite"
                            onClick={async () => {
                              if (!confirm(`¿Eliminar el trámite "${t.nombre}"?`)) return;
                              try {
                                const { eliminarTramite } = await import('../services/tramite');
                                await eliminarTramite(t.id);
                                await loadTramitesForArea(selectedAreaId);
                              } catch (e) {
                                alert(e instanceof Error ? e.message : String(e));
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
