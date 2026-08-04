import React from 'react';
import { Layers, Printer, Plus, Minus, Pin, Trash2, Flower2 } from 'lucide-react';
import SmartField from './SmartField';

export default function InvoiceForm({
  data,
  onChange,
  onPrint,
  onItemChange,
  onRemoveItem,
  onAddToBatch,
  labelsBatchCount = 0,
  invoiceBatchCount = 0
}) {

  const docFields = [
    { name: 'dae',            label: 'DAE / Código de Barras' },
    { name: 'facturaAnterior',label: 'N° Factura' },
    { name: 'serie',          label: 'Serie' },
    { name: 'fechaFactura',   label: 'Fecha' },
    { name: 'mawb',           label: 'MAWB No.' },
    { name: 'hawb',           label: 'HAWB No.' },
    { name: 'pais',           label: 'País destino' },
    { name: 'marcacion',      label: 'Exportadora' },
    { name: 'producto',       label: 'Producto' },
    { name: 'agencia',        label: 'Agencia' },
    { name: 'cliente',        label: 'Cliente' },
  ];

  const varietyOptions = ['White', 'Yellow', 'Lavender', 'Purple', 'Red', 'Orange', 'Bicolor'];
  const lengthOptions  = ['40 cm', '50 cm', '60 cm', '65 cm', '70 cm', '80 cm', '90 cm'];
  const pieceTypeOptions = [
    { value: 'QB', label: 'QB (0.25)' },
    { value: 'HB0', label: 'HB0 (0.5)' },
    { value: 'EB', label: 'EB (0.125)' },
    { value: 'HB', label: 'HB (0.5)' },
    { value: 'FB', label: 'FB (1.0)' }
  ];
  const DEFAULT_UNIT_PRICE_KEY = 'invoice_default_unit_price';

  const adjustUnitPrice = (item, delta) => {
    const current = Number(item.unitPrice) || 0;
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    onItemChange(item.id, 'unitPrice', next.toFixed(2));
  };


  const setAsDefaultUnitPrice = (item) => {
    const value = Number(item.unitPrice);
    if (!Number.isFinite(value) || value < 0) return;
    localStorage.setItem(DEFAULT_UNIT_PRICE_KEY, value.toFixed(2));
  };


  const inputStyle = {
    width: '100%',
    padding: '0.45rem 0.6rem',
    fontSize: '0.82rem',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-primary)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '0.2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      borderRadius: '18px',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Layers size={18} color="var(--primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Datos del Documento</span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

        {/* Documento fields — single column, SmartField */}
        {docFields.map(f => (
          <SmartField
            key={f.name}
            name={f.name}
            label={f.label}
            value={data[f.name] || ''}
            onChange={onChange}
            colSpan={1}
          />
        ))}


        {/* Divider */}
        <div style={{ borderTop: '1.5px dashed var(--glass-border)', margin: '0.5rem 0' }} />

        {/* Flores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <Flower2 size={15} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Detalle de Flor
          </span>
        </div>

        {data.items && data.items.map((item) => (
          <div key={item.id} style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '0.85rem',
            position: 'relative',
          }}>
            {data.items.length > 1 && (
              <button
                onClick={() => onRemoveItem(item.id)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.15rem', lineHeight: 1 }}
                title="Quitar"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* 2 columnas: VARIETY + LENGTH */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Variety</label>
                <select
                  value={item.variety}
                  onChange={e => onItemChange(item.id, 'variety', e.target.value)}
                  style={{ ...inputStyle }}
                >
                  {varietyOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Length</label>
                <select
                  value={item.length}
                  onChange={e => onItemChange(item.id, 'length', e.target.value)}
                  style={{ ...inputStyle }}
                >
                  {lengthOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* 2 columnas: PIECES TYPE + TOTAL PIECES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Pieces Type</label>
                <select
                  value={item.pieceType || 'QB'}
                  onChange={e => onItemChange(item.id, 'pieceType', e.target.value)}
                  style={inputStyle}
                >
                  {pieceTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Total Pieces</label>
                <input
                  value={item.bn}
                  onChange={e => onItemChange(item.id, 'bn', e.target.value)}
                  style={inputStyle}
                  placeholder="0"
                />
              </div>
            </div>


            <div style={{ marginTop: '0.5rem' }}>
              <label style={labelStyle}>Unit Price $</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.35rem' }}>
                <input
                  value={item.unitPrice || ''}
                  onChange={e => onItemChange(item.id, 'unitPrice', e.target.value)}
                  style={inputStyle}
                  placeholder="0.00"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  title="Quitar valor"
                  onClick={() => adjustUnitPrice(item, -0.01)}
                  style={{ padding: '0.45rem 0.55rem' }}
                >
                  <Minus size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  title="Agregar valor"
                  onClick={() => adjustUnitPrice(item, 0.01)}
                  style={{ padding: '0.45rem 0.55rem' }}
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  title="Guardar como predeterminado"
                  onClick={() => setAsDefaultUnitPrice(item)}
                  style={{ padding: '0.45rem 0.55rem' }}
                >
                  <Pin size={13} />
                </button>
              </div>
            </div>

          </div>
        ))}


        {/* Divider */}
        <div style={{ borderTop: '1.5px dashed var(--glass-border)', margin: '0.25rem 0' }} />

        {/* AGREGAR A LISTA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={() => onAddToBatch('sticker')}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(56, 189, 248, 0.45) 100%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={15} /> LOTE ETIQUETA
            {labelsBatchCount > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                borderRadius: '999px', padding: '0.05rem 0.4rem',
                fontSize: '0.7rem'
              }}>
                {labelsBatchCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => onAddToBatch('a4')}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.65) 0%, rgba(225, 29, 72, 0.5) 100%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={15} /> LOTE INVOICE
            {invoiceBatchCount > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                borderRadius: '999px', padding: '0.05rem 0.4rem',
                fontSize: '0.7rem'
              }}>
                {invoiceBatchCount}
              </span>
            )}
          </button>
        </div>

        {/* Imprimir */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={() => onPrint('sticker')}
            style={{
              padding: '0.6rem 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(56, 189, 248, 0.45) 100%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Printer size={14} /> Etiqueta
          </button>
          <button
            onClick={() => onPrint('a4')}
            style={{
              padding: '0.6rem 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.03)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'none'; }}
          >
            <Printer size={14} /> Factura A4
          </button>
        </div>

      </div>
    </div>
  );
}
