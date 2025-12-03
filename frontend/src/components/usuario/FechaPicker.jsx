import React from 'react';
import { card, pill, title, input } from './ui';

export default function FechaPicker({ theme, value, onChange }) {
  return (
    <section style={card(theme)}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={pill(theme)}>Fecha</span>
        <h2 style={title}>Fecha de hoy</h2>
      </div>
      <div style={{ marginTop: 12 }}>
        <input type="date" value={value} onChange={e=>onChange(e.target.value)} style={input(theme)} />
      </div>
    </section>
  );
}
