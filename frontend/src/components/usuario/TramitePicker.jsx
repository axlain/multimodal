import React, { useEffect, useMemo, useRef, useState } from "react";
import { tramitesPorArea, tramitesPorAreaFallback } from "../../services/tramite";

const strip = (s = "") =>
  s.normalize?.("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || s.toLowerCase();

export default function TramitePicker({ theme, areaId, selected, onSelect }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const T = theme || {};

  // usa la misma paleta que los otros chips si existe en el theme
  const pillBg  = T.pillBg  || T.tagBg  || "#F8EFE8";
  const pillFg  = T.pillFg  || T.tagFg  || "#9A4D39";
  const border  = T.border  || "#e9e3dc";
  const shade   = T.shadow  || "0 4px 12px rgba(0,0,0,.06)";
  const hoverBg = T.hoverBg || "#faf7f4";
  const text    = T.black   || "#111";

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!areaId) { if (alive) setAll([]); return; }
      try {
        const arr = await tramitesPorArea(areaId).catch(() => tramitesPorAreaFallback(areaId));
        if (alive) setAll(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error("tramitesPorArea error:", e);
        if (alive) setAll([]);
      }
    })();
    return () => { alive = false; };
  }, [areaId]);

  const list = useMemo(() => {
    const needle = strip(q.trim());
    if (!needle) return all;
    return all.filter(t =>
      [t.nombre, t.descripcion].some(s => strip(s || "").includes(needle))
    );
  }, [q, all]);

  function handlePick(t) {
    setOpen(false);
    setQ("");
    onSelect?.(t);
    setTimeout(() => inputRef.current?.blur(), 0);
  }

  const noArea = !areaId;

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:18, border:`1px solid ${border}`, boxShadow:shade }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span
          style={{
            padding:"4px 12px",
            borderRadius:999,
            background:pillBg,
            color:pillFg,
            fontWeight:600,
            fontSize:14    // igual al resto de chips
          }}
        >
          Trámite
        </span>

        <div style={{ position:"relative", flex:1 }}>
          <input
            ref={inputRef}
            value={q}
            onFocus={() => !noArea && setOpen(true)}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              noArea
                ? "No se detectó el área del usuario"
                : (selected ? selected.nombre : "Buscar trámite (opcional)")
            }
            disabled={noArea}
            style={{
              width:"100%",
              fontSize:18,                 // ↑ más grande
              lineHeight:1.2,
              padding:"12px 14px",         // ↑ más cómodo
              borderRadius:12,
              border:`1px solid ${T.inputBorder || "#d9d3cc"}`,
              outline:"none",
              background: noArea ? "#f5f2ef" : "#fff",
              color: noArea ? "#9a9188" : text
            }}
          />
          {open && (
            <div
              style={{
                position:"absolute",
                zIndex:10,
                top:"calc(100% + 6px)",
                left:0,
                right:0,
                maxHeight:320,
                overflow:"auto",
                background:"#fff",
                border:`1px solid ${T.popoverBorder || "#e5ded6"}`,
                borderRadius:12,
                boxShadow:"0 10px 24px rgba(0,0,0,.08)"
              }}
              onMouseDown={(e)=>e.preventDefault()}
            >
              {list.length === 0 ? (
                <div style={{ padding:14, color:"#8a8176", fontSize:14 }}>Sin resultados</div>
              ) : (
                list.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePick(t)}
                    style={{
                      display:"block",
                      width:"100%",
                      textAlign:"left",
                      padding:"14px 14px",          // ↑
                      border:"none",
                      background:"transparent",
                      cursor:"pointer"
                    }}
                    onMouseEnter={(e)=> e.currentTarget.style.background=hoverBg}
                    onMouseLeave={(e)=> e.currentTarget.style.background="transparent"}
                  >
                    <div style={{ fontWeight:700, fontSize:18, color:text }}>
                      {t.nombre}
                    </div>
                    {t.descripcion && (
                      <div style={{ marginTop:4, fontSize:14, lineHeight:1.5, color:"#635a51" }}>
                        {t.descripcion}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selected && (
          <span style={{ fontSize:14, color:"#7b7268" }}>
            Seleccionado: <b>{selected.nombre}</b>
          </span>
        )}
      </div>
    </div>
  );
}
