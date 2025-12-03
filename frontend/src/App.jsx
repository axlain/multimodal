import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import "./index.css";
import "./styles/theme.css";
import "./styles/login.css";

import Login from "./components/Login";
import Logout from "./components/Logout";
import PrivateRoute from "./components/PrivateRoute";

// OJO: importa los archivos reales que tienes
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardUsuario from "./components/DashboardUsuario";

import TramiteNuevo from "./components/TramiteNuevo";
import TramiteEditar from "./components/TramiteEditar";
import InstanciaForm from "./components/InstanciaForm";
import TramiteInstancias from "./components/TramiteInstancias";

/** Helpers para decidir el destino según el rol (misma lógica que pusimos en Login) */
function base64urlDecode(str) {
  try {
    const pad = (s) => s + "=".repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(str.replace(/-/g, "+").replace(/_/g, "/"));
    return atob(b64);
  } catch { return ""; }
}
function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64urlDecode(payload));
  } catch { return null; }
}
function inferIsAdmin(user, token) {
  const v = (user?.rol ?? user?.role ?? user?.tipo ?? user?.perfil ?? "").toString().toLowerCase();
  if (["admin", "administrator", "administrador", "superadmin", "root"].includes(v)) return true;
  if (user?.is_admin === true || user?.is_admin === 1) return true;
  if (user?.admin === true || user?.admin === 1) return true;
  if (typeof user?.nivel_acceso !== "undefined" && Number(user.nivel_acceso) >= 90) return true;

  if (token) {
    const c = parseJwt(token) || {};
    const cv = (c.rol ?? c.role ?? c.tipo ?? c.perfil ?? "").toString().toLowerCase();
    if (["admin", "administrator", "administrador", "superadmin", "root"].includes(cv)) return true;
    if (c.is_admin === true || c.admin === true) return true;
    if (typeof c.nivel_acceso !== "undefined" && Number(c.nivel_acceso) >= 90) return true;
  }
  return false;
}

/** Si entran a '/', decide a dónde mandarlos según token+rol */
function HomeRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login", { replace: true }); return; }
    let user = {};
    try { user = JSON.parse(localStorage.getItem("usuario") || "{}"); } catch {}
    navigate(inferIsAdmin(user, token) ? "/dashboardAdmin" : "/dashboardUsuario", { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing: decide según rol */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Login / Logout */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Dashboards separados */}
        <Route
          path="/dashboardAdmin"
          element={<PrivateRoute element={<DashboardAdmin />} />}
        />
        <Route
          path="/dashboardUsuario"
          element={<PrivateRoute element={<DashboardUsuario />} />}
        />

        {/* Rutas (probablemente solo admin) */}
        <Route path="/tramites/nuevo" element={<PrivateRoute element={<TramiteNuevo />} />} />
        <Route path="/tramites/:id/editar" element={<PrivateRoute element={<TramiteEditar />} />} />
        <Route path="/instancias/:id" element={<PrivateRoute element={<InstanciaForm />} />} />
        <Route path="/tramites/:id/instancias" element={<PrivateRoute element={<TramiteInstancias />} />} />

        {/* 404 -> login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
