import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InvoiceForm from './components/InvoiceForm';
import LabelPreview from './components/LabelPreview';
import CommercialInvoicePreview from './components/CommercialInvoicePreview';
import GeneralSummaryPreview from './components/GeneralSummaryPreview';
import RouteSheetPreview from './components/RouteSheetPreview';
import DocumentsList from './components/DocumentsList';
import LabelsBatchPanel from './components/LabelsBatchPanel';
import SuppliersControl from './components/SuppliersControl';
import PaymentsRegistry from './components/PaymentsRegistry';
import CustomersManagement from './components/CustomersManagement';
import SettingsPanel from './components/SettingsPanel';
import CultivationGuide from './components/CultivationGuide';
import DecisionCenter from './components/DecisionCenter';
import AIAssistantView from './components/AIAssistantView';
import UserManual from './components/UserManual';
import AuthScreen from './components/AuthScreen';
import { generateDemoData } from './utils/demoData';

const CURRENT_USER_KEY = 'agrodocs_current_user_v1';



function VideoBackground() {
  const [activeVideo, setActiveVideo] = useState(1);
  const video1Ref = React.useRef(null);
  const video2Ref = React.useRef(null);
  const [opacity1, setOpacity1] = useState(1);
  const [opacity2, setOpacity2] = useState(0);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    video1.play().catch(err => console.log(err));

    const checkTime = () => {
      if (activeVideo === 1) {
        if (video1.duration && video1.currentTime >= video1.duration - 1.5) {
          video2.currentTime = 0;
          video2.play().catch(err => console.log(err));
          setOpacity1(0);
          setOpacity2(1);
          setActiveVideo(2);
        }
      } else if (activeVideo === 2) {
        if (video2.duration && video2.currentTime >= video2.duration - 1.5) {
          video1.currentTime = 0;
          video1.play().catch(err => console.log(err));
          setOpacity1(1);
          setOpacity2(0);
          setActiveVideo(1);
        }
      }
    };

    const interval = setInterval(checkTime, 250);
    return () => clearInterval(interval);
  }, [activeVideo]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <video
        ref={video1Ref}
        src="./imagesfondo/crea_un_fondo_de_pantalla_con.mp4"
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: opacity1,
          transition: 'opacity 1.5s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <video
        ref={video2Ref}
        src="./imagesfondo/crea_un_fondo_de_pantalla_con.mp4"
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: opacity2,
          transition: 'opacity 1.5s ease-in-out',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

const PIECE_TYPE_RATES = {
  QB: 0.25,
  HB0: 0.5,
  EB: 0.125,
  HB: 0.5,
  FB: 1
};
const DEFAULT_UNIT_PRICE_KEY = 'invoice_default_unit_price';
const DEFAULT_UNT_FACTOR_KEY = 'invoice_default_unt_factor';

const formatAutoNumber = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const getDefaultUnitPrice = () => {
  const saved = localStorage.getItem(DEFAULT_UNIT_PRICE_KEY);
  if (saved === null || saved === '') return '';
  const value = Number(saved);
  return Number.isFinite(value) && value >= 0 ? value.toFixed(2) : '';
};

