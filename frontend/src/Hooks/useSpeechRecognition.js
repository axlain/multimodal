import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeechRecognition({ lang = "es-MX" } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
      setResult("");
      isStoppingRef.current = false;
    };

    recognition.onerror = (ev) => {
      console.error("🎤 Error:", ev.error);
      setError(ev.error || "Error de reconocimiento.");
      setListening(false);
    };

    recognition.onend = () => {
      // Si onend ocurre porque llamamos stop(), NO queremos reiniciar,
      // simplemente cerramos todo correctamente.
      setListening(false);
    };

    recognition.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      setResult(text);
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    try {
      if (!recognitionRef.current) return;

      // Safari y Chrome pueden lanzar error si se llama start() dos veces
      recognitionRef.current.abort(); // asegura estado limplio

      recognitionRef.current.start();
    } catch (err) {
      console.error("Error al iniciar reconocimiento:", err);
      setError(err.message);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      isStoppingRef.current = true;
      recognitionRef.current?.stop();
    } catch (err) {
      console.error("Error al detener reconocimiento:", err);
      setError(err.message);
    }
  }, []);

  return {
    supported,
    listening,
    result,
    error,
    start,
    stop,
    resetResult: () => setResult(""),
  };
}
