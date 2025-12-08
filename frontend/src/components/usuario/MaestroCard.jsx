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
import { buscarMaestros, crearMaestro } from "../../services/maestro";

function MaestroCard(
  { theme, form, onFormChange, selected, onSelect },
  ref
) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const boxRef = useRef(null);

  /* ---------------- MÉTODOS EXTERNOS ---------------- */
  useImperativeHandle(ref, () => ({
    setSearch: (texto) => {
      setQ(texto);
      setOpen(true);
    },
    guardar,
    limpiar,
  }));

  function limpiar() {
    onSelect(null);
    onFormChange({
      nombre: "",
      ap_paterno: "",
      ap_materno: "",
      rfc: "",
      numero_de_personal: "",
    });
    setMsg(null);
  }

  /* ---------------- BÚSQUEDA ---------------- */
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
      if (s.length < 2) return setResults([]);

      try {
        const r = await buscarMaestros(s);
        setResults(r);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q, open]);

  /* ---------------- GUARDAR ---------------- */
  async function guardar() {
    setMsg(null);

    if (!form.nombre?.trim() || !form.ap_paterno?.trim()) {
      return setMsg("Nombre y apellido paterno son requeridos");
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        rfc: form.rfc?.replace(/\s+/g, "").toUpperCase() || null,
      };

      const data = await crearMaestro(payload);
      onSelect({ id_maestro: data?.id_maestro, ...form });

      setMsg("Maestro guardado ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <section style={card(theme)}>
      <header style={cardHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={pill(theme)}>Maestro</span>
          <h2 style={title}>Datos del maestro</h2>
        </div>

        <div ref={boxRef} style={{ position: "relative", minWidth: 320 }}>
          <input
            placeholder="Buscar maestro"
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
                  key={r.id_maestro}
                  type="button"
                  style={comboItem}
                  onClick={() => {
                    onSelect(r);
                    onFormChange({
                      nombre: r.nombre || "",
                      ap_paterno: r.ap_paterno || "",
                      ap_materno: r.ap_materno || "",
                      rfc: r.rfc || "",
                      numero_de_personal: r.numero_de_personal || "",
                    });
                    setOpen(false);
                    setQ("");
                  }}
                >
                  {r.nombre} {r.ap_paterno} {r.ap_materno} · {r.rfc}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* FORM */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Nombre" value={form.nombre} onChange={(v) => onFormChange({ ...form, nombre: v })} theme={theme} />

        <Field label="Apellido Paterno" value={form.ap_paterno}
          onChange={(v) => onFormChange({ ...form, ap_paterno: v })}
          theme={theme}
        />

        <Field label="Apellido Materno" value={form.ap_materno}
          onChange={(v) => onFormChange({ ...form, ap_materno: v })}
          theme={theme}
        />

        <Field
          label="RFC"
          value={form.rfc}
          onChange={(v) =>
            onFormChange({ ...form, rfc: v.replace(/\s+/g, "").toUpperCase() })
          }
          theme={theme}
          maxLength={13}
        />

        <Field
          label="Número de Personal"
          value={form.numero_de_personal}
          onChange={(v) =>
            onFormChange({
              ...form,
              numero_de_personal: v.replace(/\s+/g, ""),
            })
          }
          theme={theme}
        />
      </div>

      {/* BOTONES */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={guardar} disabled={saving} style={primaryBtn(theme)}>
          {saving ? "Guardando…" : "Guardar maestro"}
        </button>

        <button onClick={limpiar} style={ghostBtn(theme)}>
          Limpiar
        </button>
      </div>

      {msg && (
        <div style={feedback(theme, msg.includes("✓") ? "ok" : "err")}>
          {msg}
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, theme, type = "text", maxLength }) {
  return (
    <div>
      <label style={{ color: "#111", fontWeight: 700, fontSize: 18 }}>
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

export default forwardRef(MaestroCard);
