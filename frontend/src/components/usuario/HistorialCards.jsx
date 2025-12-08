import React, {
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { listarInstanciasUsuario } from "../../services/instancias";
import { input, pill } from "./ui";
import { API_BASE } from "../../services/api";

function HistorialCards({ theme }, ref) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    setSearch: (texto) => setQ(texto),
    reload: () => load(),
  }));

  const load = async () => {
    setLoading(true);
    try {
      const r = await listarInstanciasUsuario();
      const data = Array.isArray(r?.data) ? r.data : [];

      setItems(
        data.map((x) => ({
          id: x.id_instancia,
          fecha: x.created_at,
          tramite: x.nombre_tramite,
          maestro: x.maestro_nombre,
          estado: x.estado || "Registrado",
          constanciaPath: x.constancia_path || null,
        }))
      );
    } catch (err) {
      console.error("Error al cargar instancias:", err);
      alert("No se pudieron cargar tus trámites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return items;

    return items.filter(
      (i) =>
        String(i.id).includes(n) ||
        (i.tramite || "").toLowerCase().includes(n) ||
        (i.maestro || "").toLowerCase().includes(n) ||
        (i.estado || "").toLowerCase().includes(n)
    );
  }, [q, items]);

  const fmtFecha = (f) => {
    const d = new Date(f);
    return isNaN(d.getTime()) ? String(f) : d.toLocaleDateString();
  };

  return (
    <div>
      {/* 🔍 BARRA DE BÚSQUEDA */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <span style={pill(theme)}>Buscar</span>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Folio, trámite, maestro, estado…"
          style={{ ...input(theme), maxWidth: 420, fontSize: 18 }}
        />

        <button
          onClick={load}
          style={{
            border: `1.5px solid ${theme.redDark}`,
            background: theme.redDark,
            color: "#fff",
            borderRadius: 14,
            padding: "12px 18px",
            fontWeight: 800,
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          Recargar
        </button>
      </div>

      {loading && <div style={{ padding: 8, fontSize: 18 }}>Cargando…</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ padding: 8, color: "#7b7268", fontSize: 18 }}>
          Sin registros
        </div>
      )}

      {/* 🧩 GRID DE TARJETAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 18,
        }}
      >
        {filtered.map((item) => (
          <article
            key={item.id}
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              border: `1.5px solid ${theme.border}`,
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 12px 24px rgba(17,17,17,.06)",
              minHeight: 260, // 🔥 asegura misma altura
            }}
          >
            {/* Encabezado */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: `1px solid ${theme.red}`,
                  background: theme.redSoft,
                  color: theme.red,
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Folio #{item.id}
              </span>

              <div style={{ fontSize: 16, color: "#6b6259" }}>
                {fmtFecha(item.fecha)}
              </div>
            </div>

            {/* Datos */}
            <h4 style={{ margin: "6px 0 10px", fontSize: 22 }}>
              {item.tramite}
            </h4>

            <div style={{ fontSize: 18, marginBottom: 10 }}>
              Maestro: <strong>{item.maestro || "-"}</strong>
            </div>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid #E5E1DC",
                fontSize: 16,
                fontWeight: 700,
                background: theme.beige,
                color: "#111",
              }}
            >
              {item.estado}
            </span>

            {/* 🔥 empuja el botón hacia la parte inferior */}
            <div style={{ flexGrow: 1 }}></div>

            {/* 📄 BOTÓN DE CONSTANCIA */}
            <div style={{ marginTop: 12 }}>
              {item.constanciaPath ? (
                <button
                  onClick={async () => {
                    try {
                      const url = `${API_BASE}${item.constanciaPath}`;
                      const res = await fetch(url, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      });

                      const blob = await res.blob();
                      const link = document.createElement("a");
                      link.href = window.URL.createObjectURL(blob);
                      link.download = `Constancia_Tramite_${item.id}.docx`;
                      link.click();
                    } catch (err) {
                      alert("No se pudo descargar la constancia.");
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    background: theme.blue,
                    color: "#fff",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Descargar constancia
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (
                      !window.confirm(
                        "¿Deseas generar la constancia de este trámite?"
                      )
                    )
                      return;

                    try {
                      const res = await fetch(
                        `${API_BASE}/api/sitev/tramite/constancia/${item.id}`,
                        {
                          method: "GET",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );

                      const blob = await res.blob();
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `Constancia_Tramite_${item.id}.docx`;
                      a.click();

                      await load();
                    } catch (err) {
                      alert("No se pudo generar la constancia.");
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    background: theme.redDark,
                    color: "#fff",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Generar constancia
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default forwardRef(HistorialCards);
