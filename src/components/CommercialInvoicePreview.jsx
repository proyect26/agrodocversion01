import { useEffect, useState } from 'react';
import { Pin, PinOff, Trash2, Printer } from 'lucide-react';

const logoInvoice = './logo_invoice.png';

const normalizePiecesType = (value) => {
  if (value === 'HB0' || value === 'HB') return 'HB0';
  if (value === 'EB') return 'EB';
  if (value === 'FB') return 'FB';
  return 'QB';
};
const toInt = (value) => Math.max(0, Math.round(Number(value) || 0));
const pieceTypeMultiplier = (piecesType) => {
  if (piecesType === 'HB0') return 0.5;
  if (piecesType === 'EB') return 0.125;
  if (piecesType === 'FB') return 1;
  return 0.25;
};
const calcEqFullBoxes = (totalPieces, piecesType) => totalPieces * pieceTypeMultiplier(piecesType);
const calcTotalUnt = (totalPieces) => totalPieces * 120;
const formatUnt = (value) => String(toInt(value));
const formatEq = (value) => {
  const n = Math.round((Number(value) || 0) * 100) / 100;
  return String(n);
};
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const calcUnitPrice = (item) => {
  const value = Number(item?.unitPrice);
  return Number.isFinite(value) ? value : 0;
};
const calcTotalValue = (totalUnt, unitPrice) => round2(totalUnt * unitPrice);
const TEMPLATE_STORAGE_KEY = 'commercial_invoice_template_v1';
const EDIT_MODE_STORAGE_KEY = 'commercial_invoice_edit_mode_v1';

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
        outlineOffset: editing ? '1px' : 0
      }}
      {...rest}
    >
      {value}
    </Tag>
  );
}

