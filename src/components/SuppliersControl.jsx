import React, { useEffect, useMemo, useState } from 'react';

const SUPPLIERS_KEY = 'suppliers_registry_v4';
const RECORDS_KEY = 'suppliers_records_v4';
const PRICES_KEY = 'suppliers_bunch_price_v4';
const LEGACY_SUPPLIERS_KEYS = ['suppliers_registry_v3', 'suppliers_registry_v2_simple', 'suppliers_registry_v1'];
const LEGACY_RECORDS_KEYS = ['suppliers_records_v4', 'suppliers_deliveries_v3', 'suppliers_deliveries_v2_simple', 'suppliers_deliveries_v1'];
const LEGACY_PRICES_KEYS = ['suppliers_bunch_price_v3', 'suppliers_bunch_price_v2_simple'];

const TYPES = [
  'Flores',
  'Transporte',
  'Empaque',
  'Insumos',
  'Mano de obra',
  'Refrigeracion',
  'Logistica',
  'Mantenimiento',
  'Otros'
];

const DEFAULT_SERVICES_BY_TYPE = {
  Flores: ['Ramo Premium', 'Ramo Standard', 'Bonches premium'],
  Transporte: ['Entrega local', 'Ruta programada'],
  Empaque: ['Caja exportación', 'Caja regalo'],
  Insumos: ['Fertilizantes', 'Papelería'],
  'Mano de obra': ['Picking', 'Armado', 'Packing'],
  Refrigeracion: ['Cold room', 'Refrigeración express'],
  Logistica: ['Courier', 'Traslado interno'],
  Mantenimiento: ['Mantenimiento equipos', 'Soporte técnico'],
  Otros: ['Servicio general']
};

const emptyRecord = {
  supplierId: '',
  bunches: '',
  detail: '',
  quantity: '',
  unitCost: '',
  notes: ''
};

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

