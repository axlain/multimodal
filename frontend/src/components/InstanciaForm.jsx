// src/components/InstanciaForm.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerInstanciaDetalle, guardarValor } from '../services/instancias';
import { agregarRequisito, editarRequisito, eliminarRequisito } from '../services/requisito';

/* ===== Paleta inline mínima para acentos (sin romper el theme) ===== */
const wine = '#7B1E1E';
const red = '#C92C2C';
const black = '#111';
const gray = '#555';
const white = '#fff';

const cardStyle = {
  background: 'var(--card-bg, #fff)',
  border: '1.5px solid var(--border, #FFC2C2)',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 10px 24px rgba(17,17,17,0.06)',
};
const titleStyle = { color: 'var(--black, #111)', margin: 0, fontWeight: 800 };
const labelStyle = { fontWeight: 700, color: 'var(--black, #111)' };
const btn = {
  base: { padding: '10px 14px', borderRadius: 999, border: '1.5px solid var(--border, #FFC2C2)', cursor: 'pointer', background: '#fff' },
  primary: { background: 'var(--accent, #E70808)', color: '#fff', borderColor: 'var(--accent, #E70808)' },
  outline: { background: '#fff', color: 'var(--accent, #E70808)', borderColor: 'var(--accent, #E70808)' },
  danger: { background: 'var(--accent, #E70808)', color: '#fff', borderColor: 'var(--accent, #E70808)' },
  muted: { background: '#f6f6f6', color: '#666', borderColor: '#ddd' },
};

/* ===== Modal (usa theme + no rompe foco) ===== */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-outline" onMouseDown={e=>e.preventDefault()} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ===== Fila de requisito =====
   - Estado LOCAL: input fluido (sin perder foco).
   - SIN autoguardado: solo botón “Guardar valor”.
   - Botones no roban foco (onMouseDown preventDefault). */
const RequisitoRow = React.memo(function RequisitoRow({
  req,
  onGuardar,
  onEditarClick,
  onEliminarClick,
}) {
  const [local, setLocal] = useState(req.tipo === 'checkbox' ? Number(req.valor ?? 0) : (req.valor ?? ''));
  const inputRef = React.useRef(null);

  // Si cambia el requisito desde fuera (p.ej. guardado), actualiza local
  useEffect(() => {
    setLocal(req.tipo === 'checkbox' ? Number(req.valor ?? 0) : (req.valor ?? ''));
    // NO hacemos focus aquí para no interferir al teclear
  }, [req.id_requisito, req.valor, req.tipo]);

  // Mantener foco al teclear cuando cambian props de botones (enabled/disabled)
  const keepFocus = () => {
    // Evita que el cambio de "disabled" en el botón saque el foco del input
    queueMicrotask(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        const el = inputRef.current;
        el.focus();
        if (el.setSelectionRange && typeof el.value === 'string') {
          const pos = el.value.length;
          el.setSelectionRange(pos, pos);
        }
      }
    });
  };

  const onTextChange = (val) => {
    setLocal(val);
    keepFocus();
  };

  const InputByTipo = ({ tipo }) => {
    if (tipo === 'numero') {
      return (
        <input
          ref={inputRef}
          className="input"
          type="number"
          autoComplete="off"
          value={local ?? ''}
          onChange={e => onTextChange(e.target.value)}
        />
      );
    }
    if (tipo === 'fecha') {
      return (
        <input
          ref={inputRef}
          className="input"
          type="date"
          value={local ?? ''}
          onChange={e => onTextChange(e.target.value)}
        />
      );
    }
    if (tipo === 'archivo') {
      return (
        <input
          className="input"
          type="file"
          onChange={e => setLocal(e.target.files?.[0] || null)}
        />
      );
    }
    if (tipo === 'checkbox') {
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            ref={inputRef}
            type="checkbox"
            checked={!!Number(local)}
            onChange={e => { setLocal(e.target.checked ? 1 : 0); keepFocus(); }}
          />
          <span>Marcado</span>
        </label>
      );
    }
    // texto
    return (
      <input
        ref={inputRef}
        className="input"
        type="text"
        autoComplete="off"
        value={local ?? ''}
        onChange={e => onTextChange(e.target.value)}
      />
    );
  };

  const changed = (req.tipo === 'checkbox')
    ? Number(local) !== Number(req.valor || 0)
    : String(local ?? '') !== String(req.valor ?? '');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px,1fr) 2fr auto auto',
        gap: 12,
        alignItems: 'center',
        padding: '14px 12px',
        border: '1.5px dashed var(--red-300)',
        borderRadius: 14,
        background: 'linear-gradient(180deg, rgba(255,240,240,.55), rgba(255,240,240,.25))',
      }}
    >
      {/* Label */}
      <div>
        <label style={labelStyle}>
          {req.titulo}{req.obligatorio ? <span style={{ color: 'var(--accent, #E70808)' }}> *</span> : null}
        </label>
      </div>

      {/* Input + Guardar */}
      <div>
        <InputByTipo tipo={req.tipo} />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            tabIndex={-1}
            className={`btn ${changed ? 'btn-outline' : ''}`}
            disabled={!changed}
            // Importante: que el click no robe el foco al input
            onMouseDown={e => e.preventDefault()}
            onClick={() => onGuardar(req, local)}
          >
            Guardar valor
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div>
        <button
          tabIndex={-1}
          className="btn btn-outline"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onEditarClick(req)}
        >
          Editar
        </button>
      </div>

      <div>
        <button
          tabIndex={-1}
          className="btn btn-danger"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onEliminarClick(req)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
});

