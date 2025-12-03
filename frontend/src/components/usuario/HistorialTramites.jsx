// src/components/usuario/HistorialCards.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listarInstanciasUsuario } from "../../services/instancias";
import { input, pill } from "./ui";

export default function HistorialCards({ theme }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listarInstanciasUsuario();
      const data = Array.isArray(r?.data) ? r.data : [];
      setItems(data.map(x => ({
        id: x.id_instancia,
        fecha: x.created_at,
        tramite: x.nombre_tramite,
        maestro: x.maestro_nombre,
        estado: x.estado || "Registrado",
      })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return items;
    return items.filter(i =>
      String(i.id).includes(n) ||
      (i.tramite||"").toLowerCase().includes(n) ||
      (i.maestro||"").toLowerCase().includes(n) ||
      (i.estado||"").toLowerCase().includes(n)
    );
  }, [q, items]);

  const fmtFecha = f => {
    const d = new Date(f);
    return isNaN(d.getTime()) ? String(f) : d.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:12, alignItems:"center" }}>
        <span style={pill(theme)}>Buscar</span>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Folio, trámite, maestro, estado…"
          style={{ ...input(theme), maxWidth:420 }}
        />
        <button onClick={load} style={{
          border:`1.5px solid ${theme.redDark}`, background:theme.redDark, color:"#fff",
          borderRadius:14, padding:"10px 14px", fontWeight:800, cursor:"pointer"
        }}>
          Recargar
        </button>
      </div>

      {loading && <div style={{ padding:8 }}>Cargando…</div>}
      {!loading && filtered.length === 0 && <div style={{ padding:8, color:"#7b7268" }}>Sin registros</div>}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
        gap:14
      }}>
        {filtered.map(item => (
          <article key={item.id} style={{
            background:"#fff", border:`1.5px solid ${theme.border}`, borderRadius:16, padding:16,
            boxShadow:"0 12px 24px rgba(17,17,17,.06)"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{
                padding:"2px 10px", borderRadius:999, border:`1px solid ${theme.red}`,
                background:theme.redSoft, color:theme.red, fontWeight:900, fontSize:12
              }}>
                Folio #{item.id}
              </span>
              <div style={{ fontSize:13, color:"#6b6259" }}>{fmtFecha(item.fecha)}</div>
            </div>

            <h4 style={{ margin:"6px 0 8px", fontSize:18 }}>{item.tramite}</h4>
            <div style={{ fontSize:14, color:"#3a3734", marginBottom:8 }}>
              Maestro: <strong>{item.maestro || "-"}</strong>
            </div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{
                padding:"4px 10px", borderRadius:999, border:"1px solid #E5E1DC",
                fontSize:12, fontWeight:700, background:theme.beige, color:"#111"
              }}>
                {item.estado}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
