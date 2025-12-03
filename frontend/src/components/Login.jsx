import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, postJSON, fetchWithToken } from '../services/api';
import '../styles/login.css';

const styles = {
  card: {
    background: 'var(--card-bg)',
    border: '1.5px solid var(--border)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 14px 28px rgba(17,17,17,.08)',
  },
  titleWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
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
    whiteSpace: 'pre-wrap',
  },
};

// ==== helpers de rol/admin ====
function base64urlDecode(str) {
  try {
    const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(str.replace(/-/g, '+').replace(/_/g, '/'));
    return atob(b64);
  } catch { return ''; }
}
function parseJwt(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = base64urlDecode(payload);
    return JSON.parse(json);
  } catch { return null; }
}
function inferIsAdmin(user, token) {
  // 1) del objeto user
  const v =
    (user?.rol ?? user?.role ?? user?.tipo ?? user?.perfil ?? '').toString().toLowerCase();
  if (['admin', 'administrator', 'administrador', 'superadmin', 'root'].includes(v)) return true;
  if (user?.is_admin === true || user?.is_admin === 1) return true;
  if (user?.admin === true || user?.admin === 1) return true;
  if (typeof user?.nivel_acceso !== 'undefined' && Number(user.nivel_acceso) >= 90) return true;

  // 2) intentar desde el JWT
  if (token) {
    const claims = parseJwt(token) || {};
    const cv =
      (claims.rol ?? claims.role ?? claims.tipo ?? claims.perfil ?? '').toString().toLowerCase();
    if (['admin', 'administrator', 'administrador', 'superadmin', 'root'].includes(cv)) return true;
    if (claims.is_admin === true || claims.admin === true) return true;
    if (typeof claims.nivel_acceso !== 'undefined' && Number(claims.nivel_acceso) >= 90) return true;
  }
  return false;
}

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [areas, setAreas] = useState([]);
  const [idArea, setIdArea] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const navigate = useNavigate();
  const resetErrors = () => setError(null);

  /** Campos mínimos para habilitar el botón */
  const ready = useMemo(() => {
    if (!email || !password) return false;
    if (mode === 'register') {
      if (!password2 || password !== password2) return false;
      if (!idArea) return false;
    }
    return true;
  }, [mode, email, password, password2, idArea]);

  /** Cargar áreas cuando entras a "Registro" */
  useEffect(() => {
    let abort = false;
    const loadAreas = async () => {
      if (mode !== 'register') return;
      setLoadingAreas(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/sitev/area/obtenerTodas`;
        let json;
        try {
          json = await fetchWithToken(url, { method: 'GET' });
        } catch (e) {
          const resp = await fetch(url);
          const txt = await resp.text();
          let parsed = null; try { parsed = txt ? JSON.parse(txt) : null; } catch {}
          if (!resp.ok || (parsed && parsed.ok === false)) {
            const msg = (parsed && (parsed.error || parsed.message)) || txt || `${resp.status} ${resp.statusText}`;
            throw new Error(msg);
          }
          json = parsed ?? {};
        }

        const list = Array.isArray(json?.data) ? json.data : [];
        list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        if (abort) return;

        setAreas(list);
        if (list.length) setIdArea(String(list[0].id ?? list[0].id_area ?? ''));
        else setIdArea('');
      } catch (e) {
        if (!abort) {
          setAreas([]); setIdArea('');
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!abort) setLoadingAreas(false);
      }
    };
    loadAreas();
    return () => { abort = true; };
  }, [mode]);

  async function handleSubmit(e) {
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

      const payload = mode === 'login'
        ? { email, password }
        : { nombre, email, password, id_area: Number(idArea) };

      // login/registro: sin token
      const data = await postJSON(url, payload);

      // Soportar ambas formas del back
      const token = data?.token || data?.data?.token;
      if (token) localStorage.setItem('token', token);

      const user = data?.data || {};
      localStorage.setItem('usuario', JSON.stringify(user));
      if (user?.id)      localStorage.setItem('userId', String(user.id));
      if (user?.id_area) localStorage.setItem('areaId', String(user.id_area));

      // === NUEVO: decidir a dónde navegar según rol ===
      const isAdmin = inferIsAdmin(user, token);
      const dest = isAdmin ? '/dashboardAdmin' : '/dashboardUsuario';
      navigate(dest);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      let msg = raw;

      if (/credenciales/i.test(raw)) msg = 'Credenciales inválidas';
      else if (/faltan.+email/i.test(raw)) msg = 'Faltan email y/o password';
      else if (/ruta no encontrada/i.test(raw)) msg = 'Ruta no encontrada en el servidor';
      else if (/401|403/.test(raw)) msg = 'No autorizado. Verifica tus credenciales';
      else if (/parse error|syntax error|unexpected token/i.test(raw)) {
        msg = 'Error del servidor (parse/syntax). Revisa el router del API.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

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
              <input
                className="input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
              />

              <label className="label">Área</label>
              <select
                className="select"
                value={idArea}
                onChange={(e) => setIdArea(e.target.value)}
                required
                disabled={loadingAreas || areas.length === 0}
              >
                {areas.length === 0
                  ? <option value="">(No hay áreas disponibles)</option>
                  : areas.map(a => (
                      <option key={a.id ?? a.id_area} value={a.id ?? a.id_area}>
                        {a.nombre}
                      </option>
                    ))
                }
              </select>
              {loadingAreas && <small style={{ color: 'var(--muted)' }}>Cargando áreas…</small>}
            </>
          )}

          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tucorreo@dominio.com"
            autoComplete="email"
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <>
              <label className="label">Confirmar password</label>
              <input
                className="input"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
              />
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary mt-16"
            style={{ width: '100%' }}
            disabled={loading || !ready}
          >
            {loading ? 'Procesando…' : mode === 'login' ? 'Login' : 'Registrarme'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); }}
          className="btn mt-12"
          style={styles.switchBtn}
        >
          {mode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
