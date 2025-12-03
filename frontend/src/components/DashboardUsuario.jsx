import React, { useState, useEffect } from 'react';
import useAuthUser from '../Hooks/useAuthUser';
import { theme as T } from './usuario/ui';
import HeaderUsuario from './usuario/HeaderUsuario';
import MaestroCard from './usuario/MaestroCard';
import EscuelaCard from './usuario/EscuelaCard';
import FechaPicker from './usuario/FechaPicker';
import TramitePicker from './usuario/TramitePicker';
import RequisitosForm from './usuario/RequisitosForm';
import HistorialModal from './usuario/HistorialModal';
import HistorialCards from './usuario/HistorialCards';

import { crearInstancia } from '../services/instancias';
import { obtenerRequisitosPorTramite } from '../services/requisito';

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function DashboardUsuario() {
  const { areaId, name } = useAuthUser();
  const [fecha, setFecha] = useState(todayStr());
  const [maestroForm, setMaestroForm] = useState({ nombre: '', ap_paterno: '', ap_materno: '', rfc: '' });
  const [maestroSel, setMaestroSel] = useState(null);
  const [escuelaForm, setEscuelaForm] = useState({ nombre: '', clave: '' });
  const [escuelaSel, setEscuelaSel] = useState(null);
  const [tramiteSel, setTramiteSel] = useState(null);
  const [instancia, setInstancia] = useState(null);
  const [reqValues, setReqValues] = useState({});
  const [requisitos, setRequisitos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [openHistorial, setOpenHistorial] = useState(false);

  // 🧠 Cargar requisitos del trámite seleccionado
  async function cargarRequisitos(id_tramite) {
    try {
      if (!id_tramite) {
        setErrMsg('El trámite seleccionado no es válido');
        return;
      }
      const list = await obtenerRequisitosPorTramite(id_tramite);
      setRequisitos(Array.isArray(list) ? list : []);
      if (!list?.length) setErrMsg('Este trámite no tiene requisitos configurados.');
      else setErrMsg(null);
    } catch (e) {
      console.error('Error al cargar los requisitos:', e);
      setRequisitos([]);
      setErrMsg('Hubo un error al cargar los requisitos.');
    }
  }

  useEffect(() => {
    if (tramiteSel?.id) {
      cargarRequisitos(tramiteSel.id);
      setReqValues({});
      setInstancia(null);
      setOkMsg(null);
      setErrMsg(null);
    }
  }, [tramiteSel]);

  //  Guardar el trámite (crear instancia)
  async function handleGuardarInstancia() {
    setOkMsg(null);
    setErrMsg(null);

    if (!tramiteSel) {
      setErrMsg('Selecciona un trámite');
      return;
    }
    if (!maestroSel && !maestroForm?.nombre?.trim()) {
      setErrMsg('Debes capturar el nombre del maestro.');
      return;
    }
    if (!escuelaSel && !escuelaForm?.nombre?.trim()) {
      setErrMsg('Debes capturar el nombre de la escuela.');
      return;
    }

    const payload = {
      id_tramite: tramiteSel.id,
      id_area: areaId,
      id_maestro: maestroSel?.id_maestro || null,
      id_escuela: escuelaSel?.id_escuela || null,
      maestro: {
        nombre: maestroForm.nombre.trim(),
        ap_paterno: maestroForm.ap_paterno.trim(),
        ap_materno: maestroForm.ap_materno.trim(),
        rfc: (maestroForm.rfc || '').toUpperCase().trim() || null,
      },
      escuela_actual: {
        nombre: escuelaForm.nombre.trim(),
        clave: (escuelaForm.clave || '').toUpperCase().trim() || null,
      },
      fecha,
      datos_requisitos: reqValues,
    };

    try {
      setSaving(true);
      const res = await crearInstancia(payload);
      console.log('🆕 Instancia creada:', res);

      if (res?.id_instancia) {
        setInstancia(res);
        setOkMsg('✅ Trámite guardado correctamente. Ya puedes subir los archivos.');
      } else {
        setErrMsg('No se pudo obtener el ID de la instancia.');
      }
    } catch (e) {
      console.error('Error al crear instancia:', e);
      setErrMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  // 🧹 Refrescar todo (para cuando se genera una constancia)
  function resetAllForms() {
    setTramiteSel(null);
    setMaestroForm({ nombre: '', ap_paterno: '', ap_materno: '', rfc: '' });
    setMaestroSel(null);
    setEscuelaForm({ nombre: '', clave: '' });
    setEscuelaSel(null);
    setFecha(todayStr());
    setReqValues({});
    setInstancia(null);
    setOkMsg(null);
    setErrMsg(null);
  }

  function logout() {
    localStorage.clear();
    window.location.assign('/login');
  }

  return (
    <div style={{ padding: 28, background: T.beige, color: T.black, fontSize: 18, lineHeight: 1.5 }}>
      <HeaderUsuario
        areaId={areaId}
        userName={name}
        onLogout={logout}
        onOpenHistorial={() => setOpenHistorial(true)}
      />

      {/* 🧑 Maestro y Escuela */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div>
          <MaestroCard
            theme={T}
            form={maestroForm}
            onFormChange={setMaestroForm}
            selected={maestroSel}
            onSelect={setMaestroSel}
          />
        </div>
        <div style={{ display: 'grid', gridAutoRows: 'auto', gap: 20 }}>
          <EscuelaCard
            theme={T}
            form={escuelaForm}
            onFormChange={setEscuelaForm}
            selected={escuelaSel}
            onSelect={setEscuelaSel}
          />
          <FechaPicker theme={T} value={fecha} onChange={setFecha} />
        </div>
      </div>

      {/* 📑 Tramite + Guardar */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <section
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            width: '70%', // 📏 más ancho
            boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <TramitePicker
              theme={T}
              areaId={areaId}
              selected={tramiteSel}
              onSelect={setTramiteSel}
            />
          </div>

          <button
            onClick={handleGuardarInstancia}
            disabled={saving}
            style={{
              background: T.redDark,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              minWidth: 200,
            }}
            onMouseEnter={(e) => (e.target.style.background = T.red)}
            onMouseLeave={(e) => (e.target.style.background = T.redDark)}
          >
            {saving ? 'Guardando…' : 'Guardar trámite'}
          </button>
        </section>
      </div>

      {/* 📎 Requisitos */}
      <div style={{ marginTop: 20 }}>
        <RequisitosForm
          theme={T}
          tramite={{
            id: tramiteSel?.id,
            id_instancia: instancia?.id_instancia,
          }}
          requisitos={requisitos}
          values={reqValues}
          onChange={setReqValues}
          saving={saving}
          okMsg={okMsg}
          errMsg={errMsg}
          // ⚡ al generar constancia, refresca todo el formulario
          onAfterConstancia={() => resetAllForms()}
        />
      </div>

      {/* 📜 Historial */}
      <HistorialModal open={openHistorial} onClose={() => setOpenHistorial(false)} theme={T}>
        <HistorialCards theme={T} />
      </HistorialModal>
    </div>
  );
}