export default function CommercialInvoicePreview({ data, zoom = 0.85, onRemoveItem }) {
  const safeData = data || {};
  const [template, setTemplate] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || '{}');
      if (saved && typeof saved === 'object') setTemplate(saved);
    } catch {
      setTemplate({});
    }
    setIsEditMode(localStorage.getItem(EDIT_MODE_STORAGE_KEY) === '1');
  }, []);

  const saveField = (field, value) => {
    setTemplate((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      const next = !prev;
      localStorage.setItem(EDIT_MODE_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const rows = (safeData.items || []).map((item, index) => {
    const piecesType = normalizePiecesType(item.pieceType);
    const totalPieces = toInt(item.bn);
    const eqFullBoxes = calcEqFullBoxes(totalPieces, piecesType);
    const totalUnt = calcTotalUnt(totalPieces);
    const unitPrice = index === 0 ? calcUnitPrice(item) : 0;
    const totalValue = calcTotalValue(totalUnt, unitPrice);
    return {
      ...item,
      piecesType,
      totalPieces,
      eqFullBoxes,
      totalUnt,
      unitPrice,
      totalValue,
      productDescription: index === 0 ? `${item.variety || ''} ${item.length || ''}`.trim().toUpperCase() : ''
    };
  });

  const totalPieces = rows.reduce((acc, row) => acc + row.totalPieces, 0);
  const totalEqFullBoxes = rows.reduce((acc, row) => acc + row.eqFullBoxes, 0);
  const totalUnt = rows.reduce((acc, row) => acc + row.totalUnt, 0);
  const totalValue = round2(rows.reduce((acc, row) => acc + row.totalValue, 0));

  return (
    <div className="preview-section card a4-invoice-wrapper" style={{ marginTop: '2rem' }}>
      <div className="document-container" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Printer size={14} />
            Imprimir Invoice
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={toggleEditMode}
            title={isEditMode ? 'Desactivar edicion en hoja' : 'Activar edicion en hoja'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {isEditMode ? <PinOff size={14} /> : <Pin size={14} />}
            {isEditMode ? 'Bloquear hoja' : 'Editar hoja'}
          </button>
        </div>
        <div className="document-sheet commercial-invoice" style={{
          padding: '1.5rem 3rem',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: 'black',
          aspectRatio: '1 / 1.414',
          maxWidth: '800px',
          width: '100%',
          position: 'relative',
          zoom: zoom
        }}>

          {/* Main Top Header Banner */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <img 
              src={logoInvoice} 
              alt="Angel's Blooms" 
              style={{ maxHeight: '90px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            
            {/* Left Column (Title + Info Boxes) */}
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Title */}
              <div style={{ marginTop: '0.5rem', paddingLeft: '3rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  COMMERCIAL INVOICE No. <EditableField
                    field="facturaAnterior"
                    fallback={safeData.facturaAnterior || '557'}
                    editing={isEditMode}
                    template={template}
                    onSave={saveField}
                    style={{ marginLeft: '1rem', color: '#b91c1c' }}
                  />
                </h2>
              </div>

              {/* Left Side Info Boxes */}
              <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                <div style={{ border: '1px solid black', padding: '0.5rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '2px', marginBottom: '4px' }}>Shipper Name and Address</div>
                  <EditableField as="div" field="shipperName" fallback="ANGELES ALOMOTO / ANGEL'S BLOOMS" editing={isEditMode} template={template} onSave={saveField} style={{ fontWeight: 'bold', marginBottom: '4px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                    <span>ADDRESS:</span><EditableField field="shipperAddress" fallback="SAQUISILI" editing={isEditMode} template={template} onSave={saveField} />
                    <span>PHONE:</span><EditableField field="shipperPhone" fallback="Cel: +593 0992856598" editing={isEditMode} template={template} onSave={saveField} />
                    <span>RUC:</span><EditableField field="shipperRuc" fallback="0502669674001" editing={isEditMode} template={template} onSave={saveField} />
                  </div>
                  <EditableField as="div" field="shipperCountryLine" fallback="SAQUISILI - ECUADOR" editing={isEditMode} template={template} onSave={saveField} style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }} />
                </div>

                <div style={{ border: '1px solid black', fontSize: '0.75rem' }}>
                  <EditableField as="div" field="grownLine" fallback="FULLY GROWN IN ECUADOR" editing={isEditMode} template={template} onSave={saveField} style={{ textAlign: 'center', borderBottom: '1px solid black', padding: '2px', backgroundColor: '#e2e8f0' }} />
                  <EditableField as="div" field="sagLine" fallback="SAG UNITED" editing={isEditMode} template={template} onSave={saveField} style={{ textAlign: 'center', borderBottom: '1px solid black', padding: '2px', fontWeight: 'bold' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', borderBottom: '1px solid black' }}>
                    <span style={{ borderRight: '1px solid black', padding: '2px 4px' }}>Country</span>
                    <EditableField field="pais" fallback={safeData.pais || 'ESTADOS UNIDOS'} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '2px 4px', fontWeight: 'bold', textAlign: 'center' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', borderBottom: '1px solid black' }}>
                    <span style={{ borderRight: '1px solid black', padding: '2px 4px' }}>Phone</span>
                    <EditableField field="countryPhone" fallback="" editing={isEditMode} template={template} onSave={saveField} style={{ padding: '2px 4px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                    <span style={{ borderRight: '1px solid black', padding: '2px 4px' }}>DAE</span>
                    <EditableField field="dae" fallback={safeData.dae || '05520234001836533'} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '2px 4px', fontWeight: 'bold', textAlign: 'center' }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side Column */}
            <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>PO</div>
                <EditableField as="div" field="po" fallback="" editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center', minHeight: '20px' }} />
              </div>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>DATE</div>
                <EditableField as="div" field="fechaFactura" fallback={safeData.fechaFactura || '23-nov-23'} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center' }} />
              </div>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>Country Code</div>
                <EditableField as="div" field="countryCode" fallback="EC" editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center' }} />
              </div>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>MAWB No.</div>
                <EditableField as="div" field="mawb" fallback={safeData.mawb || '729-4736 4682'} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center' }} />
              </div>
              <EditableField as="div" field="hawb" fallback={safeData.hawb || 'FFC02461371'} editing={isEditMode} template={template} onSave={saveField} style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '1rem' }} />
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>Airline</div>
                <EditableField as="div" field="airline" fallback="ATLAS AIR" editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center' }} />
              </div>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>Freight Forwarder</div>
                <EditableField as="div" field="agencia" fallback={safeData.agencia || 'FRESH FLOWER CARGO'} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }} />
              </div>
              <div style={{ border: '1px solid black' }}>
                <div style={{ borderBottom: '1px solid black', textAlign: 'center', padding: '2px' }}>Cliente</div>
                <EditableField as="div" field="clienteHeader" fallback={safeData.cliente || safeData.client || ''} editing={isEditMode} template={template} onSave={saveField} style={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', border: '1px solid black', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '4px' }}>PIECES<br />TYPE</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>TOTAL<br />PIECES</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>EQ. FULL<br />BOXES</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>PRODUCT<br />DESCRIPTION</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>NAN<br />DINA</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>TOTAL UNT.<br />TOTAL</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>UNIT PRICE<br />$</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>TOTAL<br />VALUE USD.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ position: 'relative' }}>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{row.piecesType}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{row.totalPieces}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{formatEq(row.eqFullBoxes)}</td>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'left' }}>{row.productDescription}</td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{formatUnt(row.totalUnt)}</td>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{row.unitPrice.toFixed(2)}</td>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right', position: 'relative' }}>
                    {row.totalValue.toFixed(2)}
                    {/* Botón Borrar Item Flotante (no afecta el ancho de la tabla) */}
                    {onRemoveItem && (
                      <button
                        className="no-print"
                        onClick={() => onRemoveItem(row.id)}
                        title="Borrar flor de la lista"
                        style={{
                          position: 'absolute',
                          right: '-32px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '4px',
                          padding: '3px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s',
                          zIndex: 10
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {/* Empty padding rows to maintain format */}
              {[...Array(Math.max(1, 8 - rows.length))].map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none', height: '22px' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                  <td contentEditable suppressContentEditableWarning style={{ border: '1px solid black', padding: '4px', outline: 'none' }}></td>
                </tr>
              ))}
              <tr>
                <td style={{ border: 'none', padding: '4px', fontWeight: 'bold' }}>TOTAL</td>
                <td style={{ border: '1px solid black', padding: '4px', borderBottom: '3px solid black' }}>{totalPieces}</td>
                <td style={{ border: '1px solid black', padding: '4px', borderBottom: '3px solid black' }}>{formatEq(totalEqFullBoxes)}</td>
                <td colSpan="2" style={{ textAlign: 'right', padding: '4px' }}></td>
                <td style={{ border: '1px solid black', padding: '4px', borderBottom: '3px solid black', textAlign: 'right' }}>{formatUnt(totalUnt)}</td>
                <td style={{ border: '1px solid black', padding: '4px', borderBottom: '3px solid black' }}></td>
                <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'right', borderBottom: '3px solid black' }}>
                  {totalValue.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Area */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>BILL TO</span>
                <EditableField field="billTo" fallback="SAG UNITED" editing={isEditMode} template={template} onSave={saveField} />
              </div>
              <EditableField as="div" field="prepareTitleLine" fallback="Name and Title of person Preparing Invoice" editing={isEditMode} template={template} onSave={saveField} />
              <EditableField as="div" field="prepareName" fallback="ANGELES ALOMOTO / ANGEL'S BLOOMS" editing={isEditMode} template={template} onSave={saveField} style={{ fontWeight: 'bold' }} />
              <EditableField as="div" field="prepareRole" fallback="Sales Manager" editing={isEditMode} template={template} onSave={saveField} style={{ fontWeight: 'bold' }} />

              <div style={{ marginTop: '2rem', textAlign: 'center', width: '200px' }}>
                <EditableField field="customUseOnly" fallback="CUSTOM USE ONLY" editing={isEditMode} template={template} onSave={saveField} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.65rem', marginRight: '0.5rem' }}>CLIENTE</span>
                <div style={{ border: '1px solid #ccc', width: '130px', height: '20px', padding: '0 4px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <EditableField field="clienteFooter" fallback={safeData.cliente || safeData.client || safeData.marcacion || ''} editing={isEditMode} template={template} onSave={saveField} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 100px', rowGap: '4px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.65rem' }}>MARCA:</span>
                <EditableField field="marca" fallback={safeData.marcacion || ''} editing={isEditMode} template={template} onSave={saveField} style={{ borderBottom: '1px dotted black' }} />
                <span style={{ fontWeight: 'bold', fontSize: '0.65rem' }}>BODEGA:</span>
                <EditableField field="bodega" fallback={safeData.bodega || '0'} editing={isEditMode} template={template} onSave={saveField} style={{ borderBottom: '1px dotted black', textAlign: 'center' }} />
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <EditableField field="usdaLine" fallback="USDA, APHIS, P.P.Q. Use Only" editing={isEditMode} template={template} onSave={saveField} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
