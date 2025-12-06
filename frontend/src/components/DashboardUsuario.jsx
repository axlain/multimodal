import React, { useState, useEffect, useRef } from "react";
import useAuthUser from "../Hooks/useAuthUser";
import { theme as T } from "./usuario/ui";

import HeaderUsuario from "./usuario/HeaderUsuario";
import MaestroCard from "./usuario/MaestroCard";
import EscuelaCard from "./usuario/EscuelaCard";
import FechaPicker from "./usuario/FechaPicker";
import TramitePicker from "./usuario/TramitePicker";
import RequisitosForm from "./usuario/RequisitosForm";
import HistorialModal from "./usuario/HistorialModal";
import HistorialCards from "./usuario/HistorialCards";
import VoiceHelpModal from "./usuario/VoiceHelpModal";

import useVoiceController from "../voice/VoiceController.js";

import { crearInstancia } from "../services/instancias";
import { obtenerRequisitosPorTramite } from "../services/requisito";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function DashboardUsuario() {
  const { areaId, name } = useAuthUser();

  const [fecha, setFecha] = useState(todayStr());
  const [maestroForm, setMaestroForm] = useState({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    rfc: "",
    numero_de_personal: "",
  });

  const [maestroSel, setMaestroSel] = useState(null);

  const [escuelaForm, setEscuelaForm] = useState({ nombre: "", clave: "" });
  const [escuelaSel, setEscuelaSel] = useState(null);

  const [tramiteSel, setTramiteSel] = useState(null);
  const [listaTramites, setListaTramites] = useState([]);

  const [instancia, setInstancia] = useState(null);
  const [reqValues, setReqValues] = useState({});
  const [requisitos, setRequisitos] = useState([]);

  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  const [openHistorial, setOpenHistorial] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);

  const maestroRef = useRef(null);
  const escuelaRef = useRef(null);
  const historialRef = useRef(null);

  const [pendingSearch, setPendingSearch] = useState(null);

  // 🔥 ASISTENTE DE VOZ
  const voice = useVoiceController({
    onBuscarMaestroPorNombre: (nombre) =>
      maestroRef.current?.setSearch(nombre),

    onBuscarEscuelaPorNombre: (nombre) =>
      escuelaRef.current?.setSearch(nombre),

    onBuscarTramitePorTexto: (texto) => {
      setPendingSearch({ type: "texto", value: texto });
      setOpenHistorial(true);
    },

    onBuscarTramitePorMaestro: (nombre) => {
      setPendingSearch({ type: "maestro", value: nombre });
      setOpenHistorial(true);
    },

    onSetMaestroField: (campo, valor) => {
      setMaestroForm((prev) => ({ ...prev, [campo]: valor }));
    },

    onGuardarMaestro: () => {
      document.querySelector("#btn-guardar-maestro")?.click();
    },

    onSetEscuelaField: (campo, valor) => {
      setEscuelaForm((prev) => ({ ...prev, [campo]: valor }));
    },

    onGuardarEscuela: () => {
      document.querySelector("#btn-guardar-escuela")?.click();
    },
  });

  useEffect(() => {
    if (openHistorial && pendingSearch && historialRef.current) {
      historialRef.current.setSearch(pendingSearch.value);
      setPendingSearch(null);
    }
  }, [openHistorial, pendingSearch]);

  async function cargarRequisitos(id_tramite) {
    try {
      const list = await obtenerRequisitosPorTramite(id_tramite);
      setRequisitos(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Error al cargar requisitos:", e);
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

  async function handleGuardarInstancia() {
    setOkMsg(null);
    setErrMsg(null);

    if (!tramiteSel) return setErrMsg("Selecciona un trámite");
    if (!maestroSel && !maestroForm.nombre.trim())
      return setErrMsg("Debes capturar el nombre del maestro");
    if (!escuelaSel && !escuelaForm.nombre.trim())
      return setErrMsg("Debes capturar el nombre de la escuela");

    const payload = {
      id_tramite: tramiteSel.id,
      id_area: areaId,
      id_maestro: maestroSel?.id_maestro || null,
      id_escuela: escuelaSel?.id_escuela || null,
      maestro: maestroForm,
      escuela_actual: escuelaForm,
      fecha,
      datos_requisitos: reqValues,
    };

    try {
      setSaving(true);
      const res = await crearInstancia(payload);
      if (res?.id_instancia) {
        setInstancia(res);
        setOkMsg("Trámite guardado correctamente.");
      } else {
        setErrMsg("No se obtuvo ID de instancia.");
      }
    } catch (e) {
      setErrMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  function resetAllForms() {
    setTramiteSel(null);
    setMaestroForm({
      nombre: "",
      ap_paterno: "",
      ap_materno: "",
      rfc: "",
      numero_de_personal: "",
    });
    setMaestroSel(null);
    setEscuelaForm({ nombre: "", clave: "" });
    setEscuelaSel(null);
    setFecha(todayStr());
    setReqValues({});
    setInstancia(null);
    setOkMsg(null);
    setErrMsg(null);
  }

  function logout() {
    localStorage.clear();
    window.location.assign("/login");
  }

  return (
    <>
      {/* ======== CONTENIDO PRINCIPAL ======== */}
      <div
        style={{
          padding: 28,
          background: T.beige,
          color: T.black,
          fontSize: 18,
        }}
      >
        <HeaderUsuario
          areaId={areaId}
          userName={name}
          onLogout={logout}
          onOpenHistorial={() => setOpenHistorial(true)}
        />

        {/* Maestro + Escuela */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 20,
          }}
        >
          <MaestroCard
            ref={maestroRef}
            theme={T}
            form={maestroForm}
            onFormChange={setMaestroForm}
            selected={maestroSel}
            onSelect={setMaestroSel}
          />

          <div style={{ display: "grid", gap: 20 }}>
            <EscuelaCard
              ref={escuelaRef}
              theme={T}
              form={escuelaForm}
              onFormChange={setEscuelaForm}
              selected={escuelaSel}
              onSelect={setEscuelaSel}
            />
            <FechaPicker theme={T} value={fecha} onChange={setFecha} />
          </div>
        </div>

        {/* Trámite */}
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <section
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              width: "70%",
              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              maxHeight: "160px",
            }}
          >
            <div style={{ flex: 1 }}>
              <TramitePicker
                theme={T}
                areaId={areaId}
                selected={tramiteSel}
                onSelect={(t) => {
                  setTramiteSel(t);
                  setListaTramites((prev) =>
                    prev.some((x) => x.id === t.id) ? prev : [...prev, t]
                  );
                }}
              />
            </div>

            <button
              onClick={handleGuardarInstancia}
              disabled={saving}
              style={{
                background: T.redDark,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                minWidth: 200,
              }}
            >
              {saving ? "Guardando…" : "Guardar trámite"}
            </button>
          </section>
        </div>

        {/* Separador */}
        <div style={{ height: "30px" }} />
        <div
          style={{
            width: "100%",
            borderTop: "2px solid #ddd",
            margin: "35px 0 25px",
          }}
        />

        {/* Requisitos */}
        <section
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxHeight: "380px",
            overflowY: "auto",
            boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
          }}
        >
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
            onAfterConstancia={resetAllForms}
          />
        </section>

        {/* Historial */}
        <HistorialModal
          open={openHistorial}
          onClose={() => setOpenHistorial(false)}
          theme={T}
        >
          <HistorialCards ref={historialRef} theme={T} />
        </HistorialModal>

        {/* Guía de comandos */}
        <VoiceHelpModal open={openHelp} onClose={() => setOpenHelp(false)} />
      </div>

      {/* ======================= MIC + COMANDOS ======================= */}
      <div
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 5000,
        }}
      >
        {/* Botón comandos de voz */}
        <button
          onClick={() => setOpenHelp(true)}
          style={{
            background: "#ef4444",
            color: "white",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          Comandos de voz
        </button>

        {/* Micrófono */}
        <div
          onClick={() =>
            voice.listening ? voice.stopListening() : voice.startListening()
          }
          style={{
            width: "75px",
            height: "75px",
            borderRadius: "50%",
            background: voice.listening ? "#ef4444" : "white",
            border: "4px solid #ef4444",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
            transition: "0.25s",
          }}
        >
          🎤
        </div>
      </div>

      {/* Texto debajo del micrófono */}
      <div
        style={{
          position: "fixed",
          bottom: "-5px",
          right: "25px",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.9)",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          fontSize: "0.9rem",
          maxWidth: "250px",
          zIndex: 5000,
        }}
      >
        {voice.listening ? "Escuchando..." : "Toca para hablar"}
      </div>
    </>
  );
}
