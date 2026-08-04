import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Tag, Trash2, Eye, X, Download, Upload, Clipboard, Printer, Mail } from 'lucide-react';
import LabelPreview from './LabelPreview';
import CommercialInvoicePreview from './CommercialInvoicePreview';
import GeneralSummaryPreview from './GeneralSummaryPreview';
import RouteSheetPreview from './RouteSheetPreview';
import EmailModal from './EmailModal';

function normalizeDocumentRow(row) {
  const rawData = row?.full_data_json ?? row?.data ?? row?.fullDataJson ?? null;
  let parsedData = rawData;

  if (typeof rawData === 'string') {
    try {
      parsedData = JSON.parse(rawData);
    } catch (error) {
      console.error('Error parsing document payload', error);
      parsedData = null;
    }
  }

  const itemsRaw = row?.items_json ?? row?.itemsJson ?? null;
  let parsedItems = itemsRaw;
  if (typeof itemsRaw === 'string') {
    try {
      parsedItems = JSON.parse(itemsRaw);
    } catch (error) {
      console.error('Error parsing document items', error);
      parsedItems = [];
    }
  }

  return {
    ...row,
    data: parsedData || {},
    items: Array.isArray(parsedItems) ? parsedItems : []
  };
}

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [emailDoc, setEmailDoc] = useState(null); // doc para enviar por email

  const getDocCliente = (doc) => {
    const value = doc?.data?.cliente
      || doc?.data?.client
      || doc?.data?.clienteNombre
      || doc?.data?.consignee
      || '';
    return String(value).trim();
  };

  useEffect(() => {
    async function loadDocuments() {
      if (window.desktop?.dbQuery) {
        try {
          const rows = await window.desktop.dbQuery('SELECT * FROM documents ORDER BY printDate DESC');
          const parsedRows = rows.map(normalizeDocumentRow);
          setDocuments(parsedRows);
        } catch (error) {
          console.error('Error al cargar documentos de SQLite:', error);
        }
      } else {
        // Fallback a local storage
        const saved = localStorage.getItem('printed_documents');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const sorted = parsed.sort((a, b) => new Date(b.printDate) - new Date(a.printDate));
            setDocuments(sorted);
          } catch (e) {
            console.error('Error parsing documents', e);
          }
        }
      }
    }
    loadDocuments();
  }, []);

  const clearHistory = async () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial?')) {
      if (window.desktop?.dbQuery) {
        await window.desktop.dbQuery('DELETE FROM documents');
      }
      localStorage.removeItem('printed_documents');
      setDocuments([]);
    }
  };

  const exportBackup = async () => {
    let printedDocuments = [];
    if (window.desktop?.dbQuery) {
      const rows = await window.desktop.dbQuery('SELECT * FROM documents');
      printedDocuments = rows.map(normalizeDocumentRow);
    } else {
      printedDocuments = JSON.parse(localStorage.getItem('printed_documents') || '[]');
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      printedDocuments: printedDocuments,
      suppliers: JSON.parse(localStorage.getItem('suppliers_registry_v4') || '[]'),
      payments: JSON.parse(localStorage.getItem('payments_registry_v1') || '[]'),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo-historial-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.printedDocuments) {
          localStorage.setItem('printed_documents', JSON.stringify(parsed.printedDocuments));
          setDocuments(parsed.printedDocuments);
          alert('Historial importado con éxito.');
        }
      } catch {
        alert('Error al importar el archivo.');
      }
    };
    reader.readAsText(file);
  };

  const groupDocsByDayAndType = (docs, type) => {
    const filtered = docs.filter(d => d.type === type);
    const groups = {};
    
    filtered.forEach(doc => {
      // Intentamos usar la fecha de guardado (printDate)
      const dateObj = doc.printDate ? new Date(doc.printDate) : new Date();
      if (isNaN(dateObj.getTime())) return;

      const dayKey = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      
      if (!groups[dayKey]) {
        groups[dayKey] = {
          dateString: dayKey,
          timestamp: dateObj.setHours(0,0,0,0),
          clients: new Set(),
          items: []
        };
      }
      
      groups[dayKey].items.push(doc);
      // Añadir clientes únicos
      const cliente = getDocCliente(doc);
      if (cliente) {
        groups[dayKey].clients.add(cliente);
      }
    });

    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Historial de Documentos</h1>
          <p className="text-secondary">Registro de todas las facturas y etiquetas generadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={exportBackup} style={{ color: 'var(--primary)', borderColor: 'var(--primary)', fontSize: '0.85rem' }}>
            <Download size={16} style={{ marginRight: '0.4rem' }} /> Exportar
          </button>
          <label className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <Upload size={16} style={{ marginRight: '0.4rem' }} /> Importar
            <input type="file" hidden onChange={importBackup} accept=".json" />
          </label>
          {documents.length > 0 && (
            <button className="btn btn-outline" onClick={clearHistory} style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.85rem' }}>
              <Trash2 size={16} style={{ marginRight: '0.4rem' }} /> Borrar
            </button>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No hay documentos generados</h3>
          <p>Los documentos aparecerán aquí una vez que presiones el botón "Imprimir" en el Editor.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Acordeón de Etiquetas */}
          <details 
            className="card"
            style={{ 
              marginBottom: '1rem'
            }}
          >
            <summary style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              📦 ETIQUETAS ({documents.filter(d => d.type === 'sticker').length})
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gap: '1rem' }}>
              {groupDocsByDayAndType(documents, 'sticker').length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem' }}>No hay etiquetas guardadas.</div>
              ) : (
                groupDocsByDayAndType(documents, 'sticker').map((group, index) => (
                  <details key={index} style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <summary style={{ padding: '1rem 1.25rem', fontWeight: 600, cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} /> {group.dateString}
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '99px', color: 'var(--text-primary)' }}>
                          {group.items.length} ítems
                        </span>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '50%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Clientes: {Array.from(group.clients).join(', ') || 'N/A'}
                      </span>
                    </summary>
                    <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      {group.items.map((doc) => (
                        <div key={doc.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                              <Tag size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Etiqueta - {doc.data.facturaAnterior || 'Sin N°'}</h3>
                              <div className="flex gap-4 text-secondary" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(doc.printDate).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{doc.data.marcacion}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DAE: {doc.data.dae || 'N/A'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button 
                                onClick={() => setPreviewDoc(doc)}
                                className="btn btn-outline" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', display: 'flex', gap: '0.3rem' }}
                              >
                                <Eye size={14} /> Ver
                              </button>
                              <button
                                onClick={() => setEmailDoc(doc)}
                                className="btn btn-outline"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', display: 'flex', gap: '0.3rem', color: 'var(--primary)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                                title="Enviar por correo"
                              >
                                <Mail size={14} /> Email
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))
              )}
            </div>
          </details>

          {/* Acordeón de Facturas */}
          <details 
            className="card"
            style={{ 
              marginBottom: '1rem'
            }}
          >
            <summary style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              📄 DOC. INVOICE ({documents.filter(d => d.type === 'a4').length})
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gap: '1rem' }}>
              {groupDocsByDayAndType(documents, 'a4').length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem' }}>No hay doc. invoice guardados.</div>
              ) : (
                groupDocsByDayAndType(documents, 'a4').map((group, index) => (
                  <details key={index} style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <summary style={{ padding: '1rem 1.25rem', fontWeight: 600, cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} /> {group.dateString}
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '99px', color: 'var(--text-primary)' }}>
                          {group.items.length} ítems
                        </span>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '50%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Clientes: {Array.from(group.clients).join(', ') || 'N/A'}
                      </span>
                    </summary>
                    <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      {group.items.map((doc) => (
                        <div key={doc.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Doc. Invoice - {doc.data.facturaAnterior || 'Sin N°'}</h3>
                              <div className="flex gap-4 text-secondary" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(doc.printDate).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                Cliente: {getDocCliente(doc) || 'N/A'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                Marca: {doc.data.marcacion || 'N/A'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doc.data.agencia}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button 
                                onClick={() => setPreviewDoc(doc)}
                                className="btn btn-outline" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', display: 'flex', gap: '0.3rem' }}
                              >
                                <Eye size={14} /> Ver
                              </button>
                              <button
                                onClick={() => setEmailDoc(doc)}
                                className="btn btn-outline"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', display: 'flex', gap: '0.3rem', color: 'var(--primary)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                                title="Enviar por correo"
                              >
                                <Mail size={14} /> Email
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))
              )}
            </div>
          </details>

          {/* Acordeón de HOJA RESUMEN */}
          <details 
            className="card"
            style={{ 
              marginBottom: '1rem'
            }}
          >
            <summary style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
              📊 HOJA RESUMEN ({documents.filter(d => d.type === 'hoja1').length})
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gap: '1rem' }}>
              {groupDocsByDayAndType(documents, 'hoja1').length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem' }}>No hay resúmenes guardados.</div>
              ) : (
                groupDocsByDayAndType(documents, 'hoja1').map((group, index) => (
                  <details key={index} style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <summary style={{ padding: '1rem 1.25rem', fontWeight: 600, cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(52, 211, 153, 0.12)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} /> {group.dateString}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold' }}>{group.items.length} reportes</span>
                    </summary>
                    <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      {group.items.map((doc) => (
                        <div key={doc.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                              <Clipboard size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Reporte Resumen - {doc.data.cliente}</h3>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(doc.printDate).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <button onClick={() => setPreviewDoc(doc)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}><Eye size={14} /> Ver</button>
                        </div>
                      ))}
                    </div>
                  </details>
                ))
              )}
            </div>
          </details>

          {/* Acordeón de HOJA RUTA */}
          <details 
            className="card"
            style={{ 
              marginBottom: '1rem'
            }}
          >
            <summary style={{ padding: '1.25rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
              🗺️ HOJA RUTA ({documents.filter(d => d.type === 'ruta').length})
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gap: '1rem' }}>
              {groupDocsByDayAndType(documents, 'ruta').length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem' }}>No hay hojas de ruta guardadas.</div>
              ) : (
                groupDocsByDayAndType(documents, 'ruta').map((group, index) => (
                  <details key={index} style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <summary style={{ padding: '1rem 1.25rem', fontWeight: 600, cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(139, 92, 246, 0.12)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} /> {group.dateString}
                      </span>
                    </summary>
                    <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      {group.items.map((doc) => (
                        <div key={doc.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                              <Printer size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Ruta - {doc.data.cliente}</h3>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.data.hawb}</span>
                            </div>
                          </div>
                          <button onClick={() => setPreviewDoc(doc)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}><Eye size={14} /> Ver</button>
                        </div>
                      ))}
                    </div>
                  </details>
                ))
              )}
            </div>
          </details>

        </div>
      )}

      <EmailModal
        isOpen={!!emailDoc}
        onClose={() => setEmailDoc(null)}
        docLabel={emailDoc ? `${emailDoc.type === 'sticker' ? 'Etiqueta' : emailDoc.type === 'a4' ? 'Invoice' : emailDoc.type === 'hoja1' ? 'Hoja Resumen' : 'Hoja Ruta'} - ${emailDoc.data?.facturaAnterior || emailDoc.data?.cliente || 'Sin N°'}` : ''}
        subject={emailDoc ? `AgroDocs - ${emailDoc.type === 'sticker' ? 'Etiqueta' : emailDoc.type === 'a4' ? 'Commercial Invoice' : emailDoc.type === 'hoja1' ? 'Hoja Resumen' : 'Hoja de Ruta'} ${emailDoc.data?.facturaAnterior || ''}` : ''}
      />

      {/* Modal de Previsualización */}
      {previewDoc && (
        <div 
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
            zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', maxHeight: '90vh', maxWidth: '95vw',
              color: 'black'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' 
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <Eye size={18} color="var(--primary)" />
                Previsualización de Documento
              </h3>
              <button 
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transformOrigin: 'top center', transform: previewDoc.type === 'sticker' ? 'scale(0.85)' : 'scale(0.7)' }}>
                {previewDoc.type === 'sticker' && <LabelPreview data={previewDoc.data} zoom={1} />}
                {previewDoc.type === 'a4' && <CommercialInvoicePreview data={previewDoc.data} zoom={1} />}
                {previewDoc.type === 'hoja1' && <GeneralSummaryPreview data={previewDoc.data} zoom={1} />}
                {previewDoc.type === 'ruta' && <RouteSheetPreview data={previewDoc.data} zoom={1} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
