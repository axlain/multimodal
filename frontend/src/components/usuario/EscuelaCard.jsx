import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  card,
  cardHead,
  pill,
  title,
  input,
  combo,
  comboItem,
  comboEmpty,
  primaryBtn,
  ghostBtn,
  feedback,
} from "./ui";
import { buscarEscuelas, crearEscuela } from "../../services/escuela";

function EscuelaCard(
  { theme, form, onFormChange, selected, onSelect },
  ref
) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const boxRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setSearch: (texto) => {
      setQ(texto);
      setOpen(true);
    },
  }));

  useEffect(() => {
    const h = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const s = q.trim();
      if (s.length < 2) {
        setResults([]);
        return;
      }
      try {
        setResults(await buscarEscuelas(s));
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, open]);

  async function guardar() {
    setMsg(null);
    if (!form.nombre?.trim() || !form.clave?.trim()) {
      setMsg("Nombre y clave son requeridos");
      return;
    }
    try {
      setSaving(true);
      const data = await crearEscuela({
        ...form,
        clave: form.clave.toUpperCase(),
      });
      onSelect({ id_escuela: data?.id_escuela, ...form });
      setMsg("Escuela guardada ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={card(theme)}>
      <header style={cardHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={pill(theme)}>Escuela</span>
          <h2 style={title}>Datos de la escuela</h2>
        </div>
        <div ref={boxRef} style={{ position: "relative", minWidth: 320 }}>
          <input
            placeholder="Buscar escuela (mín. 2 letras)"
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            style={input(theme)}
          />
          {open && (
            <div style={combo(theme)}>
              {results.length === 0 && (
                <div style={comboEmpty}>Sin resultados</div>
              )}
              {results.map((r) => (
                <button
                  key={r.id_escuela}
                  type="button"
                  style={comboItem}
                  onClick={() => {
                    onSelect(r);
                    onFormChange({
                      nombre: r.nombre || "",
                      clave: (r.clave || "").toUpperCase(),
                    });
                    setOpen(false);
                    setQ("");
                  }}
                >
                  {r.nombre} · {r.clave}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <Field
          label="Nombre de la escuela"
          value={form.nombre}
          onChange={(v) => onFormChange({ ...form, nombre: v })}
          theme={theme}
        />
        <Field
          label="Clave de la escuela"
          value={form.clave}
          onChange={(v) =>
            onFormChange({ ...form, clave: v.toUpperCase() })
          }
          theme={theme}
          maxLength={20}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={guardar}
          disabled={saving}
          style={primaryBtn(theme)}
        >
          {saving ? "Guardando…" : "Guardar escuela"}
        </button>
        <button
          onClick={() => {
            onSelect(null);
            onFormChange({ nombre: "", clave: "" });
          }}
          style={ghostBtn(theme)}
        >
          Limpiar
        </button>
        {selected && (
          <span
            style={{ alignSelf: "center", fontSize: 16, color: "#555" }}
          >
          </span>
        )}
      </div>
      {msg && (
        <div
          style={feedback(theme, msg.includes("✓") ? "ok" : "err")}
        >
          {msg}
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, theme, type = "text", maxLength }) {
  return (
    <div>
      <label
        style={{ color: "#111", fontWeight: 700, fontSize: 18 }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={input(theme)}
      />
    </div>
  );
}

export default forwardRef(EscuelaCard);
