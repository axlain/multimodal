import { useEffect, useState } from "react";
import useSpeechRecognition from "../Hooks/useSpeechRecognition";
import useSpeechSynthesis from "../Hooks/useSpeechSynthesis";

/* ------------------------- UTILIDAD DE CAPITALIZAR ------------------------- */
/* Convierte "carlos raúl" → "Carlos Raúl" */
function capitalizar(texto) {
  return texto
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function useVoiceController({
  onBuscarMaestroPorNombre,
  onBuscarEscuelaPorNombre,
  onBuscarTramitePorTexto,
  onBuscarTramitePorMaestro,

  /* Registro guiado de maestro */
  onSetMaestroField,
  onGuardarMaestro,

  /* Registro guiado de escuela */
  onSetEscuelaField,
  onGuardarEscuela,
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

  /* PASO ACTUAL DEL MODO REGISTRO */
  const [modo, setModo] = useState(null); // "maestro" | "escuela"
  const [paso, setPaso] = useState(null);

  /* ------------------------------ PROCESADOR ------------------------------ */
  useEffect(() => {
    if (!result) return;

    const comando = result.toLowerCase().trim();
    setTranscripcion(comando);

    /* ============================================================
       =============== REGISTRO GUIADO DE MAESTRO ==================
       ============================================================ */
    if (modo === "maestro") {
      // cancelar registro
      if (comando.includes("cancelar")) {
        speak("Registro cancelado");
        setModo(null);
        setPaso(null);
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
        onSetMaestroField("rfc", comando.toUpperCase());
        speak("Indique número de personal");
        setPaso("numero");
        resetResult();
        return;
      }

      if (paso === "numero") {
        onSetMaestroField("numero_de_personal", capitalizar(comando));
        speak("Revise los datos. ¿Desea guardarlos?");
        setPaso("confirmar");
        resetResult();
        return;
      }

      if (paso === "confirmar") {
        if (comando.includes("sí") || comando.includes("guardar")) {
          speak("Guardando maestro");
          onGuardarMaestro();
        } else {
          speak("De acuerdo, puede corregir los datos manualmente.");
        }
        setModo(null);
        setPaso(null);
        resetResult();
        return;
      }
    }

    /* ============================================================
       ================= REGISTRO GUIADO DE ESCUELA ================
       ============================================================ */
    if (modo === "escuela") {
      if (comando.includes("cancelar")) {
        speak("Registro cancelado");
        setModo(null);
        setPaso(null);
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
        onSetEscuelaField("clave", comando.toUpperCase());
        speak("Revise los datos. ¿Desea guardarlos?");
        setPaso("confirmar");
        resetResult();
        return;
      }

      if (paso === "confirmar") {
        if (comando.includes("sí") || comando.includes("guardar")) {
          speak("Guardando escuela");
          onGuardarEscuela();
        } else {
          speak("De acuerdo, puede corregir los datos manualmente.");
        }

        setModo(null);
        setPaso(null);
        resetResult();
        return;
      }
    }

    /* ============================================================
       ================= BUSQUEDAS RÁPIDAS ========================
       ============================================================ */

    if (comando.startsWith("buscar maestro ")) {
      const nombre = capitalizar(comando.replace("buscar maestro", "").trim());
      speak(`Buscando maestro ${nombre}`);
      onBuscarMaestroPorNombre?.(nombre);
      resetResult();
      return;
    }

    if (comando.startsWith("maestro ")) {
      const nombre = capitalizar(comando.replace("maestro", "").trim());
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

    if (comando.startsWith("escuela ")) {
      const nombre = capitalizar(comando.replace("escuela", "").trim());
      speak(`Buscando escuela ${nombre}`);
      onBuscarEscuelaPorNombre?.(nombre);
      resetResult();
      return;
    }

    if (comando.startsWith("buscar trámite ") || comando.startsWith("buscar tramite ")) {
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

    /* ============================================================
       =================== ACTIVAR MODO REGISTRO ===================
       ============================================================ */

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

    // No entendió el comando
    speak("No entendí el comando de voz.");
    resetResult();
  }, [
    result,
    modo,
    paso,
    onBuscarMaestroPorNombre,
    onBuscarEscuelaPorNombre,
    onBuscarTramitePorTexto,
    onBuscarTramitePorMaestro,
    onSetMaestroField,
    onGuardarMaestro,
    onSetEscuelaField,
    onGuardarEscuela,
    speak,
    resetResult,
  ]);

  return {
    supported,
    listening,
    transcripcion,
    error,
    startListening: start,
    stopListening: stop,
  };
}