/* ===== Página ===== */
export default function InstanciaForm() {
  const { id } = useParams();
  const id_instancia = Number(id);
  const navigate = useNavigate();

  const [instancia, setInstancia] = useState(null);
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // “Obligatorio” activo por defecto
  const [nuevoReq, setNuevoReq] = useState({ titulo: '', tipo: 'texto', obligatorio: true });

  // modal editar requisito
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editDraft, setEditDraft] = useState({ titulo: '', tipo: 'texto', obligatorio: true });

  useEffect(() => {
    const load = async () => {
      setLoading(true); setErr(null);
      try {
        const res = await obtenerInstanciaDetalle(id_instancia);
        setInstancia(res?.instancia || null);
        setRequisitos(Array.isArray(res?.requisitos) ? res.requisitos : []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally { setLoading(false); }
    };
    load();
  }, [id_instancia]);

  const reload = useCallback(async () => {
    try {
      const res = await obtenerInstanciaDetalle(id_instancia);
      setInstancia(res?.instancia || null);
      setRequisitos(Array.isArray(res?.requisitos) ? res.requisitos : []);
    } catch {}
  }, [id_instancia]);

  /* ===== Guardar valor ===== */
  const handleGuardarValor = async (req, valorLocal) => {
    try {
      let valor = valorLocal;
      if (req.tipo === 'archivo' && valorLocal && valorLocal.name) {
        valor = valorLocal.name; // aquí iría la subida y reemplazo por URL
      }
      await guardarValor({ id_instancia, id_requisito: req.id_requisito, valor });
      // sincroniza estado base para apagar “changed”
      setRequisitos(prev => prev.map(r => r.id_requisito === req.id_requisito ? { ...r, valor } : r));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  /* ===== Editar requisito (abre modal) ===== */
  const openEditModal = (req) => {
    setEditTarget(req);
    setEditDraft({
      titulo: req.titulo || '',
      tipo: req.tipo || 'texto',
      obligatorio: req.obligatorio !== undefined ? !!req.obligatorio : true,
    });
    setEditModalOpen(true);
  };

  const saveEditModal = async () => {
    if (!editTarget) return;
    if (!editDraft.titulo.trim()) return alert('El título es obligatorio');
    try {
      await editarRequisito({
        id_requisito: editTarget.id_requisito,
        titulo: editDraft.titulo.trim(),
        tipo: editDraft.tipo,
        obligatorio: !!editDraft.obligatorio,
      });
      setEditModalOpen(false);
      setEditTarget(null);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  /* ===== Eliminar requisito ===== */
  const handleEliminar = async (req) => {
    if (!confirm(`Eliminar el requisito "${req.titulo}"?`)) return;
    try {
      await eliminarRequisito(req.id_requisito);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  if (loading) return <div className="container"><p>Cargando…</p></div>;
  if (err) return <div className="container"><p style={{ color: red }}>{err}</p></div>;
  if (!instancia) return <div className="container"><p>No encontrada.</p></div>;

  return (
    <div className="container" style={{ color: black }}>
      <button
        className="btn btn-outline"
        onMouseDown={e=>e.preventDefault()}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 12 }}
      >
        ← Volver
      </button>

      {/* Encabezado */}
      <div className="card" style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 className="card-title" style={{ color: 'var(--black, #111)' }}>
          Captura – {instancia.nombre_tramite}
        </h2>
        <div className="card-sub" style={{ marginTop: 6, color: gray }}>
          Docente: <strong style={{ color: 'var(--black, #111)' }}>{instancia.maestro_nombre}</strong> · Estado: {instancia.estado}
        </div>
      </div>

      {/* Configurar requisitos */}
      <div className="card" style={{ ...cardStyle, marginBottom: 16 }}>
        <h3 className="card-title" style={{ color: wine }}>Requisitos del trámite</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 140px 160px',
            gap: 8,
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <input
            className="input"
            placeholder="Título del requisito (p. ej. Nombre del docente)"
            value={nuevoReq.titulo}
            onChange={e => setNuevoReq(v => ({ ...v, titulo: e.target.value }))}
          />

          <select
            className="select"
            value={nuevoReq.tipo}
            onChange={e => setNuevoReq(v => ({ ...v, tipo: e.target.value }))}
          >
            <option value="texto">Texto</option>
            <option value="numero">Número</option>
            <option value="fecha">Fecha</option>
            <option value="archivo">Archivo</option>
            <option value="checkbox">Checkbox</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={!!nuevoReq.obligatorio}
              onChange={e => setNuevoReq(v => ({ ...v, obligatorio: e.target.checked }))}
            />
            Obligatorio
          </label>

          <button
            className="btn btn-primary"
            onMouseDown={e => e.preventDefault()}
            onClick={async () => {
              if (!nuevoReq.titulo.trim()) return alert('Título requerido');
              try {
                await agregarRequisito({
                  id_tramite: Number(instancia.id_tramite),
                  titulo: nuevoReq.titulo.trim(),
                  tipo: nuevoReq.tipo,
                  obligatorio: !!nuevoReq.obligatorio,
                });
                setNuevoReq({ titulo: '', tipo: 'texto', obligatorio: true }); // queda activo por defecto
                await reload();
              } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
            }}
          >
            Añadir requisito
          </button>
        </div>
      </div>

      {/* Llenado */}
      {requisitos.length === 0 ? (
        <div className="card" style={{ ...cardStyle, borderStyle: 'dashed', color: gray }}>
          No hay requisitos configurados.
        </div>
      ) : (
        <div className="card" style={{ ...cardStyle, display: 'grid', gap: 12 }}>
          <h4 className="card-title" style={{ marginBottom: 4, color: 'var(--black, #111)' }}>Llenado</h4>

          {requisitos.map(req => (
            <RequisitoRow
              key={req.id_requisito}
              req={req}
              onGuardar={handleGuardarValor}
              onEditarClick={openEditModal}
              onEliminarClick={handleEliminar}
            />
          ))}
        </div>
      )}

      {/* MODAL: Editar requisito */}
      <Modal
        open={editModalOpen}
        title="Editar requisito"
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">Título</label>
          <input
            className="input"
            value={editDraft.titulo}
            onChange={e => setEditDraft(d => ({ ...d, titulo: e.target.value }))}
            placeholder="Nuevo nombre del requisito"
          />

          <label className="label" style={{ marginTop: 6 }}>Tipo</label>
          <select
            className="select"
            value={editDraft.tipo}
            onChange={e => setEditDraft(d => ({ ...d, tipo: e.target.value }))}
          >
            <option value="texto">Texto</option>
            <option value="numero">Número</option>
            <option value="fecha">Fecha</option>
            <option value="archivo">Archivo</option>
            <option value="checkbox">Checkbox</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={!!editDraft.obligatorio}
              onChange={e => setEditDraft(d => ({ ...d, obligatorio: e.target.checked }))}
            />
            Obligatorio
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
            <button
              className="btn btn-outline"
              onMouseDown={e=>e.preventDefault()}
              onClick={() => { setEditModalOpen(false); setEditTarget(null); }}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onMouseDown={e=>e.preventDefault()}
              onClick={saveEditModal}
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
