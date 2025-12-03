// src/components/usuario/HistorialModal.jsx
import React from "react";
import { card } from "./ui";

export default function HistorialModal({ open, onClose, children, theme }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(17,17,17,.35)",
        display:"grid", placeItems:"center", zIndex:50
      }}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{ ...card(theme), width:"min(1100px, 92vw)", maxHeight:"86vh", overflow:"auto" }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <h3 style={{ margin:0, fontSize:22 }}>Historial de trámites</h3>
          <button onClick={onClose} style={{
            border:"1.5px solid #E5E1DC", background:"#fff", borderRadius:12,
            padding:"8px 12px", fontWeight:800, cursor:"pointer"
          }}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}
