import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Pin, PinOff } from 'lucide-react';

const logoInvoice = './logo_invoice.png';

const TEMPLATE_STORAGE_KEY = 'hoja_ruta_template_v1';
const EDIT_MODE_STORAGE_KEY = 'hoja_ruta_edit_mode_v1';

function EditableField({
  as: Tag = 'span',
  field,
  fallback = '',
  editing,
  template,
  onSave,
  style,
  ...rest
}) {
  const value = template[field] ?? fallback ?? '';
  return (
    <Tag
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={(e) => onSave(field, e.currentTarget.textContent || '')}
      style={{
        ...style,
        outline: editing ? '1px dashed #6366f1' : 'none',
        outlineOffset: editing ? '1px' : 0,
        minWidth: editing ? '10px' : 'auto',
        display: (Tag === 'span') ? 'inline-block' : (style?.display || 'block')
      }}
      {...rest}
    >
      {value}
    </Tag>
  );
}

export default function RouteSheetPreview({ data, batch = [], zoom = 0.85 }) {
  const [editing, setEditing] = useState(() => {
    return localStorage.getItem(EDIT_MODE_STORAGE_KEY) === 'true';
  });
  const [template, setTemplate] = useState(() => {
    const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isPinned, setIsPinned] = useState(() => !!localStorage.getItem(TEMPLATE_STORAGE_KEY));

  useEffect(() => {
    localStorage.setItem(EDIT_MODE_STORAGE_KEY, editing);
  }, [editing]);

  const handleSaveField = (field, value) => {
    const newTemplate = { ...template, [field]: value };
    setTemplate(newTemplate);
    if (isPinned) {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(newTemplate));
    }
  };

  const togglePin = () => {
    if (isPinned) {
      localStorage.removeItem(TEMPLATE_STORAGE_KEY);
      setIsPinned(false);
    } else {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(template));
      setIsPinned(true);
    }
  };

  // Lógica de Agrupación por Cliente (EB, QB, HB, FB)
  const currentItems = data?.items || [];
  const allInvoices = [...batch];
  if (currentItems.length > 0) {
    allInvoices.push(data);
  }

  const clientSummary = allInvoices.reduce((acc, inv) => {
    const clientName = (inv.cliente || 'SIN NOMBRE').toUpperCase();
    if (!acc[clientName]) {
      acc[clientName] = { 
        cliente: clientName, 
        eb: 0, qb: 0, hb: 0, fb: 0, 
        agencia: inv.agencia || '', 
        bodega: inv.bodega || '' 
      };
    }

    const items = inv.items || [];
    items.forEach(item => {
      const type = (item.pieceType || 'QB').toUpperCase();
      const count = Math.max(0, Math.round(Number(item.bn) || 0));
      
      if (type === 'EB') acc[clientName].eb += count;
      else if (type === 'QB') acc[clientName].qb += count;
      else if (type === 'HB' || type === 'HB0') acc[clientName].hb += count;
      else if (type === 'FB') acc[clientName].fb += count;
    });

    return acc;
  }, {});

  const rows = Object.values(clientSummary);

  const totalEB = rows.reduce((s, r) => s + r.eb, 0);
  const totalQB = rows.reduce((s, r) => s + r.qb, 0);
  const totalHB = rows.reduce((s, r) => s + r.hb, 0);
  const totalFB = rows.reduce((s, r) => s + r.fb, 0);
  const totalEq = (totalEB * 0.125) + (totalQB * 0.25) + (totalHB * 0.5) + totalFB;

  const handleDownloadExcel = () => {
    const wsData = [
      ["CLIENTE", "EB", "QB", "HB", "FB", "AGENCIA", "BODEGA"],
      ...rows.map(r => [r.cliente, r.eb || "", r.qb || "", r.hb || "", r.fb || "", r.agencia, r.bodega]),
      ["TOTALES", totalEB, totalQB, totalHB, totalFB, "", ""],
      ["TOTAL EQ FB", totalEq.toFixed(2), "", "", "", "", ""]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja de Ruta");
    XLSX.writeFile(wb, `HojaRuta_Lote_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="preview-section card route-sheet-wrapper" style={{ marginTop: '2rem' }}>
      {/* Controles de Edición y Excel */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
         <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              onClick={() => setEditing(!editing)}
              className={`btn ${editing ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              {editing ? '💾 Finalizar Edición' : '✍️ Editar Hoja Ruta'}
            </button>
            <button 
              onClick={togglePin}
              className={`btn ${isPinned ? 'btn-primary' : 'btn-outline'}`}
              title={isPinned ? "Desanclar plantilla" : "Anclar valores como plantilla"}
              style={{ padding: '0.4rem', width: '36px' }}
            >
              {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
         </div>
         <button 
          onClick={handleDownloadExcel}
          style={{
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
            gap: '0.4rem'
          }}
        >
          📥 Excel Hoja Ruta
        </button>
      </div>

      <div className="document-container" style={{ backgroundColor: '#e5e7eb' }}>
        <div
          className="document-sheet hoja-ruta"
          style={{
            padding: '2.5rem 3.5rem',
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: 'black',
            aspectRatio: '1 / 1.414',
            maxWidth: '850px',
            width: '100%',
            position: 'relative',
            zoom,
            backgroundColor: 'white'
          }}
        >
          {/* Header al estilo de la imagen */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <img src={logoInvoice} alt="Logo" style={{ maxHeight: '72px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>FECHA</div>
              <EditableField 
                editing={editing} 
                template={template} 
                onSave={handleSaveField} 
                field="fecha" 
                fallback={new Date().toLocaleDateString('es-EC')} 
                style={{ textDecoration: 'underline', fontSize: '0.9rem', cursor: editing ? 'text' : 'inherit' }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
             <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>HOJA DE RUTA / LOGÍSTICA DE CARGA</h1>
             <div style={{ height: '3px', background: '#000', width: '100px', margin: '0.4rem auto' }}></div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            border: '1px solid #000',
            padding: '1rem',
            borderRadius: '4px'
          }}>
             <div>
                <strong>MAWB:</strong> <EditableField editing={editing} template={template} onSave={handleSaveField} field="mawb" fallback={data?.mawb || '-'} />
             </div>
             <div>
                <strong>HAWB:</strong> <EditableField editing={editing} template={template} onSave={handleSaveField} field="hawb" fallback={data?.hawb || '-'} />
             </div>
             <div>
                <strong>AEROLÍNEA:</strong> <EditableField editing={editing} template={template} onSave={handleSaveField} field="airline" fallback={data?.airline || 'ATLAS AIR'} />
             </div>
             <div>
                <strong>DESTINO:</strong> <EditableField editing={editing} template={template} onSave={handleSaveField} field="destino" fallback={data?.pais || 'ESTADOS UNIDOS'} />
             </div>
          </div>

          {/* Tabla Amarilla Estilo Imagen */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffeb3b' }}>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>CLIENTE</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '45px' }}>EB</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '45px' }}>QB</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '45px' }}>HB</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '45px' }}>FB</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>AGENCIA</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>BODEGA</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                   <td colSpan={7} style={{ border: '1px solid black', padding: '15px', textAlign: 'center', color: '#666' }}>
                     Agregue facturas al lote para el resumen
                   </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>{row.cliente}</td>
                    <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{row.eb || ''}</td>
                    <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{row.qb || ''}</td>
                    <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{row.hb || ''}</td>
                    <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{row.fb || ''}</td>
                    <td style={{ border: '1px solid black', padding: '6px' }}>{row.agencia}</td>
                    <td style={{ border: '1px solid black', padding: '6px' }}>{row.bodega}</td>
                  </tr>
                ))
              )}
              {/* Filas vacías para estilo */}
              {[...Array(Math.max(0, 10 - rows.length))].map((_, i) => (
                <tr key={`empty-${i}`}>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                   <td style={{ border: '1px solid black', padding: '16px' }}></td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#fafafa' }}>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>TOTALES</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{totalEB || 0}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{totalQB || 0}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{totalHB || 0}</td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{totalFB || 0}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}></td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{totalEq.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Observaciones Editable */}
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
             <strong>OBSERVACIONES:</strong>
             <EditableField 
               editing={editing} 
               template={template} 
               onSave={handleSaveField} 
               field="observaciones" 
               as="div"
               fallback="Carga en excelentes condiciones. Temperatura controlada." 
               style={{ 
                 marginTop: '0.4rem', 
                 border: '1px solid black', 
                 padding: '1rem', 
                 minHeight: '60px', 
                 borderRadius: '4px' 
               }}
             />
          </div>

          {/* Footer Editable Signatures */}
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderBottom: '1px solid black', minHeight: '30px' }}></div>
              <EditableField editing={editing} template={template} onSave={handleSaveField} field="sign1" fallback="CHOFER / TRANSPORTE" style={{ fontWeight: 'bold' }} />
            </div>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderBottom: '1px solid black', minHeight: '30px' }}></div>
              <EditableField editing={editing} template={template} onSave={handleSaveField} field="sign2" fallback="BODEGA ORIGEN" style={{ fontWeight: 'bold' }} />
            </div>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderBottom: '1px solid black', minHeight: '30px' }}></div>
              <EditableField editing={editing} template={template} onSave={handleSaveField} field="sign3" fallback="REVISIÓN AGENCIA" style={{ fontWeight: 'bold' }} />
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', textAlign: 'center', fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>
            ESTA HOJA DE RUTA DEBE ACOMPAÑAR A LA CARGA HASTA SU DESTINO FINAL
          </div>
        </div>
      </div>
    </div>
  );
}
