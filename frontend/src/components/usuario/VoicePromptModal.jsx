import React from "react";

export default function VoicePromptModal({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 10,
          width: "380px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Indicaciones</h2>
        <p style={{ marginTop: 12, fontSize: 17 }}>{message}</p>

        <button
          style={{
            marginTop: 15,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
