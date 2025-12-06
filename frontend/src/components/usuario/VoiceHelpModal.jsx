import React from "react";

export default function VoiceHelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 28,
          borderRadius: 14,
          width: "460px",
          maxHeight: "70vh",
          overflowY: "auto",
          boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
        }}
      >
        <h2>🎤 Guía de comandos de voz</h2>
        <p>Puedes usar comandos naturales para buscar maestros, escuelas y trámites.</p>

        <h3>🔎 Búsqueda de maestros</h3>
        <ul>
          <li>“Buscar maestro Axel”</li>
          <li>“Maestro Juan Pérez”</li>
        </ul>

        <h3>🏫 Búsqueda de escuelas</h3>
        <ul>
          <li>“Buscar escuela Benito Juárez”</li>
          <li>“Escuela secundaria técnica 4”</li>
        </ul>

        <h3>📄 Búsqueda de trámites</h3>
        <ul>
          <li>“Buscar trámite licencia por gravidez”</li>
          <li>“Buscar trámite del maestro Axel”</li>
          <li>“Buscar del maestro Axel”</li>
        </ul>

        <h3>📘 Historial</h3>
        <ul>
          <li>“Buscar historial del maestro Axel”</li>
        </ul>

        <h3>⚙️ Acciones generales</h3>
        <ul>
          <li>“Cancelar”</li>
          <li>“Detener acción”</li>
        </ul>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            background: "#ef4444",
            border: "none",
            padding: "10px 18px",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
