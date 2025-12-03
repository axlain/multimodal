export const theme = {
  black: '#111111',
  red: '#C92C2C',
  redDark: '#7B1E1E',
  redSoft: '#FBE9E9',
  white: '#FFFFFF',
  beige: '#F6EFE7',
  border: '#E5E1DC',
};

export const card     = t => ({ background: t.white, border: `1.5px solid ${t.border}`, borderRadius: 20, padding: 24, boxShadow: '0 18px 36px rgba(17,17,17,.08)' });
export const cardHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 };
export const pill     = t => ({ padding: '4px 10px', borderRadius: 999, fontSize: 14, fontWeight: 900, background: t.redSoft, color: t.red, border: `1px solid ${t.red}` });
export const title    = { margin: 0, fontSize: 26 };
export const input    = t => ({ border: `1.5px solid ${t.border}`, background: '#fff', borderRadius: 14, padding: '12px 14px', width: '100%', fontSize: 18 });
export const combo    = t => ({ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: t.white, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: '0 12px 24px rgba(0,0,0,.08)', maxHeight: 260, overflowY: 'auto', zIndex: 9 });
export const comboItem= { width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: '14px 16px', borderBottom: '1px dashed #eee', fontSize: 16, cursor: 'pointer' };
export const comboEmpty={ padding: '14px 16px', color: '#777', fontSize: 16 };
export const primaryBtn=t => ({ border: `1.5px solid ${t.redDark}`, color: t.white, background: t.redDark, borderRadius: 14, padding: '12px 16px', fontWeight: 800, fontSize: 18, cursor: 'pointer' });
export const ghostBtn =t => ({ border: `1.5px solid ${t.red}`, color: t.red, background: t.white, borderRadius: 14, padding: '12px 16px', fontWeight: 800, fontSize: 18, cursor: 'pointer' });
export const feedback =(t, kind) => {
  const ok = kind === 'ok';
  return { marginTop: 12, color: ok ? '#226d22' : t.red, background: ok ? 'rgba(34,109,34,.08)' : t.redSoft, border: `1.5px solid ${ok ? '#226d2244' : t.red}`, padding: '12px 14px', borderRadius: 14, fontSize: 16 };
};
