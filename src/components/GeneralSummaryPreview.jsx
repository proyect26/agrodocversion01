import React from 'react';
import * as XLSX from 'xlsx';
import './GeneralSummaryPreview.css'; // new CSS file for styling

const logoInvoice = './logo_invoice.png';
const toInt = (value) => Math.max(0, Math.round(Number(value) || 0));
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Simple BarChart component
const BarChart = ({ data }) => {
  const maxVal = Math.max(...Object.values(data), 0);
  return (
    <div className="barchart">
      {Object.entries(data).map(([client, value]) => (
        <div key={client} className="barchart-item">
          <div className="label" title={client}>{client}</div>
          <div className="bar" style={{ height: `${(value / maxVal) * 100}%` }} />
          <div className="value">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default function GeneralSummaryPreview({ data, batch = [], zoom = 0.85 }) {
  // Consolidar todos los documentos: El actual + lo que haya en el lote
  const allDocs = [...batch];
  if (data && data.items && data.items.length > 0) {
    // Evitar duplicados si el actual ya está en el lote (opcional, pero por ahora los unimos)
    allDocs.push(data);
  }

  // Aplanar todos los ítems de todos los documentos para la tabla de 14 columnas
  const allRows = [];
  const clientBoxes = {};
  allDocs.forEach((doc) => {
    const items = Array.isArray(doc.items) ? doc.items : [];
    items.forEach((item) => {
      const pieces = toInt(item.bn);
      const rate = (item.pieceType === 'EB' ? 0.125 : (item.pieceType === 'FB' ? 1.0 : ((item.pieceType === 'HB' || item.pieceType === 'HB0') ? 0.5 : 0.25)));
      const eqBoxes = round2(pieces * rate);
      const totalStems = pieces * 120; // Standard 120 stems per piece as per Invoice
      const price = Number(item.unitPrice) || 0;
      const fob = round2(totalStems * price);

      // Accumulate boxes per client for chart
      const clientKey = (doc.cliente || 'N/A').toUpperCase();
      clientBoxes[clientKey] = (clientBoxes[clientKey] || 0) + eqBoxes;

      allRows.push({
        fac: doc.facturaAnterior || '-',
        mawb: doc.mawb || '-',
        hawb: doc.hawb || '-',
        bodega: doc.bodega || '-',
        fecha: doc.fechaFactura || '-',
        agencia: doc.agencia || '-',
        cliente: clientKey,
        dae: doc.dae || '-',
        destino: doc.pais || '-',
        cajas: eqBoxes,
        variedad: `${(item.variety || '').toUpperCase()} ${item.length || ''}`.trim(),
        precio: price.toFixed(2),
        fob: fob,
        tallos: totalStems,
        eb: item.pieceType === 'EB' ? pieces : 0,
        qb: item.pieceType === 'QB' ? pieces : 0,
        hb: (item.pieceType === 'HB' || item.pieceType === 'HB0') ? pieces : 0,
        fb: item.pieceType === 'FB' ? pieces : 0,
      });
    });
  });

  // Totals calculations (unchanged)
  const totalEB = allRows.reduce((s, r) => s + r.eb, 0);
  const totalQB = allRows.reduce((s, r) => s + r.qb, 0);
  const totalHB = allRows.reduce((s, r) => s + r.hb, 0);
  const totalFB = allRows.reduce((s, r) => s + r.fb, 0);
  const grandTotalCajas = round2((totalEB * 0.125) + (totalQB * 0.25) + (totalHB * 0.5) + (totalFB * 1.0));
  const grandTotalFob = round2(allRows.reduce((s, r) => s + r.fob, 0));
  const grandTotalTallos = allRows.reduce((s, r) => s + r.tallos, 0);

  const handleDownloadExcel = () => {
    const wsData = [
      ["N° Fac", "MAWB No.", "HAWB No.", "BODEGA", "Fecha Factura", "Agencia de Carga", "Consignatario Final", "DAE", "Destino", "Cajas", "VARIEDAD", "PRECIO", "FOB", "Tallos"],
      ...allRows.map(r => [
        r.fac, r.mawb, r.hawb, r.bodega, r.fecha, r.agencia, r.cliente, r.dae, r.destino, r.cajas, r.variedad, r.precio, r.fob.toFixed(2), r.tallos
      ]),
      ["TOTALES", "", "", "", "", "", "", "", "", grandTotalCajas, "", "", grandTotalFob.toFixed(2), grandTotalTallos]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
    XLSX.writeFile(wb, `Reporte_Guia_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Styled table cell & header definitions (unchanged)
  const thStyle = {
    border: '1px solid black',
    padding: '6px 4px',
    fontSize: '0.62rem',
    backgroundColor: '#f1f5f9',
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: '1.2',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
    verticalAlign: 'middle'
  };

  const tdStyle = {
    border: '1px solid black',
    padding: '4px',
    fontSize: '0.65rem',
    textAlign: 'center',
    verticalAlign: 'middle',
    wordBreak: 'break-word'
  };

  return (
    <div className="preview-section card hoja1-excel-wrapper" style={{ marginTop: '2rem' }}>
      {/* Export button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', padding: '0 1rem' }}>
        <button onClick={handleDownloadExcel} style={{
          backgroundColor: '#166534',
          color: 'white',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: 'var(--shadow-sm)'
        }}>📥 Descargar Excel (Hoja 1)</button>
      </div>

      {/* Bar chart for client distribution */}
      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Distribución por Cliente (Cajas)</h3>
      <BarChart data={clientBoxes} />

      {/* Table */}
      <div className="document-container" style={{ backgroundColor: '#e5e7eb', overflowX: 'auto' }}>
        <div className="document-sheet hoja1-excel" style={{
          padding: '1.5rem',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: 'black',
          minWidth: '1350px',
          width: 'fit-content',
          minHeight: '842px',
          position: 'relative',
          zoom,
          backgroundColor: 'white',
          margin: '0 auto',
          boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ backgroundColor: '#166534', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
              <img src={logoInvoice} alt="Logo" style={{ maxHeight: '60px' }} />
            </div>
            <div style={{ marginLeft: '1.5rem', color: 'white' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>REPORT DE GUÍA / RESUMEN GENERAL</h1>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black' }}>
            <colgroup>
              <col style={{ width: '65px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '75px' }} />
              <col style={{ width: '85px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '50px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '70px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>N° Fac</th>
                <th style={thStyle}>MAWB No.</th>
                <th style={thStyle}>HAWB No.</th>
                <th style={thStyle}>BODEGA</th>
                <th style={thStyle}>Fecha Factura</th>
                <th style={thStyle}>Agencia de Carga</th>
                <th style={thStyle}>Consignatario Final</th>
                <th style={thStyle}>DAE</th>
                <th style={thStyle}>Destino</th>
                <th style={thStyle}>Cajas</th>
                <th style={thStyle}>VARIEDAD</th>
                <th style={thStyle}>PRECIO</th>
                <th style={thStyle}>FOB</th>
                <th style={thStyle}>Tallos</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td style={tdStyle}>{row.fac}</td>
                  <td style={tdStyle}>{row.mawb}</td>
                  <td style={tdStyle}>{row.hawb}</td>
                  <td style={tdStyle}>{row.bodega}</td>
                  <td style={tdStyle}>{row.fecha}</td>
                  <td style={tdStyle}>{row.agencia}</td>
                  <td style={tdStyle}>{row.cliente}</td>
                  <td style={tdStyle}>{row.dae}</td>
                  <td style={tdStyle}>{row.destino}</td>
                  <td style={tdStyle}>{row.cajas}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{row.variedad}</td>
                  <td style={tdStyle}>$ {row.precio}</td>
                  <td style={tdStyle}>$ {row.fob.toFixed(2)}</td>
                  <td style={tdStyle}>{row.tallos}</td>
                </tr>
              ))}
              {/* Empty rows to keep grid size consistent */}
              {[...Array(Math.max(0, 15 - allRows.length))].map((_, i) => (
                <tr key={`empty-${i}`} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                  {[...Array(14)].map((__, j) => (
                    <td key={`empty-cell-${j}`} style={{ ...tdStyle, height: '22px' }} />
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 900 }}>
                <td colSpan={9} style={{ ...tdStyle, textAlign: 'right', paddingRight: '1rem' }}>TOTALES GENERALES</td>
                <td style={tdStyle}>{grandTotalCajas}</td>
                <td style={tdStyle} />
                <td style={tdStyle} />
                <td style={tdStyle}>$ {grandTotalFob.toFixed(2)}</td>
                <td style={tdStyle}>{grandTotalTallos}</td>
              </tr>
            </tfoot>
          </table>
          <div style={{ marginTop: '1rem', fontSize: '0.6rem', color: '#666', fontStyle: 'italic' }}>
            * Éste reporte consolida toda la información de carga activa en el lote actual.
          </div>
        </div>
      </div>
    </div>
  );
}

