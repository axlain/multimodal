import React, { useState, useEffect } from 'react';
import { card, pill, title, input, primaryBtn, feedback } from './ui';
import { subirArchivo } from '../../services/uploads';
import { finalizarInstancia } from '../../services/instancias';
import { API_BASE } from '../../services/api';

const toAbs = (u) => (u && !/^https?:\/\//i.test(u) ? `${API_BASE}${u}` : u);

export default function RequisitosForm({
  theme,
  tramite,
  requisitos,
  values,
  onChange,
  saving,
  okMsg,
  errMsg,
  onAfterConstancia, // ⚡ nuevo callback para limpiar dashboard
}) {
  const requisitosList = Array.isArray(requisitos) ? requisitos : [];
  const [finalizado, setFinalizado] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Detectar cuando todos los requisitos estén listos y finalizar automáticamente
  useEffect(() => {
    if (!tramite?.id_instancia || requisitosList.length === 0) return;
    const completos = requisitosList.every(
      (r) =>
        !r.obligatorio ||
        values?.[r.id_requisito]?.url ||
        values?.[r.id_requisito]?.valor
    );
    if (completos && !finalizado) handleAutoFinalizar();
  }, [values, requisitosList]);

  // 🧠 Finalización automática
  const handleAutoFinalizar = async () => {
    try {
      const res = await finalizarInstancia(tramite.id_instancia);
      if (!res.ok) throw new Error(res.error || 'Error al finalizar instancia');
      setFinalizado(true);
      setMsg('✅ Instancia finalizada automáticamente. Ya puedes generar la constancia.');
    } catch (err) {
      console.error('⚠️ Error al finalizar instancia:', err);
    }
  };

  // 🧾 Generar constancia y descargar
  const handleGenerarConstancia = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/sitev/tramite/constancia/${tramite.id_instancia}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al generar constancia.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Constancia_Tramite_${tramite.id_instancia}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('📄 Constancia generada y descargada correctamente.\n\nEl formulario se vaciará.');

      // 🧹 Limpiar campos y dashboard
      onChange({});
      setMsg(null);
      setFinalizado(false);
      if (onAfterConstancia) onAfterConstancia();
    } catch (err) {
      alert(err.message || 'Error al generar constancia.');
    }
  };

  return (
    <section style={card(theme)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={pill(theme)}>Requisitos</span>
        <h2 style={title}>Completa los datos</h2>
        {finalizado && (
          <span style={{ color: theme.green, fontWeight: 700, marginLeft: 8 }}>
            ✅ Instancia finalizada
          </span>
        )}
      </div>

      {/* 🗂 Lista de requisitos */}
      {requisitosList.length === 0 ? (
        <div style={{ marginTop: 8, color: '#777' }}>
          Este trámite no tiene requisitos configurados.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 10,
          }}
        >
          {requisitosList.map((r) => (
            <Field
              key={r.id_requisito}
              req={r}
              value={values?.[r.id_requisito] || (r.tipo === 'archivo' ? null : '')}
              onChange={(v) => onChange({ ...(values || {}), [r.id_requisito]: v })}
              tramiteId={tramite?.id}
              instanciaId={tramite?.id_instancia}
              theme={theme}
              onRequireSave={() => setShowModal(true)} // ⚡ Modal si no ha guardado
            />
          ))}
        </div>
      )}

      {/* Mensajes de retroalimentación */}
      {errMsg && <div style={feedback(theme, 'err')}>{errMsg}</div>}
      {okMsg && <div style={feedback(theme, 'ok')}>{okMsg}</div>}
      {msg && <div style={feedback(theme, 'ok')}>{msg}</div>}

      {/* 📄 Botón generar constancia */}
      {finalizado && (
        <button
          onClick={handleGenerarConstancia}
          style={{
            ...primaryBtn(theme),
            backgroundColor: theme.redDark,
            marginTop: 16,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = theme.red)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = theme.redDark)}
        >
          📄 Generar constancia
        </button>
      )}

      {/* ⚡ Modal de advertencia */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 30,
              textAlign: 'center',
              maxWidth: 400,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginBottom: 10, color: theme.redDark }}>
              ⚠️ Guarda el trámite primero
            </h3>
            <p style={{ fontSize: 17, color: '#444', marginBottom: 20 }}>
              Debes guardar el trámite antes de subir documentos.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                ...primaryBtn(theme),
                backgroundColor: theme.redDark,
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = theme.red)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = theme.redDark)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// =============== CAMPO INDIVIDUAL ===============
function Field({ req, value, onChange, theme, tramiteId, instanciaId, onRequireSave }) {
  const [uploading, setUploading] = useState(false);

  const Label = (
    <label style={{ color: '#111', fontWeight: 700, fontSize: 18 }}>
      {req.titulo}{' '}
      {req.obligatorio ? <span style={{ color: theme.red }}>*</span> : null}
    </label>
  );

  if (req.tipo === 'file' || req.tipo === 'archivo') {
    return (
      <div>
        {Label}
        <input
          type="file"
          accept={req.accept || '.pdf,image/*'}
          disabled={uploading}
          style={input(theme)}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!instanciaId) {
              onRequireSave(); // ⚡ Mostrar modal
              e.target.value = null; // limpiar input
              return;
            }

            setUploading(true);
            try {
              const up = await subirArchivo({
                id_instancia: instanciaId,
                id_tramite: tramiteId,
                id_requisito: req.id_requisito,
                archivo: file,
              });
              if (!up.ok) throw new Error(up.error || 'Error en la subida');

              const abs = toAbs(up.url);
              onChange({
                archivo_id: up.id_archivo,
                filename: up.filename,
                mime: up.mime,
                size: up.size,
                url: abs,
              });
            } catch (err) {
              alert(err.message || 'Error al subir archivo');
            } finally {
              setUploading(false);
            }
          }}
        />
        {value?.url && (
          <div style={{ marginTop: 6, color: 'green' }}>✅ Archivo cargado</div>
        )}
      </div>
    );
  }

  return (
    <div>
      {Label}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={input(theme)}
      />
    </div>
  );
}