const getDefaultUntFactor = () => {
  const saved = localStorage.getItem(DEFAULT_UNT_FACTOR_KEY);
  if (saved === null || saved === '') return 0.25;
  const value = Number(saved);
  return Number.isFinite(value) && value >= 0 ? value : 0.25;
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const [activeTab, setActiveTab] = useState('editor');
  const [zoom, setZoom] = useState(1);
  const [licenseStatus, setLicenseStatus] = useState({ active: true, message: '' });

  useEffect(() => {
    if (!window.desktop) {
      const seeded = localStorage.getItem('demo_data_seeded_v5');
      if (!seeded) {
        console.log('Seeding localStorage with demo data (V5)...');
        const data = generateDemoData();
        localStorage.setItem('suppliers_registry_v4', JSON.stringify(data.suppliers));
        localStorage.setItem('suppliers_bunch_price_v4', JSON.stringify(data.prices));
        localStorage.setItem('clients_registry_v1', JSON.stringify(data.clients));
        localStorage.setItem('suppliers_records_v4', JSON.stringify(data.records));
        localStorage.setItem('payments_registry_v1', JSON.stringify(data.payments));
        localStorage.setItem('printed_documents', JSON.stringify(data.documents));
        localStorage.setItem('demo_data_seeded_v5', 'true');
        
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    // Validacion de Licencia Remota desde tu repositorio GitHub
    const LICENSE_URL = 'https://raw.githubusercontent.com/proyect26/agrodocs/main/license.json';
    fetch(LICENSE_URL)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.status === 'suspended') {
          setLicenseStatus({ active: false, message: data.message || 'Licencia suspendida por falta de pago. Por favor contacte con soporte técnico.' });
        }
      })
      .catch(() => {
        // En caso de que no haya conexion, permitimos el uso por defecto
        setLicenseStatus({ active: true, message: '' });
      });
  }, []);
  const [formData, setFormData] = useState({
    facturaAnterior: '557',
    serie: '001-002',
    mawb: '729-4736 4682',
    hawb: 'FFC02451371',
    bodega: 'ROSAS',
    producto: 'ROSAS',
    cliente: '',
    fechaFactura: '23-nov-23',
    agencia: 'FRESH FLOWER CARGO',
    marcacion: "ANGEL'S BLOOMS",
    dae: '05520234001836533',
    pais: 'ESTADOS UNIDOS',
    items: [
      { id: 1, variety: 'White', length: '60 cm', bn: '12', pieceType: 'QB', pieceRate: 0.25, untFactor: getDefaultUntFactor(), unitPrice: getDefaultUnitPrice(), sistem: '3' }
    ]
  });

  // Items acumulados para el Commercial Invoice (no se borran)
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Lista de lote acumulado
  const [labelsBatch, setLabelsBatch] = useState([]);
  const [invoiceBatch, setInvoiceBatch] = useState([]);
  const [docMode, setDocMode] = useState('invoice'); // invoice, sticker, hoja1, ruta

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleItemChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        const selectedType = updated.pieceType || 'QB';
        const rate = PIECE_TYPE_RATES[selectedType] ?? 0.25;
        const totalPieces = Number(updated.bn) || 0;

        updated.pieceRate = rate;
        if (field === 'pieceType') {
          updated.untFactor = rate;
        }

        const untFactor = Number(updated.untFactor);
        const finalFactor = Number.isFinite(untFactor) && untFactor >= 0 ? untFactor : rate;

        if (field === 'bn' || field === 'pieceType' || field === 'untFactor') {
          updated.sistem = formatAutoNumber(totalPieces * finalFactor);
        }

        return updated;
      })
    }));
  };

  const removeItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // AGREGAR AL LOTE — Etiquetas acumulan flores; Invoice guarda la tabla construida
  const handleAddToBatch = (type) => {
    const currentItems = formData.items || [];
    
    if (type === 'sticker') {
      const entry = { ...formData, _id: Date.now() };
      setLabelsBatch(prev => [...prev, entry]);
      
      // Acumula la flor en el borrador en vivo de Invoice
      setInvoiceItems(prev => [
        ...prev,
        ...currentItems.map(item => ({ ...item, id: Date.now() + Math.random() }))
      ]);
      
      // Resetea el formulario para otra flor
      setFormData(prev => ({
        ...prev,
        items: [{ id: Date.now(), variety: 'White', length: '60 cm', bn: '', pieceType: 'QB', pieceRate: 0.25, untFactor: getDefaultUntFactor(), unitPrice: getDefaultUnitPrice(), sistem: '' }]
      }));
      
    } else {
      // click en LOTE INVOICE -> Guardar la hoja A4 que han estado construyendo
      const itemsToSave = invoiceItems.length > 0 ? invoiceItems : currentItems;
      const entry = {
        ...formData,
        cliente: (formData.cliente || '').trim(),
        items: itemsToSave,
        _id: Date.now()
      };
      setInvoiceBatch(prev => [...prev, entry]);
      
      // Limpia el borrador porque ya se mandó al lote esta factura
      setInvoiceItems([]);
      setFormData(prev => ({
        ...prev,
        items: [{ id: Date.now(), variety: 'White', length: '60 cm', bn: '', pieceType: 'QB', pieceRate: 0.25, untFactor: getDefaultUntFactor(), unitPrice: getDefaultUnitPrice(), sistem: '' }]
      }));
    }
  };

  // BORRAR un ítem (buscando en el lote correcto)
  const handleDeleteFromLabelsBatch = (id) => {
    if (window.confirm('¿Borrar esta etiqueta de la lista?')) {
      setLabelsBatch(prev => prev.filter(item => item._id !== id));
    }
  };

  const handleDeleteFromInvoiceBatch = (id) => {
    if (window.confirm('¿Borrar este ítem de la lista de Factura?')) {
      setInvoiceBatch(prev => prev.filter(item => item._id !== id));
    }
  };
  
  // BORRAR un item específico solo del commercial invoice
  const handleRemoveInvoiceItem = (id) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  // BORRAR TODO el lote
  const handleClearLabelsBatch = () => {
    if (window.confirm('¿Borrar toda la lista de Etiquetas?')) {
      setLabelsBatch([]);
    }
  };

  const handleClearInvoiceBatch = () => {
    if (window.confirm('¿Borrar toda la lista de Factura?')) {
      setInvoiceBatch([]);
    }
  };

  // Función auxiliar para guardar en SQLite con campos detallados
  const saveToHistory = async (docs) => {
    const mirrorToLocalStorage = () => {
      try {
        const savedDocs = JSON.parse(localStorage.getItem('printed_documents') || '[]');
        localStorage.setItem('printed_documents', JSON.stringify([...savedDocs, ...docs]));
      } catch (e) {
        console.error(e);
      }
    };

    if (!window.desktop?.dbQuery) {
      mirrorToLocalStorage();
      return;
    }

    try {
      for (const doc of docs) {
        const d = doc.data;
        await window.desktop.dbQuery(
          `INSERT INTO documents (
            id, type, dae, invoice_number, serie, fecha_factura, 
            mawb, hawb, pais_destino, exportadora, producto, 
            agencia, cliente, items_json, full_data_json, printDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            doc.id, 
            doc.type, 
            d.dae || '', 
            d.facturaAnterior || '', 
            d.serie || '', 
            d.fechaFactura || '',
            d.mawb || '', 
            d.hawb || '', 
            d.pais || '', 
            d.marcacion || "ANGEL'S BLOOMS", 
            d.producto || '', 
            d.agencia || '', 
            d.cliente || '',
            JSON.stringify(d.items || []),
            JSON.stringify(d),
            doc.printDate
          ]
        );
      }
      mirrorToLocalStorage();
    } catch (err) {
      console.error('Error guardando en SQLite detallado:', err);
    }
  };

  // IMPRIMIR LOTE DE ETIQUETAS (Guarda historial e Imprime stickers)
  const handlePrintAllLabels = async () => {
    const now = new Date().toISOString();
    const docsToSave = labelsBatch.map(label => ({
      id: `batch-${Date.now()}-${Math.random()}`,
      type: 'sticker',
      printDate: now,
      data: { ...label }
    }));
    
    await saveToHistory(docsToSave);
    
    document.body.className = 'printing-batch-labels';
    window.print();
    setTimeout(() => { document.body.className = ''; }, 1000);
  };

  // IMPRIMIR LOTE DE INVOICES (Guarda historial e Imprime hojas A4)
  const handlePrintAllInvoices = async () => {
    const now = new Date().toISOString();
    
    const docsToSave = invoiceBatch.map(invoice => ({
      id: `batch-a4-${Date.now()}-${Math.random()}`,
      type: 'a4',
      printDate: now,
      data: {
        ...invoice,
        cliente: (invoice.cliente || '').trim()
      }
    }));

    await saveToHistory(docsToSave);
    
    document.body.className = 'printing-batch-invoices';
    window.print();
    setTimeout(() => { document.body.className = ''; }, 1000);
  };

  // IMPRIMIR una etiqueta individual del lote
  const handlePrintSingle = (label) => {
    const prev = formData;
    setFormData(label);
    setTimeout(() => {
      document.body.className = 'printing-sticker';
      window.print();
      setTimeout(() => {
        document.body.className = '';
        setFormData(prev);
      }, 1000);
    }, 120);
  };

  const handlePrint = async (type) => {
    document.body.className = `printing-${type}`;
    window.print();
    
    setTimeout(async () => { 
      document.body.className = ''; 
      
      const isLogisticsSheet = type === 'hoja1' || type === 'ruta';
      if (type === 'a4' || isLogisticsSheet) {
        const currentItems = formData.items || [];
        const itemsToSave = invoiceItems.length > 0 ? invoiceItems : currentItems;
        const entry = {
          ...formData,
          cliente: (formData.cliente || '').trim(),
          items: itemsToSave,
          _id: Date.now()
        };

        const now = new Date().toISOString();
        const singleDoc = {
          id: `single-${type}-${Date.now()}-${Math.random()}`,
          type: type === 'a4' ? 'a4' : type,
          printDate: now,
          data: { ...entry }
        };
        
        await saveToHistory([singleDoc]);

        if (type === 'a4') {
          setInvoiceBatch(prev => [...prev, entry]);
          setInvoiceItems([]);
          setFormData(prev => ({
            ...prev,
            items: [{ id: Date.now(), variety: 'White', length: '60 cm', bn: '', pieceType: 'QB', pieceRate: 0.25, untFactor: getDefaultUntFactor(), unitPrice: getDefaultUnitPrice(), sistem: '' }]
          }));
        }
      }
    }, 1000);
  };

  if (!licenseStatus.active) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
        <div className="liquid-bg-blobs no-print">
          <VideoBackground />
          <div className="bg-blob bg-blob-1"></div>
          <div className="bg-blob bg-blob-2"></div>
          <div className="bg-blob bg-blob-3"></div>
        </div>
        <div className="card" style={{ padding: '3rem', maxWidth: '500px', textAlign: 'center', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border-strong)', boxShadow: 'var(--glass-shadow-lg)', position: 'relative', zIndex: 10 }}>
          <h2 style={{ color: 'hsl(340, 95%, 60%)', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 800 }}>SISTEMA DE LICENCIA AGRODOCS</h2>
          <div style={{ height: '2px', background: 'hsl(340, 95%, 60%)', width: '60px', margin: '0 auto 1.5rem auto' }}></div>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem' }}>
            {licenseStatus.message || 'La licencia de uso para esta aplicación ha sido suspendida. Por favor, póngase en contacto con el administrador del sistema para activar su cuenta.'}
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Código de error: 402 Payment Required
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        <div className="liquid-bg-blobs no-print" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <VideoBackground />
          <div className="bg-blob bg-blob-1"></div>
          <div className="bg-blob bg-blob-2"></div>
          <div className="bg-blob bg-blob-3"></div>
        </div>
        <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="liquid-bg-blobs no-print">
        <VideoBackground />
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {activeTab === 'editor' ? (
        <main className="main-content" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 60px)' }}>
          {/* Left Side: Form */}
          <div className="form-sidebar" style={{ width: '450px', flexShrink: 0, overflowY: 'auto', paddingRight: '1rem', paddingBottom: '2rem' }}>
            <InvoiceForm
              data={formData}
              onChange={handleChange}
              onPrint={handlePrint}
              onItemChange={handleItemChange}
              onRemoveItem={removeItem}
              onAddToBatch={handleAddToBatch}
              labelsBatchCount={labelsBatch.length}
              invoiceBatchCount={invoiceBatch.length}
            />
          </div>

          {/* Right Side */}
          <div className="preview-panel-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', paddingBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>

            {/* Zoom */}
            <div className="no-print" style={{ position: 'sticky', top: '1rem', alignSelf: 'flex-end', marginRight: '1rem', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--glass-bg-card)', backdropFilter: 'var(--glass-blur-sm)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', zIndex: 50 }}>
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="icon-button" style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Alejar (-)">-</button>
              <div style={{ padding: '0.25rem 0.5rem', fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center', minWidth: '45px', textAlign: 'center', color: 'var(--text-primary)' }}>
                {Math.round(zoom * 100)}%
              </div>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="icon-button" style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Acercar (+)">+</button>
            </div>

            {/* Document Switcher */}
            <div className="no-print" style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              padding: '1rem', 
              backgroundColor: 'var(--glass-bg-card)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)', 
              margin: '0 1rem',
              boxShadow: 'var(--shadow-sm)',
              justifyContent: 'center'
            }}>
              {[
                { id: 'sticker', label: 'Etiquetas' },
                { id: 'invoice', label: 'Invoice' },
                { id: 'ruta', label: 'Hoja de Ruta' },
                { id: 'hoja1', label: 'Hoja Resumen' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDocMode(tab.id)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: docMode === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                    color: docMode === tab.id ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    boxShadow: docMode === tab.id ? '0 2px 10px rgba(56,189,248,0.3)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
              <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
              <button
                onClick={() => handlePrint(docMode === 'invoice' ? 'a4' : docMode)}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.5) 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Imprimir Documento
              </button>
            </div>

            {/* Vista Individual */}
            <div className="single-preview">
              {docMode === 'sticker' && <LabelPreview data={formData} zoom={zoom} />}
              {docMode === 'invoice' && (
                <CommercialInvoicePreview
                  data={{ ...formData, items: invoiceItems.length > 0 ? invoiceItems : formData.items }}
                  zoom={zoom}
                  onRemoveItem={handleRemoveInvoiceItem}
                />
              )}
              {docMode === 'hoja1' && <GeneralSummaryPreview data={formData} batch={invoiceBatch} zoom={zoom} />}
              {docMode === 'ruta' && <RouteSheetPreview data={formData} batch={invoiceBatch} zoom={zoom} />}
            </div>

            {/* Vista de Lote ETIQUETAS (SÓLO al imprimir Lote de Etiquetas) */}
            <div className="batch-print-labels" style={{ display: 'none' }}>
              {labelsBatch.map((label, index) => (
                <LabelPreview key={`batch-lbl-${index}`} data={label} zoom={1} />
              ))}
            </div>

            {/* Vista de Lote INVOICE (SÓLO al imprimir Lote de Invoices) */}
            <div className="batch-print-invoices" style={{ display: 'none' }}>
              {invoiceBatch.map((invoice, index) => (
                <div key={`batch-a4-${index}`} style={{ pageBreakAfter: 'always', marginBottom: '2rem' }}>
                  <CommercialInvoicePreview data={invoice} zoom={1} />
                </div>
              ))}
            </div>

            {/* Listas de lote acumulado — no se imprimen */}
            <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
              <LabelsBatchPanel
                title="Lote de Etiquetas"
                theme="primary"
                labels={labelsBatch}
                onDelete={handleDeleteFromLabelsBatch}
                onClearAll={handleClearLabelsBatch}
                onPrintAll={handlePrintAllLabels}
                onPrintSingle={handlePrintSingle}
              />
              <LabelsBatchPanel
                title="Lote de Doc. Invoice"
                theme="secondary"
                type="a4"
                labels={invoiceBatch}
                onDelete={handleDeleteFromInvoiceBatch}
                onClearAll={handleClearInvoiceBatch}
                onPrintAll={handlePrintAllInvoices}
                onPrintSingle={() => {}} // No Individual Print mapped for lists
              />
            </div>
          </div>
        </main>

) : activeTab === 'suppliers' ? (
  <SuppliersControl />
) : activeTab === 'payments' ? (
  <PaymentsRegistry />
) : activeTab === 'customers' ? (
  <CustomersManagement />
) : activeTab === 'decisions' ? (
  <DecisionCenter />
) : activeTab === 'settings' ? (
  <SettingsPanel />
) : activeTab === 'documents' ? (
  <main className="main-content" style={{ display: 'flex', padding: 0, height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
    <DocumentsList />
  </main>
) : activeTab === 'cultivo' ? (
  <CultivationGuide />
) : activeTab === 'ai-assistant' ? (
  <AIAssistantView />
) : activeTab === 'manual' ? (
  <UserManual />
) : (
  <main className="main-content" style={{ display: 'flex', padding: '2rem', height: 'calc(100vh - 60px)', overflowY: 'auto', justifyContent: 'center' }}>
    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <h2 style={{ color: 'var(--text-primary)' }}>Configuraciones</h2>
      <p style={{ marginTop: '1rem' }}>Módulo en construcción...</p>
    </div>
  </main>
)}
    </div>
  );
}

export default App;
