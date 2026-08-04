import React, { useRef, useState } from 'react';
import { Building2, FileText, Printer, Database, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SETTINGS_KEY = 'app_settings_v1';
const DAE_PRESETS_KEY = 'dae_presets_v1';
const SUPPLIERS_KEY = 'suppliers_registry_v4';
const PAYMENTS_KEY = 'payments_registry_v1';
const RECORDS_KEY = 'suppliers_records_v4';
const PRICES_KEY = 'suppliers_bunch_price_v4';
const SMTP_KEY = 'smtp_config_v1';

const defaultSmtp = {
  host: 'smtp.gmail.com',
  port: '587',
  user: '',
  pass: '',
  fromName: "ANGEL'S BLOOMS",
  secure: false,
};

function loadSmtp() {
  try {
    const saved = JSON.parse(localStorage.getItem(SMTP_KEY) || '{}');
    return { ...defaultSmtp, ...saved };
  } catch { return defaultSmtp; }
}

function parseArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseObject(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeDocumentRow(row) {
  const rawData = row?.full_data_json ?? row?.data ?? null;
  let data = rawData;
  if (typeof rawData === 'string') {
    try {
      data = JSON.parse(rawData);
    } catch {
      data = {};
    }
  }
  return { ...row, data: data || {} };
}

const defaultSettings = {
  companyName: "ANGEL'S BLOOMS",
  companyRuc: '0502669674001',
  companyAddress: '',
  companyPhone: '',
  defaultSerie: '001-002',
  defaultAgency: 'FRESH FLOWER CARGO',
  defaultCountry: 'ESTADOS UNIDOS',
  defaultWarehouse: 'ROSAS',
  currency: 'USD',
  printCopies: 1,
  printQuality: 'Normal',
  autoSaveAfterPrint: true
};

function parseSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...defaultSettings, ...saved };
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState(() => parseSettings());
  const [savedMessage, setSavedMessage] = useState('');
  const fileInputRef = useRef(null);
  const [smtp, setSmtp] = useState(loadSmtp);
  const [smtpStatus, setSmtpStatus] = useState(null); // null | 'verifying' | 'ok' | 'error'
  const [smtpMsg, setSmtpMsg] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'printCopies'
            ? Math.max(1, Number(value) || 1)
            : value
    }));
  };

  const handleSmtpChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...smtp, [name]: type === 'checkbox' ? checked : value };
    setSmtp(updated);
    localStorage.setItem(SMTP_KEY, JSON.stringify(updated));
  };

  const verifySmtp = async () => {
    if (!smtp.host || !smtp.user || !smtp.pass) {
      setSmtpStatus('error');
      setSmtpMsg('Completa host, usuario y contraseña primero.');
      return;
    }
    setSmtpStatus('verifying');
    setSmtpMsg('Verificando…');
    if (window.desktop?.verifySmtp) {
      const result = await window.desktop.verifySmtp(smtp);
      if (result.success) {
        setSmtpStatus('ok');
        setSmtpMsg('Conexión SMTP verificada correctamente.');
      } else {
        setSmtpStatus('error');
        setSmtpMsg(`Error: ${result.error}`);
      }
    } else {
      setSmtpStatus('error');
      setSmtpMsg('Solo disponible en la app de escritorio.');
    }
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSavedMessage('Configuraciones guardadas.');
    setTimeout(() => setSavedMessage(''), 2000);
  };

  const exportBackup = async () => {
    let suppliers = parseArray(localStorage.getItem(SUPPLIERS_KEY));
    let payments = parseArray(localStorage.getItem(PAYMENTS_KEY));
    let records = parseArray(localStorage.getItem(RECORDS_KEY));
    let prices = parseObject(localStorage.getItem(PRICES_KEY));
    let printedDocuments = parseArray(localStorage.getItem('printed_documents'));

    if (window.desktop?.dbQuery) {
      try {
        suppliers = await window.desktop.dbQuery('SELECT * FROM suppliers');
        payments = await window.desktop.dbQuery('SELECT * FROM payments ORDER BY date DESC, id DESC');
        records = await window.desktop.dbQuery('SELECT * FROM supplier_records ORDER BY date DESC, id DESC');
        const dbPrices = await window.desktop.dbQuery('SELECT * FROM supplier_prices');
        prices = Object.fromEntries(dbPrices.map((row) => [row.supplierId, Number(row.value) || 0]));
        printedDocuments = (await window.desktop.dbQuery('SELECT * FROM documents ORDER BY printDate DESC'))
          .map(normalizeDocumentRow);
      } catch (error) {
        console.error('Error leyendo respaldo desde SQLite', error);
      }
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      suppliers,
      payments,
      supplierRecords: records,
      supplierPrices: prices,
      printedDocuments,
      daePresets: parseObject(localStorage.getItem(DAE_PRESETS_KEY))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo-sistema-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...defaultSettings, ...parsed.settings }));
        if (Array.isArray(parsed.suppliers)) {
          localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(parsed.suppliers));
          if (window.desktop?.dbQuery) {
            for (const supplier of parsed.suppliers) {
              await window.desktop.dbQuery(
                'INSERT OR REPLACE INTO suppliers (id, name, type, service) VALUES (?, ?, ?, ?)',
                [supplier.id, supplier.name || '', supplier.type || 'Flores', supplier.service || '']
              );
            }
          }
        }
        if (Array.isArray(parsed.payments)) {
          localStorage.setItem(PAYMENTS_KEY, JSON.stringify(parsed.payments));
          if (window.desktop?.dbQuery) {
            for (const payment of parsed.payments) {
              await window.desktop.dbQuery(
                `INSERT OR REPLACE INTO payments (
                  id, supplierId, amount, date, status, method, note
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  payment.id,
                  payment.supplierId || '',
                  Number(payment.amount) || 0,
                  payment.date || '',
                  payment.status || 'Pendiente',
                  payment.method || 'Transferencia',
                  payment.note || ''
                ]
              );
            }
          }
        }
        if (Array.isArray(parsed.supplierRecords)) {
          localStorage.setItem(RECORDS_KEY, JSON.stringify(parsed.supplierRecords));
          if (window.desktop?.dbQuery) {
            for (const record of parsed.supplierRecords) {
              await window.desktop.dbQuery(
                `INSERT OR REPLACE INTO supplier_records (
                  id, supplierId, date, bunches, detail, quantity, unitCost, totalCost, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  record.id,
                  record.supplierId || '',
                  record.date || '',
                  Number(record.bunches) || 0,
                  record.detail || '',
                  Number(record.quantity) || 0,
                  Number(record.unitCost) || 0,
                  Number(record.totalCost) || 0,
                  record.notes || ''
                ]
              );
            }
          }
        }
        if (parsed.supplierPrices && typeof parsed.supplierPrices === 'object') {
          localStorage.setItem(PRICES_KEY, JSON.stringify(parsed.supplierPrices));
          if (window.desktop?.dbQuery) {
            for (const [supplierId, value] of Object.entries(parsed.supplierPrices)) {
              await window.desktop.dbQuery(
                'INSERT OR REPLACE INTO supplier_prices (supplierId, value) VALUES (?, ?)',
                [supplierId, Number(value) || 0]
              );
            }
          }
        }
        if (Array.isArray(parsed.printedDocuments)) {
          localStorage.setItem('printed_documents', JSON.stringify(parsed.printedDocuments));
          if (window.desktop?.dbQuery) {
            for (const doc of parsed.printedDocuments) {
              const data = doc.data || {};
              await window.desktop.dbQuery(
                `INSERT OR REPLACE INTO documents (
                  id, type, dae, invoice_number, serie, fecha_factura,
                  mawb, hawb, pais_destino, exportadora, producto,
                  agencia, cliente, items_json, full_data_json, printDate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  doc.id,
                  doc.type || '',
                  data.dae || '',
                  data.facturaAnterior || '',
                  data.serie || '',
                  data.fechaFactura || '',
                  data.mawb || '',
                  data.hawb || '',
                  data.pais || '',
                  data.marcacion || '',
                  data.producto || '',
                  data.agencia || '',
                  data.cliente || '',
                  JSON.stringify(data.items || []),
                  JSON.stringify(data),
                  doc.printDate || new Date().toISOString()
                ]
              );
            }
          }
        }
        if (parsed.daePresets && typeof parsed.daePresets === 'object') {
          localStorage.setItem(DAE_PRESETS_KEY, JSON.stringify(parsed.daePresets));
        }
        setSettings(parseSettings());
        setSavedMessage('Respaldo importado.');
        setTimeout(() => setSavedMessage(''), 2500);
      } catch (error) {
        console.error('Error importando respaldo', error);
        window.alert('Archivo invalido. Verifica que sea un respaldo JSON del sistema.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const clearDocuments = () => {
    if (!window.confirm('¿Borrar todo el historial de documentos?')) return;
    if (window.desktop?.dbQuery) {
      window.desktop.dbQuery('DELETE FROM documents').catch((error) => console.error('Error limpiando documentos', error));
    }
    localStorage.removeItem('printed_documents');
    setSavedMessage('Historial de documentos borrado.');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const clearPayments = () => {
    if (!window.confirm('¿Borrar todo el registro de pagos?')) return;
    if (window.desktop?.dbQuery) {
      window.desktop.dbQuery('DELETE FROM payments').catch((error) => console.error('Error limpiando pagos', error));
    }
    localStorage.removeItem('payments_registry_v1');
    setSavedMessage('Registro de pagos borrado.');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  return (
    <main className="main-content suppliers-main">
      <section className="suppliers-block card app-settings-head">
        <h2>Configuraciones del Sistema</h2>
        <p className="app-settings-subtitle">
          Ajusta datos generales, documentos, impresion y respaldos.
        </p>
        <div className="app-settings-actions">
          <button className="btn btn-primary" onClick={saveSettings}>Guardar Configuracion</button>
          {!!savedMessage && <span className="app-settings-saved">{savedMessage}</span>}
        </div>
      </section>

      <section className="suppliers-grid">
        <article className="card suppliers-block">
          <h3 className="app-settings-title"><Building2 size={16} /> Empresa</h3>
          <div className="suppliers-form">
            <input name="companyName" value={settings.companyName} onChange={handleChange} placeholder="Nombre comercial" />
            <input name="companyRuc" value={settings.companyRuc} onChange={handleChange} placeholder="RUC" />
            <input name="companyAddress" value={settings.companyAddress} onChange={handleChange} placeholder="Direccion" />
            <input name="companyPhone" value={settings.companyPhone} onChange={handleChange} placeholder="Telefono" />
          </div>
        </article>

        <article className="card suppliers-block">
          <h3 className="app-settings-title"><FileText size={16} /> Documentos</h3>
          <div className="suppliers-form">
            <input name="defaultSerie" value={settings.defaultSerie} onChange={handleChange} placeholder="Serie por defecto" />
            <input name="defaultAgency" value={settings.defaultAgency} onChange={handleChange} placeholder="Agencia por defecto" />
            <input name="defaultCountry" value={settings.defaultCountry} onChange={handleChange} placeholder="Pais por defecto" />
            <input name="defaultWarehouse" value={settings.defaultWarehouse} onChange={handleChange} placeholder="Bodega por defecto" />
            <select name="currency" value={settings.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </article>

        <article className="card suppliers-block">
          <h3 className="app-settings-title"><Printer size={16} /> Impresion</h3>
          <div className="suppliers-form">
            <input
              type="number"
              min="1"
              max="20"
              name="printCopies"
              value={settings.printCopies}
              onChange={handleChange}
              placeholder="Copias por defecto"
            />
            <select name="printQuality" value={settings.printQuality} onChange={handleChange}>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Borrador">Borrador</option>
            </select>
            <label className="app-settings-check">
              <input
                type="checkbox"
                name="autoSaveAfterPrint"
                checked={!!settings.autoSaveAfterPrint}
                onChange={handleChange}
              />
              Guardar automaticamente al imprimir
            </label>
          </div>
        </article>

        <article className="card suppliers-block">
          <h3 className="app-settings-title"><Mail size={16} /> Correo (SMTP)</h3>
          <div className="suppliers-form">
            <input name="host" value={smtp.host} onChange={handleSmtpChange} placeholder="smtp.gmail.com" />
            <input name="port" value={smtp.port} onChange={handleSmtpChange} placeholder="Puerto (587)" />
            <input name="user" type="email" value={smtp.user} onChange={handleSmtpChange} placeholder="Email remitente" style={{ gridColumn: '1 / -1' }} />
            <input name="pass" type="password" value={smtp.pass} onChange={handleSmtpChange} placeholder="Contraseña / App Password" style={{ gridColumn: '1 / -1' }} />
            <input name="fromName" value={smtp.fromName} onChange={handleSmtpChange} placeholder="Nombre remitente" style={{ gridColumn: '1 / -1' }} />
            <label className="app-settings-check">
              <input type="checkbox" name="secure" checked={!!smtp.secure} onChange={handleSmtpChange} />
              Usar SSL/TLS (puerto 465)
            </label>
            <button type="button" className="btn btn-outline" onClick={verifySmtp} disabled={smtpStatus === 'verifying'} style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {smtpStatus === 'verifying' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
              Verificar conexión SMTP
            </button>
            {smtpStatus === 'ok' && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', borderRadius: '8px', padding: '0.45rem 0.7rem', fontSize: '0.83rem', fontWeight: 600, border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                <CheckCircle size={14} /> {smtpMsg}
              </div>
            )}
            {smtpStatus === 'error' && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '0.45rem 0.7rem', fontSize: '0.83rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.35)' }}>
                <AlertCircle size={14} /> {smtpMsg}
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            💡 Para Gmail usa una <strong>App Password</strong> (no tu contraseña normal). Los datos se guardan solo en tu dispositivo.
          </p>
        </article>

        <article className="card suppliers-block">
          <h3 className="app-settings-title"><Database size={16} /> Respaldo y Limpieza</h3>
          <div className="app-settings-stack">
            <button className="btn btn-outline" onClick={exportBackup}>Exportar Respaldo JSON</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={importBackup}
              style={{ display: 'none' }}
            />
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
              Importar Respaldo JSON
            </button>
            <button className="btn btn-outline" onClick={clearDocuments}>Borrar Historial de Documentos</button>
            <button className="btn btn-outline" onClick={clearPayments}>Borrar Registro de Pagos</button>
          </div>
        </article>
      </section>
    </main>
  );
}

// Inline spin animation for the Loader icon
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
if (!document.head.querySelector('[data-spin]')) {
  style.setAttribute('data-spin', '1');
  document.head.appendChild(style);
}
