import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const API_BASE = 'http://localhost:8080';

async function postJson(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json?.ok === false) {
    const msg = json?.error || json?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(msg);
  }
  return json;
}

const styles = {
  card: {
    background: 'var(--card-bg)',
    border: '1.5px solid var(--border)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 14px 28px rgba(17,17,17,.08)',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  pill: {
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: 'color-mix(in srgb, var(--accent) 12%, white)',
    color: 'var(--accent)',
    border: '1px solid color-mix(in srgb, var(--accent) 35%, white)',
  },
  title: { margin: 0, color: 'var(--black)', fontSize: 32, fontWeight: 900 },
  sub: { marginTop: 4, color: 'var(--muted)' },
  switchBtn: {
    width: '100%',
    border: '1.5px solid var(--accent)',
    color: 'var(--accent)',
    background: 'var(--white)',
  },
  error: {
    marginTop: 12,
    color: 'var(--accent)',
    background: 'var(--red-50)',
    border: '1.5px solid var(--border)',
    padding: '10px 12px',
    borderRadius: 12,
  },
};

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [areas, setAreas] = useState([]);
  const [idArea, setIdArea] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const navigate = useNavigate();
  const resetErrors = () => setError(null);

  useEffect(() => {
    const load = async () => {
      if (mode !== 'register') return;
      setLoadingAreas(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_BASE}/api/sitev/area/obtenerTodas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) throw new Error('No se pudieron cargar las áreas.');
        const json = await resp.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        setAreas(list);
        if (list.length && !idArea) setIdArea(String(list[0].id));
      } catch (e) {
        setAreas([]); setIdArea('');
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingAreas(false);
      }
    };
    load();
  }, [mode, idArea]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetErrors();
    if (mode === 'register') {
      if (password !== password2) { setError('Las contraseñas no coinciden'); return; }
      if (!idArea) { setError('Selecciona un área'); return; }
    }
    try {
      setLoading(true);
      const url = mode === 'login'
        ? `${API_BASE}/api/sitev/usuario/login`
        : `${API_BASE}/api/sitev/usuario/registrar`;
      const body = mode === 'login'
        ? { email, password }
        : { nombre, email, password, id_area: Number(idArea) };
      const data = await postJson(url, body);

      const token = data?.token || data?.data?.token;
      if (token) localStorage.setItem('token', token);

      const user = data?.data || {};
      localStorage.setItem('usuario', JSON.stringify(user));
      if (user?.id)      localStorage.setItem('userId', String(user.id));
      if (user?.id_area) localStorage.setItem('areaId', String(user.id_area));

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={styles.card}>
        <div style={styles.titleWrap}>
          <span style={styles.pill}>{mode === 'login' ? 'Acceso' : 'Registro'}</span>
          <h1 style={styles.title}>{mode === 'login' ? 'Login' : 'Crear cuenta'}</h1>
        </div>
        <p style={styles.sub}>
          {mode === 'login' ? 'Ingresa con tu email y contraseña.' : 'Crea tu cuenta para empezar.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          {mode === 'register' && (
            <>
              <label className="label">Nombre</label>
              <input className="input" type="text" value={nombre} onChange={(e)=>setNombre(e.target.value)} required placeholder="Tu nombre"/>

              <label className="label">Área</label>
              <select className="select" value={idArea} onChange={(e)=>setIdArea(e.target.value)} required disabled={loadingAreas || areas.length===0}>
                {areas.length === 0
                  ? <option value="">(No hay áreas disponibles)</option>
                  : areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              {loadingAreas && <small style={{ color:'var(--muted)' }}>Cargando áreas…</small>}
            </>
          )}

          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="tucorreo@dominio.com" autoComplete="email"/>

          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete={mode==='login'?'current-password':'new-password'}/>

          {mode === 'register' && (
            <>
              <label className="label">Confirmar password</label>
              <input className="input" type="password" value={password2} onChange={(e)=>setPassword2(e.target.value)} required autoComplete="new-password"/>
            </>
          )}

          <button type="submit" className="btn btn-primary mt-16" style={{ width:'100%' }} disabled={loading || (mode==='register' && (!idArea || areas.length===0))}>
            {loading ? 'Procesando…' : mode === 'login' ? 'Login' : 'Registrarme'}
          </button>
        </form>

        <button onClick={()=>{ setMode(m=>m==='login'?'register':'login'); setError(null); }} className="btn mt-12" style={styles.switchBtn}>
          {mode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
