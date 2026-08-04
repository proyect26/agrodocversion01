import React, { useState } from 'react';
import { Trash2, List, Printer, Eye, X } from 'lucide-react';
import LabelPreview from './LabelPreview';
import CommercialInvoicePreview from './CommercialInvoicePreview';

export default function LabelsBatchPanel({ title = "Lote de Etiquetas", theme = "primary", labels, type = "sticker", onDelete, onClearAll, onPrintAll, onPrintSingle }) {
  const [previewLabel, setPreviewLabel] = useState(null);
  const isInvoiceBatch = type === 'a4';

  const colors = {
    primary: { bg: 'var(--primary)', text: 'white', lightBg: 'rgba(255, 255, 255, 0.02)', icon: 'var(--primary)' },
    secondary: { bg: 'var(--accent)', text: 'white', lightBg: 'rgba(255, 255, 255, 0.02)', icon: 'var(--accent)' }
  };
  const themeColors = colors[theme] || colors.primary;

  if (!labels || labels.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '2px dashed var(--border)' }}>
        <List size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title} Vacío</p>
        <p style={{ fontSize: '0.8rem' }}>Usa el botón correspondiente para enlistar aquí.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          backgroundColor: themeColors.lightBg
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <List size={18} color={themeColors.icon} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>
            <span style={{
              background: themeColors.bg === 'var(--accent)' ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.65) 0%, rgba(225, 29, 72, 0.5) 100%)' : 'linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(56, 189, 248, 0.45) 100%)', 
              color: themeColors.text,
              borderRadius: '999px', padding: '0.1rem 0.6rem',
              fontSize: '0.75rem', fontWeight: 700
            }}>{labels.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onPrintAll}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
                background: themeColors.bg === 'var(--accent)' ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.65) 0%, rgba(225, 29, 72, 0.5) 100%)' : 'linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(56, 189, 248, 0.45) 100%)', 
                color: themeColors.text,
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <Printer size={14} /> Imprimir Todo
            </button>
            <button
              onClick={onClearAll}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              <Trash2 size={14} /> Borrar Todo
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={th}>#</th>
                {isInvoiceBatch ? (
                  <>
                    <th style={th}>CLIENTE</th>
                    <th style={th}>AWB</th>
                    <th style={th}>HAWB</th>
                    <th style={th}>AGENCIA</th>
                    <th style={th}>EXPORTADORA</th>
                  </>
                ) : (
                  <>
                    <th style={th}>EXPORTADORA</th>
                    <th style={th}>VARIETY</th>
                    <th style={th}>LENGTH</th>
                    <th style={th}>BN</th>
                    <th style={th}>PAÍS</th>
                    <th style={th}>AWB</th>
                    <th style={th}>HAWB</th>
                    <th style={th}>AGENCIA</th>
                    <th style={th}>CLIENTE</th>
                  </>
                )}
                <th style={{ ...th, textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr
                  key={label._id}
                  style={{
                    borderBottom: '1px solid var(--glass-border)',
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'background 0.15s',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'}
                >
                  <td style={td}><span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{index + 1}</span></td>
                  {isInvoiceBatch ? (
                    <>
                      <td style={{ ...td, fontWeight: 700 }}>{label.cliente || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{label.mawb || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{label.hawb || '—'}</td>
                      <td style={td}>{label.agencia || '—'}</td>
                      <td style={{ ...td, fontWeight: 700, color: 'var(--text-primary)' }}>{label.marcacion || '—'}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...td, fontWeight: 700, color: 'var(--text-primary)' }}>{label.marcacion || '—'}</td>
                      <td style={td}>{label.items?.[0]?.variety || '—'}</td>
                      <td style={td}>{label.items?.[0]?.length || '—'}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{label.items?.[0]?.bn || '—'}</td>
                      <td style={td}>{label.pais || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{label.mawb || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{label.hawb || '—'}</td>
                      <td style={td}>{label.agencia || '—'}</td>
                      <td style={td}>{label.cliente || '—'}</td>
                    </>
                  )}

                  {/* Acciones */}
                  <td style={{ ...td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>

                      {/* Previsualizar */}
                      <button
                        onClick={() => setPreviewLabel(label)}
                        title="Previsualizar"
                        style={actionBtn('#3b82f6', '#eff6ff')}
                        onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1d4ed8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                      >
                        <Eye size={13} />
                      </button>

                      {/* Imprimir individual */}
                      <button
                        onClick={() => onPrintSingle(label)}
                        title="Imprimir esta etiqueta"
                        style={actionBtn('#6366f1', '#eef2ff')}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.color = '#4338ca'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                      >
                        <Printer size={13} />
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(label._id)}
                        title="Eliminar"
                        style={actionBtn('#ef4444', '#fee2e2')}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.color = '#b91c1c'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de previsualización */}
      {previewLabel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}
          onClick={() => setPreviewLabel(null)}
        >
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: '16px',
              maxWidth: type === 'sticker' ? '520px' : '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              background: 'white',
              borderRadius: '16px 16px 0 0',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Vista Previa — #{labels.indexOf(previewLabel) + 1} {previewLabel.marcacion}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onPrintSingle(previewLabel)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
                    background: 'var(--primary)', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer'
                  }}
                >
                  <Printer size={13} /> Imprimir
                </button>
                <button
                  onClick={() => setPreviewLabel(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.4rem', background: '#f1f5f9', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Document preview */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transformOrigin: 'top center', transform: type === 'sticker' ? 'scale(0.85)' : 'scale(0.7)' }}>
                {type === 'sticker' ? (
                  <LabelPreview data={previewLabel} zoom={1} />
                ) : (
                  <CommercialInvoicePreview data={previewLabel} zoom={1} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const actionBtn = (color, bg) => ({
  background: bg,
  border: 'none',
  cursor: 'pointer',
  color: color,
  padding: '0.3rem 0.4rem',
  borderRadius: '5px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s',
});

const th = {
  padding: '0.6rem 0.75rem',
  textAlign: 'left',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap'
};

const td = {
  padding: '0.6rem 0.75rem',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  maxWidth: '160px',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};
