import React from 'react';
import Barcode from 'react-barcode';

export default function LabelPreview({ data, zoom = 0.85 }) {
  const safeData = data || {
    facturaAnterior: '',
    serie: '',
    mawb: '',
    hawb: '',
    bodega: '',
    producto: '',
    cliente: '',
    fechaFactura: '',
    agencia: '',
    marcacion: '',
    dae: '',
    pais: ''
  };

  const row = (label, value, opts = {}) => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'baseline',
      gap: '0.5rem',
      fontSize: opts.large ? '1.1rem' : '0.8rem',
      fontWeight: opts.large ? 900 : 'bold',
      marginBottom: opts.mb ?? '0.5rem',
      textAlign: 'center',
      ...opts.style
    }}>
      {label && <span>{label}</span>}
      <span style={{ fontWeight: opts.valueWeight ?? 'bold' }}>{value}</span>
    </div>
  );

  return (
    <div className="preview-section card sticker-wrapper">
      <div className="preview-header flex items-center justify-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Vista Previa de Etiqueta</h2>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
            Formato Aduanero / SENAE
          </p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => window.print()}>
          Imprimir
        </button>
      </div>

      <div className="document-container" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="document-sheet" id="print-area" style={{
          padding: '2rem 2.5rem',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: 'black',
          aspectRatio: '1 / 1.414',
          maxWidth: '500px',
          margin: '0 auto',
          width: '100%',
          zoom: zoom
        }}>

          {/* LOGO */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img
              src="./senae-logo.png"
              alt="Aduana del Ecuador SENAE"
              style={{ height: '100px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          </div>

          {/* CÓDIGO DE BARRAS */}
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            {safeData.dae ? (
              <Barcode
                value={safeData.dae}
                format="CODE128"
                width={2.2}
                height={70}
                displayValue={true}
                fontSize={20}
                font="monospace"
                margin={6}
              />
            ) : (
              <div style={{ padding: '1.5rem', border: '1px dashed #ccc', color: '#666', fontSize: '0.8rem' }}>
                Ingrese DAE para generar código
              </div>
            )}
          </div>

          {/* PAIS */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            <span>PAIS: </span>
            <span>{safeData.pais ? safeData.pais.toUpperCase() : ''}</span>
          </div>

          {/* LÍNEA DIVISORA */}
          <hr style={{ border: 'none', borderTop: '2.5px solid black', margin: '0.4rem 0 0.75rem 0' }} />

          {/* EXPORTADORA (grande, negrita) */}
          <div style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '0.5px' }}>
            {safeData.marcacion ? safeData.marcacion.toUpperCase() : ''}
          </div>

          {/* PRODUCTO */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            {safeData.producto ? safeData.producto.toUpperCase() : ''}
          </div>

          {/* RUC */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            RUC: 0502669674001
          </div>

          {/* AWB y HAWB en la misma línea */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            border: '1.5px solid black',
            padding: '0.4rem 0.75rem',
            marginBottom: '0.5rem',
          }}>
            <span>AWB&nbsp;&nbsp;{safeData.mawb}</span>
            <span>HAWB&nbsp;&nbsp;{safeData.hawb}</span>
          </div>

          {/* AGENCIA */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {safeData.agencia ? safeData.agencia.toUpperCase() : ''}
          </div>

          {/* CLIENTE */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            {safeData.cliente ? safeData.cliente.toUpperCase() : ''}
          </div>

          {/* TABLA: VARIETY LENGTH BN SISTEM */}
          <table style={{ width: '100%', fontSize: '0.75rem', fontWeight: 'bold', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#1e3a8a', borderBottom: '1.5px solid #1e3a8a' }}>
                <th style={{ padding: '0.3rem 0', textAlign: 'center' }}>VARIETY</th>
                <th style={{ padding: '0.3rem 0', textAlign: 'center' }}>LENGTH</th>
                <th style={{ padding: '0.3rem 0', textAlign: 'center' }}>BN</th>
                <th style={{ padding: '0.3rem 0', textAlign: 'center' }}>SISTEM</th>
              </tr>
            </thead>
            <tbody>
              {safeData.items && safeData.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.3rem 0', textAlign: 'center' }}>{item.variety ? item.variety.toUpperCase() : ''}</td>
                  <td style={{ padding: '0.3rem 0', textAlign: 'center' }}>{item.length ? item.length.toUpperCase() : ''}</td>
                  <td style={{ padding: '0.3rem 0', textAlign: 'center' }}>{item.bn}</td>
                  <td style={{ padding: '0.3rem 0', textAlign: 'center' }}>{item.sistem}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