export default function SuppliersControl() {
  const [suppliers, setSuppliers] = useState([]);
  const [records, setRecords] = useState([]);
  const [priceBySupplier, setPriceBySupplier] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierCedula, setSupplierCedula] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierType, setSupplierType] = useState('Flores');
  const [supplierServices, setSupplierServices] = useState(DEFAULT_SERVICES_BY_TYPE.Flores);
  const [recordTypeFilter, setRecordTypeFilter] = useState('Flores');
  const [recordForm, setRecordForm] = useState(emptyRecord);

  useEffect(() => {
    let cancelled = false;

    async function migrateIfNeeded() {
      const localSuppliers = parseArray(localStorage.getItem(SUPPLIERS_KEY));
      const localRecords = parseArray(localStorage.getItem(RECORDS_KEY));
      const localPrices = parseObject(localStorage.getItem(PRICES_KEY));

      const storedSuppliers = await dbQuery('SELECT * FROM suppliers');
      const storedRecords = await dbQuery('SELECT * FROM supplier_records');
      const storedPrices = await dbQuery('SELECT * FROM supplier_prices');

      let nextSuppliers = Array.isArray(storedSuppliers) ? storedSuppliers : [];
      let nextRecords = Array.isArray(storedRecords) ? storedRecords : [];
      let nextPrices = Array.isArray(storedPrices)
        ? Object.fromEntries(storedPrices.map((row) => [row.supplierId, Number(row.value) || 0]))
        : {};

      if (!nextSuppliers.length && localSuppliers.length) {
        for (const supplier of localSuppliers) {
          await dbQuery(
            'INSERT OR REPLACE INTO suppliers (id, name, type, service, cedula, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [supplier.id, supplier.name || '', supplier.type || 'Flores', supplier.service || '', supplier.cedula || '', supplier.email || '', supplier.phone || '']
          );
        }
        nextSuppliers = localSuppliers;
      }

      if (!nextRecords.length && localRecords.length) {
        for (const record of localRecords) {
          await dbQuery(
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
        nextRecords = localRecords;
      }

      if (!Object.keys(nextPrices).length && Object.keys(localPrices).length) {
        for (const [supplierId, value] of Object.entries(localPrices)) {
          await dbQuery(
            'INSERT OR REPLACE INTO supplier_prices (supplierId, value) VALUES (?, ?)',
            [supplierId, Number(value) || 0]
          );
        }
        nextPrices = localPrices;
      }

      if (!cancelled) {
        setSuppliers(nextSuppliers);
        setRecords(nextRecords);
        setPriceBySupplier(nextPrices);
        setIsLoaded(true);
      }
    }

    async function loadData() {
      try {
        if (window.desktop?.dbQuery) {
          await migrateIfNeeded();
        } else {
          setSuppliers(parseArray(localStorage.getItem(SUPPLIERS_KEY)));
          setRecords(parseArray(localStorage.getItem(RECORDS_KEY)));
          setPriceBySupplier(parseObject(localStorage.getItem(PRICES_KEY)));
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error cargando datos de SQLite:', error);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
    }
  }, [suppliers, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
  }, [records, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PRICES_KEY, JSON.stringify(priceBySupplier));
    }
  }, [priceBySupplier, isLoaded]);

  const addSupplier = async (e) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    const nextServices = supplierServices.length ? supplierServices : DEFAULT_SERVICES_BY_TYPE[supplierType] || DEFAULT_SERVICES_BY_TYPE.Otros;
    const newSupplier = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'sup-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      name: supplierName.trim(),
      type: supplierType,
      service: nextServices.join(', '),
      cedula: supplierCedula.trim(),
      email: supplierEmail.trim(),
      phone: supplierPhone.trim()
    };

    if (window.desktop?.dbQuery) {
      await window.desktop.dbQuery(
        'INSERT INTO suppliers (id, name, type, service, cedula, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newSupplier.id, newSupplier.name, newSupplier.type, newSupplier.service, newSupplier.cedula, newSupplier.email, newSupplier.phone]
      );
    }

    setSuppliers(prev => [...prev, newSupplier]);
    setSupplierName('');
    setSupplierCedula('');
    setSupplierEmail('');
    setSupplierPhone('');
    setSupplierServices(DEFAULT_SERVICES_BY_TYPE[supplierType] || DEFAULT_SERVICES_BY_TYPE.Otros);
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;

    if (window.desktop?.dbQuery) {
      await window.desktop.dbQuery('DELETE FROM supplier_records WHERE supplierId = ?', [id]);
      await window.desktop.dbQuery('DELETE FROM supplier_prices WHERE supplierId = ?', [id]);
      await window.desktop.dbQuery('DELETE FROM suppliers WHERE id = ?', [id]);
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
    setRecords(prev => prev.filter((record) => record.supplierId !== id));
    setPriceBySupplier(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const suppliersById = useMemo(
    () => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === recordForm.supplierId),
    [recordForm.supplierId, suppliers]
  );

  const selectedSupplierType = selectedSupplier?.type || recordTypeFilter || 'Flores';
  const isFlowerSupplierSelected = selectedSupplierType === 'Flores';

  const suppliersForSelectedType = useMemo(
    () => suppliers.filter((supplier) => (supplier.type || 'Flores') === recordTypeFilter),
    [recordTypeFilter, suppliers]
  );

  const summary = useMemo(() => {
    return suppliers.map((supplier) => {
      const supplierRecords = records.filter((record) => record.supplierId === supplier.id);
      const bunches = supplierRecords.reduce((sum, record) => sum + (Number(record.bunches) || 0), 0);
      const serviceQuantity = supplierRecords.reduce((sum, record) => sum + (Number(record.quantity) || 0), 0);
      const serviceCost = supplierRecords.reduce((sum, record) => sum + (Number(record.totalCost) || 0), 0);
      const bunchPrice = Number(priceBySupplier[supplier.id]) || 0;
      const flowerTotal = bunches * bunchPrice;
      const total = supplier.type === 'Flores' ? flowerTotal : serviceCost;

      return {
        ...supplier,
        recordsCount: supplierRecords.length,
        bunches,
        bunchPrice,
        flowerTotal,
        serviceQuantity,
        serviceCost,
        total
      };
    });
  }, [priceBySupplier, records, suppliers]);

  const totals = useMemo(() => {
    const totalFlowers = summary
      .filter((row) => row.type === 'Flores')
      .reduce((sum, row) => sum + row.bunches, 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayBunches = records.reduce((sum, record) => {
      const supplierType = suppliersById[record.supplierId]?.type || 'Flores';
      if (supplierType !== 'Flores') return sum;
      if (record.date !== today) return sum;
      return sum + (Number(record.bunches) || 0);
    }, 0);
    const totalServices = summary
      .filter((row) => row.type !== 'Flores')
      .reduce((sum, row) => sum + row.total, 0);
    const totalEstimated = summary.reduce((sum, row) => sum + row.total, 0);
    return { totalFlowers, todayBunches, totalServices, totalEstimated };
  }, [records, summary, suppliersById]);

  const recordsByType = useMemo(() => {
    return TYPES.map((type) => {
      const providers = suppliers
        .filter((supplier) => (supplier.type || 'Flores') === type)
        .map((supplier) => ({
          ...supplier,
          records: records.filter((record) => record.supplierId === supplier.id)
        }));
      return { type, providers };
    }).filter((group) => group.providers.length > 0);
  }, [records, suppliers]);

  const addRecord = (event) => {
    event.preventDefault();
    if (!recordForm.supplierId) return;

    const today = new Date().toISOString().slice(0, 10);

    if (isFlowerSupplierSelected) {
      const newRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        supplierId: recordForm.supplierId,
        date: today,
        bunches: Number(recordForm.bunches) || 0,
        detail: 'Bonches de flores',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        notes: recordForm.notes || ''
      };
      if (window.desktop?.dbQuery) {
        window.desktop.dbQuery(
          `INSERT INTO supplier_records (
            id, supplierId, date, bunches, detail, quantity, unitCost, totalCost, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newRecord.id,
            newRecord.supplierId,
            newRecord.date,
            newRecord.bunches,
            newRecord.detail,
            newRecord.quantity,
            newRecord.unitCost,
            newRecord.totalCost,
            newRecord.notes
          ]
        ).catch((error) => console.error('Error guardando registro de proveedor:', error));
      }
      setRecords((prev) => [newRecord, ...prev]);
    } else {
      const quantity = Number(recordForm.quantity) || 0;
      const unitCost = Number(recordForm.unitCost) || 0;
      const totalCost = quantity * unitCost;
      const newRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        supplierId: recordForm.supplierId,
        date: today,
        bunches: 0,
        detail: recordForm.detail || selectedSupplierType,
        quantity,
        unitCost,
        totalCost,
        notes: recordForm.notes || ''
      };
      if (window.desktop?.dbQuery) {
        window.desktop.dbQuery(
          `INSERT INTO supplier_records (
            id, supplierId, date, bunches, detail, quantity, unitCost, totalCost, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newRecord.id,
            newRecord.supplierId,
            newRecord.date,
            newRecord.bunches,
            newRecord.detail,
            newRecord.quantity,
            newRecord.unitCost,
            newRecord.totalCost,
            newRecord.notes
          ]
        ).catch((error) => console.error('Error guardando registro de proveedor:', error));
      }
      setRecords((prev) => [newRecord, ...prev]);
    }

    setRecordForm((prev) => ({
      ...emptyRecord,
      supplierId: prev.supplierId
    }));
  };

  const deleteRecord = (recordId) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    if (window.desktop?.dbQuery) {
      window.desktop.dbQuery('DELETE FROM supplier_records WHERE id = ?', [recordId])
        .catch((error) => console.error('Error eliminando registro de proveedor:', error));
    }
    setRecords((prev) => prev.filter((record) => record.id !== recordId));
  };

  return (
    <main className="main-content suppliers-main">
      <section className="suppliers-dashboard">
        <article className="card suppliers-kpi">
          <h3>Proveedores</h3>
          <p>{suppliers.length}</p>
        </article>
        <article className="card suppliers-kpi">
          <h3>Bonches recibidos hoy</h3>
          <p>{totals.todayBunches}</p>
        </article>
        <article className="card suppliers-kpi">
          <h3>Servicios (USD)</h3>
          <p>{money(totals.totalServices)}</p>
        </article>
        <article className="card suppliers-kpi">
          <h3>Total estimado</h3>
          <p>{money(totals.totalEstimated)}</p>
        </article>
      </section>

      <section className="suppliers-grid">
        <article className="card suppliers-block">
          <h2>1) Proveedores</h2>
          <form onSubmit={addSupplier} className="suppliers-form">
            <input
              style={{ gridColumn: '1 / -1' }}
              value={supplierName}
              onChange={(event) => setSupplierName(event.target.value)}
              placeholder="Nombre del proveedor"
              required
            />
            <input
              value={supplierCedula}
              onChange={(event) => setSupplierCedula(event.target.value)}
              placeholder="Cédula / RUC"
            />
            <input
              type="tel"
              value={supplierPhone}
              onChange={(event) => setSupplierPhone(event.target.value)}
              placeholder="Teléfono"
            />
            <input
              style={{ gridColumn: '1 / -1' }}
              type="email"
              value={supplierEmail}
              onChange={(event) => setSupplierEmail(event.target.value)}
              placeholder="Correo electrónico"
            />
            <select
              style={{ gridColumn: '1 / -1' }}
              value={supplierType}
              onChange={(event) => {
                const nextType = event.target.value;
                setSupplierType(nextType);
                setSupplierServices(DEFAULT_SERVICES_BY_TYPE[nextType] || DEFAULT_SERVICES_BY_TYPE.Otros);
              }}
            >
              {TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700 }}>Servicios predeterminados</span>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {(DEFAULT_SERVICES_BY_TYPE[supplierType] || DEFAULT_SERVICES_BY_TYPE.Otros).map((service) => {
                  const isSelected = supplierServices.includes(service);
                  return (
                    <button
                      key={`${supplierType}-${service}`}
                      type="button"
                      onClick={() => {
                        setSupplierServices((prev) => {
                          if (prev.includes(service)) {
                            return prev.filter((item) => item !== service);
                          }
                          return [...prev, service];
                        });
                      }}
                      style={{
                        border: '1px solid var(--glass-border)',
                        borderRadius: '999px',
                        padding: '0.28rem 0.6rem',
                        background: isSelected ? 'rgba(14, 165, 233, 0.18)' : 'rgba(255,255,255,0.03)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Guardar proveedor</button>
          </form>

          <details className="suppliers-table-wrap" open>
            <summary style={{
              listStyle: 'none',
              cursor: 'pointer',
              padding: '0.7rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--glass-border)',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span aria-hidden="true">▾</span>
                Lista de proveedores
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {suppliers.length}
              </span>
            </summary>

            <div className="suppliers-row suppliers-row-head">
              <strong>Proveedor</strong>
              <strong>Tipo</strong>
              <strong>Contacto / Info</strong>
              <strong>Acciones</strong>
            </div>
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="suppliers-row">
                <div>
                  <strong>{supplier.name}</strong>
                  {supplier.cedula && <small>CI/RUC: {supplier.cedula}</small>}
                  {supplier.service && <small>Servicios: {supplier.service}</small>}
                </div>
                <span>{supplier.type || 'Flores'}</span>
                <div>
                  {supplier.phone && <small>📞 {supplier.phone}</small>}
                  {supplier.email && <small>✉️ {supplier.email}</small>}
                </div>
                <button className="btn btn-outline" onClick={() => deleteSupplier(supplier.id)}>Eliminar</button>
              </div>
            ))}
            {!suppliers.length && <p className="suppliers-empty">Aun no hay proveedores.</p>}
          </details>
        </article>

        <article className="card suppliers-block">
          <h2>2) Registro diario</h2>
          <form onSubmit={addRecord} className="suppliers-form">
            <select
              value={recordTypeFilter}
              onChange={(event) => {
                const nextType = event.target.value;
                setRecordTypeFilter(nextType);
                const currentSupplier = suppliers.find((supplier) => supplier.id === recordForm.supplierId);
                if (currentSupplier && (currentSupplier.type || 'Flores') !== nextType) {
                  setRecordForm((prev) => ({ ...prev, supplierId: '' }));
                }
              }}
            >
              {TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select
              value={recordForm.supplierId}
              onChange={(event) => setRecordForm((prev) => ({ ...prev, supplierId: event.target.value }))}
            >
              <option value="">Selecciona proveedor</option>
              {suppliersForSelectedType.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.type || 'Flores'}
                </option>
              ))}
            </select>

            {isFlowerSupplierSelected ? (
              <>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={recordForm.bunches}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, bunches: event.target.value }))}
                  placeholder="Bonches entregados"
                />
                <input
                  value={recordForm.notes}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Nota (opcional)"
                />
              </>
            ) : (
              <>
                <input
                  value={recordForm.detail}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, detail: event.target.value }))}
                  placeholder="Detalle del servicio"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={recordForm.quantity}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  placeholder="Cantidad"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={recordForm.unitCost}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, unitCost: event.target.value }))}
                  placeholder="Costo unitario"
                />
                <input
                  value={recordForm.notes}
                  onChange={(event) => setRecordForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Nota (opcional)"
                />
              </>
            )}

            <button type="submit" className="btn btn-primary">Guardar registro</button>
            <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Fecha automática: {new Date().toLocaleDateString('es-EC')}
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recordsByType.length === 0 && (
              <div className="suppliers-table-wrap">
                <p className="suppliers-empty">Agrega proveedores para verlos agrupados por servicio.</p>
              </div>
            )}
            {recordsByType.map((group) => (
              <details key={group.type} className="suppliers-table-wrap" open={group.type === 'Flores'}>
                <summary style={{
                  listStyle: 'none',
                  cursor: 'pointer',
                  padding: '0.7rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--glass-border)',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span aria-hidden="true">▾</span>
                    {group.type}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {group.providers.length} proveedores
                  </span>
                </summary>

                <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {group.providers.length === 0 && (
                    <p className="suppliers-empty">Sin proveedores en esta categoria.</p>
                  )}

                  {group.providers.map((provider) => (
                    <details
                      key={provider.id}
                      style={{
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.01)'
                      }}
                    >
                      <summary
                        style={{
                          listStyle: 'none',
                          cursor: 'pointer',
                          padding: '0.65rem 0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontWeight: 700,
                          borderBottom: '1px solid var(--glass-border)',
                          background: 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span aria-hidden="true">▾</span>
                          <span>📁 {provider.name}</span>
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {provider.records.length} registros
                        </span>
                      </summary>

                      <div style={{ padding: '0.6rem' }}>
                        {provider.records.length === 0 ? (
                          <p className="suppliers-empty">Sin registros.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {provider.records.map((record) => {
                              const isFlowers = group.type === 'Flores';
                              return (
                                <div key={record.id} style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1.4fr 1fr 1fr auto',
                                  gap: '0.5rem',
                                  alignItems: 'center',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.45rem 0.55rem',
                                  fontSize: '0.86rem',
                                  color: 'var(--text-primary)'
                                }}>
                                  <span>{record.date}</span>
                                  <span>{isFlowers ? 'Bonches de flores' : (record.detail || '-')}</span>
                                  <strong>{isFlowers ? (record.bunches || 0) : (record.quantity || 0)}</strong>
                                  <strong>{isFlowers ? '-' : money(record.totalCost)}</strong>
                                  <button className="btn btn-outline" onClick={() => deleteRecord(record.id)}>Eliminar</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </article>
      </section>

      <section className="card suppliers-block">
        <h2>3) Control por proveedor</h2>
        <div className="suppliers-table-wrap">
          <div className="suppliers-row suppliers-row-head suppliers-row-4">
            <strong>Proveedor</strong>
            <strong>Tipo</strong>
            <strong>Resumen</strong>
            <strong>Registros</strong>
          </div>
          {summary.map((row) => (
            <div key={row.id} className="suppliers-row suppliers-row-4">
              <strong>{row.name}</strong>
              <span>{row.type || 'Flores'}</span>
              <span>
                {row.type === 'Flores'
                  ? `${row.bunches} bonches`
                  : `${row.serviceQuantity} cantidad`}
              </span>
              <strong>{row.recordsCount}</strong>
            </div>
          ))}
          {!summary.length && <p className="suppliers-empty">Agrega proveedores para empezar.</p>}
        </div>
      </section>
    </main>
  );
}
