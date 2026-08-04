import React, { useEffect, useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import EmailModal from './EmailModal';

const PAYMENTS_KEY = 'payments_registry_v1';
const SUPPLIERS_KEY = 'suppliers_registry_v4';
const LEGACY_SUPPLIERS_KEYS = ['suppliers_registry_v3', 'suppliers_registry_v2_simple', 'suppliers_registry_v1'];

const emptyPayment = {
  supplierId: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  method: 'Transferencia',
  status: 'Pendiente',
  note: ''
};

function parseArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function dbQuery(sql, params = []) {
  if (!window.desktop?.dbQuery) return null;
  return window.desktop.dbQuery(sql, params);
}

function money(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
}

export default function PaymentsRegistry() {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyPayment);
  const [emailPayment, setEmailPayment] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        if (window.desktop?.dbQuery) {
          const storedPayments = await dbQuery('SELECT * FROM payments ORDER BY date DESC, id DESC');
          const storedSuppliers = await dbQuery('SELECT * FROM suppliers');

          let nextPayments = Array.isArray(storedPayments) ? storedPayments : [];
          let nextSuppliers = Array.isArray(storedSuppliers) ? storedSuppliers : [];

          const localPayments = parseArray(localStorage.getItem(PAYMENTS_KEY));
          if (!nextPayments.length && localPayments.length) {
            for (const payment of localPayments) {
              await dbQuery(
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
            nextPayments = localPayments;
          }

          const localSuppliers = parseArray(localStorage.getItem(SUPPLIERS_KEY));
          if (!nextSuppliers.length && localSuppliers.length) {
            for (const supplier of localSuppliers) {
              await dbQuery(
                'INSERT OR REPLACE INTO suppliers (id, name, type, service) VALUES (?, ?, ?, ?)',
                [supplier.id, supplier.name || '', supplier.type || 'Flores', supplier.service || '']
              );
            }
            nextSuppliers = localSuppliers;
          }

          if (!cancelled) {
            setPayments(nextPayments);
            setSuppliers(nextSuppliers);
            setIsLoaded(true);
          }
        } else {
          setPayments(parseArray(localStorage.getItem(PAYMENTS_KEY)));

          const rawMain = localStorage.getItem(SUPPLIERS_KEY);
          if (rawMain) {
            setSuppliers(parseArray(rawMain));
            setIsLoaded(true);
          } else {
            for (const key of LEGACY_SUPPLIERS_KEYS) {
              const raw = localStorage.getItem(key);
              if (!raw) continue;
              const parsed = parseArray(raw);
              if (parsed.length) {
                setSuppliers(parsed);
                break;
              }
            }
            setIsLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error cargando pagos', error);
      }
    }
    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
  }, [payments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
    }
  }, [suppliers, isLoaded]);

  const suppliersById = useMemo(
    () => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers]
  );

  const totals = useMemo(() => {
    const pending = payments
      .filter((payment) => payment.status === 'Pendiente')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const paid = payments
      .filter((payment) => payment.status === 'Pagado')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    return { pending, paid };
  }, [payments]);

  const addPayment = (event) => {
    event.preventDefault();
    if (!form.supplierId || !form.amount) return;

    const newPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...form,
      amount: Number(form.amount)
    };
    if (window.desktop?.dbQuery) {
      dbQuery(
        `INSERT INTO payments (
          id, supplierId, amount, date, status, method, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newPayment.id,
          newPayment.supplierId,
          newPayment.amount,
          newPayment.date,
          newPayment.status,
          newPayment.method,
          newPayment.note
        ]
      ).catch((error) => console.error('Error guardando pago:', error));
    }
    setPayments((prev) => [newPayment, ...prev]);
    setForm((prev) => ({ ...emptyPayment, supplierId: prev.supplierId }));
  };

  const deletePayment = (id) => {
    if (!window.confirm('¿Eliminar este pago?')) return;
    if (window.desktop?.dbQuery) {
      dbQuery('DELETE FROM payments WHERE id = ?', [id])
        .catch((error) => console.error('Error eliminando pago:', error));
    }
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
  };

  return (
    <main className="main-content suppliers-main">
      <section className="suppliers-dashboard">
        <article className="card suppliers-kpi">
          <h3>Pagos registrados</h3>
          <p>{payments.length}</p>
        </article>
        <article className="card suppliers-kpi">
          <h3>Pendiente</h3>
          <p>{money(totals.pending)}</p>
        </article>
        <article className="card suppliers-kpi">
          <h3>Pagado</h3>
          <p>{money(totals.paid)}</p>
        </article>
      </section>

      <section className="card suppliers-block">
        <h2>Registro de Pagos</h2>
        <form onSubmit={addPayment} className="suppliers-form">
          <select
            value={form.supplierId}
            onChange={(event) => setForm((prev) => ({ ...prev, supplierId: event.target.value }))}
          >
            <option value="">Selecciona proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} - {supplier.type || 'Sin tipo'}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Monto USD"
          />
          <select
            value={form.method}
            onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
          >
            <option>Transferencia</option>
            <option>Efectivo</option>
            <option>Cheque</option>
            <option>Tarjeta</option>
          </select>
          <select
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option>Pendiente</option>
            <option>Pagado</option>
          </select>
          <input
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Nota (opcional)"
          />
          <button type="submit" className="btn btn-primary">Guardar pago</button>
        </form>

        <div className="suppliers-table-wrap">
          <div className="suppliers-row suppliers-row-head suppliers-row-6">
            <strong>Proveedor</strong>
            <strong>Fecha</strong>
            <strong>Monto</strong>
            <strong>Metodo</strong>
            <strong>Estado</strong>
            <strong></strong>
          </div>
          {payments.map((payment) => {
            const supplierName = suppliersById[payment.supplierId]?.name || 'Proveedor eliminado';
            return (
              <div key={payment.id} className="suppliers-row suppliers-row-6">
                <strong>{supplierName}</strong>
                <span>{payment.date}</span>
                <strong>{money(payment.amount)}</strong>
                <span>{payment.method}</span>
                <span>{payment.status}</span>
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setEmailPayment(payment)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Enviar comprobante por correo"
                  >
                    <Mail size={12} /> Email
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} 
                    onClick={() => deletePayment(payment.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
          {!payments.length && <p className="suppliers-empty">Aun no hay pagos registrados.</p>}
        </div>
      </section>

      {/* Modal de Envíos de Email para Pagos */}
      {emailPayment && (
        <EmailModal
          isOpen={!!emailPayment}
          onClose={() => setEmailPayment(null)}
          docLabel={`Comprobante de Pago - ${suppliersById[emailPayment.supplierId]?.name || 'Proveedor'}`}
          subject={`AgroDocs - Comprobante de Pago - ${suppliersById[emailPayment.supplierId]?.name || 'Proveedor'} (${emailPayment.date})`}
          bodyHtml={`<p>Estimado(a) <strong>${suppliersById[emailPayment.supplierId]?.name || 'Proveedor'}</strong>,</p>
<p>Adjunto a este correo encontrará el detalle de su registro de pago generado por el sistema <strong>AgroDocs</strong>:</p>
<table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; font-family: sans-serif; font-size: 14px;">
  <tbody>
    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold; width: 150px;">Proveedor:</td>
      <td style="padding: 8px;">${suppliersById[emailPayment.supplierId]?.name || 'N/A'}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold;">Fecha de Registro:</td>
      <td style="padding: 8px;">${emailPayment.date}</td>
    </tr>
    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold;">Monto Total:</td>
      <td style="padding: 8px; font-weight: bold; color: #166534;">${money(emailPayment.amount)}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold;">Método de Pago:</td>
      <td style="padding: 8px;">${emailPayment.method}</td>
    </tr>
    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold;">Estado del Pago:</td>
      <td style="padding: 8px; font-weight: bold;">${emailPayment.status}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px; font-weight: bold;">Observación:</td>
      <td style="padding: 8px; font-style: italic;">${emailPayment.note || 'Ninguna'}</td>
    </tr>
  </tbody>
</table>
<p>Si tiene alguna pregunta, por favor póngase en contacto con nosotros.</p>
<p>Saludos cordiales,<br/><strong>Angel's Blooms / AgroDocs</strong></p>`}
        />
      )}
    </main>
  );
}
