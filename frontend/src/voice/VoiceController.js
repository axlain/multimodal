import { useEffect, useState } from "react";
import useSpeechRecognition from "../Hooks/useSpeechRecognition";
import useSpeechSynthesis from "../Hooks/useSpeechSynthesis";

/* ----------------------- UTILIDAD CAPITALIZAR ----------------------- */
function capitalizar(texto) {
  return texto
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/* -------------------------- SONIDO BEEP ----------------------------- */
function beep() {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="
  );
  audio.play();
}

export default function useVoiceController({
  onBuscarMaestroPorNombre,
  onBuscarEscuelaPorNombre,
  onBuscarTramitePorTexto,
  onBuscarTramitePorMaestro,

  onSetMaestroField,
  onGuardarMaestro,

  onSetEscuelaField,
  onGuardarEscuela,

  onCancelarTramite, // 🔥 callback real del Dashboard
}) {
  const {
    supported,
    listening,
    result,
    error,
    start,
    stop,
    resetResult,
  } = useSpeechRecognition({ lang: "es-MX" });

  const { speak } = useSpeechSynthesis({ lang: "es-MX" });

  const [transcripcion, setTranscripcion] = useState("");
  const [modo, setModo] = useState(null); // "maestro" | "escuela"
  const [paso, setPaso] = useState(null);

  /* Estado interno de confirmación */
  const confirmState = {
    esperando: false,
  };

  const solicitarConfirmacion = (msg, callback) => {
    speak(msg);
    confirmState.esperando = callback;
  };

  const procesarConfirmacion = (comando) => {
    const si = comando.includes("sí") || comando.includes("si") || comando.includes("confirmo");
    const no = comando.includes("no");

    if (si) {
      confirmState.esperando(true);
    } else {
      confirmState.esperando(false);
    }

    confirmState.esperando = false;
  };

  /* ======================================================================
     ============================ PROCESADOR ===============================
     ====================================================================== */
  useEffect(() => {
    if (!result) return;

    const comando = result.toLowerCase().trim();
    setTranscripcion(comando);

    /* --- Si está esperando confirmación --- */
    if (confirmState.esperando) {
      procesarConfirmacion(comando);
      resetResult();
      return;
    }

    /* =====================================================================
       ========================== CANCELAR TRÁMITE ==========================
       ===================================================================== */

    if (
      comando.includes("cancelar trámite") ||
      comando.includes("cancelar registro") ||
      comando.includes("cancelar todo")
    ) {
      solicitarConfirmacion("¿Seguro que deseas cancelar el trámite?", (ok) => {
        if (ok) {
          speak("Cancelando, limpiando el formulario.");
          onCancelarTramite?.();
          beep();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          speak("De acuerdo, continuamos.");
        }
      });

      resetResult();
      return;
    }

    /* =====================================================================
       ====================== REGISTRO GUIADO: MAESTRO ======================
       ===================================================================== */

    if (modo === "maestro") {
      if (comando.includes("cancelar")) {
        solicitarConfirmacion("¿Deseas cancelar el registro del maestro?", (ok) => {
          if (ok) {
            speak("Registro cancelado.");
            onCancelarTramite?.();
            beep();
            setModo(null);
            setPaso(null);
          } else {
            speak("Continuemos entonces.");
          }
        });
        resetResult();
        return;
      }

      if (paso === "nombre") {
        onSetMaestroField("nombre", capitalizar(comando));
        speak("Ahora indique el apellido paterno");
        setPaso("ap_paterno");
        resetResult();
        return;
      }

      if (paso === "ap_paterno") {
        onSetMaestroField("ap_paterno", capitalizar(comando));
        speak("Indique el apellido materno");
        setPaso("ap_materno");
        resetResult();
        return;
      }

      if (paso === "ap_materno") {
        onSetMaestroField("ap_materno", capitalizar(comando));
        speak("Indique el RFC del maestro");
        setPaso("rfc");
        resetResult();
        return;
      }

      if (paso === "rfc") {
        const limpio = comando
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/gi, "")
          .toUpperCase();

        onSetMaestroField("rfc", limpio);
        speak("Indique número de personal");
        setPaso("numero");
        resetResult();
        return;
      }

      if (paso === "numero") {
        const limpio = comando.replace(/\s+/g, "");
        onSetMaestroField("numero_de_personal", limpio);
        speak("Revise los datos. ¿Desea guardarlos?");
        setPaso("confirmar");
        resetResult();
        return;
      }

      if (paso === "confirmar") {
        if (comando.includes("sí") || comando.includes("guardar")) {
          speak("Guardando maestro");
          onGuardarMaestro();
        } else speak("De acuerdo, puede corregir los datos manualmente.");

        setModo(null);
        setPaso(null);
        resetResult();
        return;
      }
    }

    /* =====================================================================
       ====================== REGISTRO GUIADO: ESCUELA ======================
       ===================================================================== */

    if (modo === "escuela") {
      if (comando.includes("cancelar")) {
        solicitarConfirmacion("¿Deseas cancelar el registro de la escuela?", (ok) => {
          if (ok) {
            speak("Registro cancelado.");
            onCancelarTramite?.();
            beep();
            setModo(null);
            setPaso(null);
          } else {
            speak("Continuemos entonces.");
          }
        });
        resetResult();
        return;
      }

      if (paso === "nombre") {
        onSetEscuelaField("nombre", capitalizar(comando));
        speak("Indique la clave de la escuela");
        setPaso("clave");
        resetResult();
        return;
      }

      if (paso === "clave") {
        const limpio = comando
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/gi, "")
          .toUpperCase();

        onSetEscuelaField("clave", limpio);
        speak("Revise los datos. ¿Desea guardarlos?");
        setPaso("confirmar");
        resetResult();
        return;
      }

      if (paso === "confirmar") {
        if (comando.includes("sí") || comando.includes("guardar")) {
          speak("Guardando escuela");
          onGuardarEscuela();
        } else speak("De acuerdo, puede corregir los datos manualmente.");

        setModo(null);
        setPaso(null);
        resetResult();
        return;
      }
    }

    /* =====================================================================
       =========================== BÚSQUEDAS ===============================
       ===================================================================== */

    if (comando.startsWith("buscar maestro ")) {
      const nombre = capitalizar(comando.replace("buscar maestro", "").trim());
      speak(`Buscando maestro ${nombre}`);
      onBuscarMaestroPorNombre?.(nombre);
      resetResult();
      return;
    }

    if (comando.startsWith("buscar escuela ")) {
      const nombre = capitalizar(comando.replace("buscar escuela", "").trim());
      speak(`Buscando escuela ${nombre}`);
      onBuscarEscuelaPorNombre?.(nombre);
      resetResult();
      return;
    }

    if (
      comando.startsWith("buscar trámite ") ||
      comando.startsWith("buscar tramite ")
    ) {
      const texto = comando
        .replace("buscar trámite", "")
        .replace("buscar tramite", "")
        .trim();

      if (texto.startsWith("del maestro")) {
        const nombreMaestro = capitalizar(texto.replace("del maestro", "").trim());
        speak(`Buscando trámites del maestro ${nombreMaestro}`);
        onBuscarTramitePorMaestro?.(nombreMaestro);
      } else {
        const t = capitalizar(texto);
        speak(`Buscando trámite ${t}`);
        onBuscarTramitePorTexto?.(t);
      }
      resetResult();
      return;
    }

    /* ACTIVAR REGISTRO */
    if (comando === "registrar maestro") {
      speak("Diga el nombre del maestro");
      setModo("maestro");
      setPaso("nombre");
      resetResult();
      return;
    }

    if (comando === "registrar escuela") {
      speak("Diga el nombre de la escuela");
      setModo("escuela");
      setPaso("nombre");
      resetResult();
      return;
    }

    speak("No entendí el comando.");
    resetResult();
  }, [result]);

  return {
    supported,
    listening,
    transcripcion,
    error,
    startListening: start,
    stopListening: stop,
  };
}
