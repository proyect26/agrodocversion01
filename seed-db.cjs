const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// Path to SQLite database
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'genera-etiketas', 'database.sqlite');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist. Please run the application at least once to create it.');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
console.log('Connected to database.');

// Generate data over a range of dates
function getDatesInRange(start, end) {
  const dates = [];
  let curr = new Date(start);
  const stop = new Date(end);
  while (curr <= stop) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + Math.floor(Math.random() * 3) + 1); // 1-4 days gap
  }
  return dates;
}

// Seed function
function seed() {
  console.log('Clearing existing data...');
  db.exec('DELETE FROM supplier_records');
  db.exec('DELETE FROM supplier_prices');
  db.exec('DELETE FROM payments');
  db.exec('DELETE FROM clients');
  db.exec('DELETE FROM documents');
  db.exec('DELETE FROM suppliers');

  console.log('Seeding suppliers...');
  const suppliers = [
    { id: 'sup-rosas', name: 'Finca Las Rosas de Cotopaxi', type: 'Flores', service: '', cedula: '1792345678001', email: 'ventas@rosascotopaxi.com', phone: '0991234567' },
    { id: 'sup-bella', name: 'Finca BellaRosa Tabacundo', type: 'Flores', service: '', cedula: '1791112223001', email: 'logistica@bellarosa.com', phone: '0997778888' },
    { id: 'sup-trans', name: 'Transportes Rápidos Florales S.A.', type: 'Transporte', service: 'Transporte refrigerado', cedula: '1798765432001', email: 'transito@transflor.com', phone: '0998765432' },
    { id: 'sup-empaq', name: 'Empaques Andinos Cia. Ltda.', type: 'Empaque', service: 'Cajas y capuchones', cedula: '1793456789001', email: 'ventas@empaquesandinos.ec', phone: '0993456789' },
    { id: 'sup-insum', name: 'Insumos Agrícolas del Norte', type: 'Insumos', service: 'Fertilizantes y químicos', cedula: '1795556667001', email: 'norte@insumos.com', phone: '0995556666' }
  ];

  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (id, name, type, service, cedula, email, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of suppliers) {
    insertSupplier.run(s.id, s.name, s.type, s.service, s.cedula, s.email, s.phone);
  }

  console.log('Seeding supplier prices...');
  const insertPrice = db.prepare('INSERT INTO supplier_prices (supplierId, value) VALUES (?, ?)');
  insertPrice.run('sup-rosas', 1.10);
  insertPrice.run('sup-bella', 0.95);

  console.log('Seeding clients...');
  const clients = [
    { id: 'cli-miami', name: 'Miami Floral Importers S.A.', cedula: '1109876543', email: 'purchasing@miamifloral.com', phone: '+1 305-555-0199', country: 'ESTADOS UNIDOS', notes: 'Bodega de consolidación en Miami. Variedad Freedom preferida.' },
    { id: 'cli-ny', name: 'New York Flower Distributors', cedula: '4409876543', email: 'orders@nyflowers.com', phone: '+1 212-555-0177', country: 'ESTADOS UNIDOS', notes: 'Entregas semanales en aeropuerto JFK.' },
    { id: 'cli-toronto', name: 'Toronto Petals Dist.', cedula: '2209876543', email: 'logistics@torontopetals.ca', phone: '+1 416-555-0144', country: 'CANADÁ', notes: 'Despachos en camión refrigerado desde Miami.' },
    { id: 'cli-madrid', name: 'Madrid Rosas S.L.', cedula: '3309876543', email: 'importaciones@madridrosas.es', phone: '+34 91-555-0122', country: 'ESPAÑA', notes: 'Calidad Premium, tallos largos de 70-80cm.' },
    { id: 'cli-ams', name: 'Amsterdam Bloom Import Co', cedula: '5509876543', email: 'contact@amsbloom.nl', phone: '+31 20-555-0111', country: 'PAÍSES BAJOS', notes: 'Despacho directo vía aérea KLM.' }
  ];

  const insertClient = db.prepare(`
    INSERT INTO clients (id, name, cedula, email, phone, country, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of clients) {
    insertClient.run(c.id, c.name, c.cedula, c.email, c.phone, c.country, c.notes);
  }

  // Generate Dates from August 2025 to July 2026
  const dates = getDatesInRange('2025-08-01', '2026-07-31');
  console.log(`Generated ${dates.length} dates for history simulation.`);

  const insertRecord = db.prepare(`
    INSERT INTO supplier_records (id, supplierId, date, bunches, detail, quantity, unitCost, totalCost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (id, supplierId, amount, date, status, method, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDocument = db.prepare(`
    INSERT INTO documents (
      id, type, dae, invoice_number, serie, fecha_factura, 
      mawb, hawb, pais_destino, exportadora, producto, 
      agencia, cliente, items_json, full_data_json, printDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let invoiceCounter = 1200;
  let paymentCounter = 500;

  // Track accounts for each supplier to simulate payments
  const supplierBalances = {
    'sup-rosas': 0,
    'sup-bella': 0,
    'sup-trans': 0,
    'sup-empaq': 0,
    'sup-insum': 0
  };

  // Predefined lists for generator
  const varieties = ['Freedom', 'Explorer', 'Mondial', 'Playa Blanca', 'Pink Floyd', 'Hearts', 'Kahala'];
  const lengths = ['50 cm', '60 cm', '70 cm', '80 cm'];
  const pieceTypes = ['QB', 'HB', 'EB', 'FB'];
  const pieceRates = { QB: 0.25, HB: 0.5, EB: 0.125, FB: 1.0 };
  const agencyNames = ['FRESH FLOWER CARGO', 'EXPRESS CARGO S.A.', 'LATAM CARGO', 'DHL GLOBAL FORWARDING'];

  dates.forEach((dateStr, idx) => {
    // 1. Deliveries from flower suppliers
    // Las Rosas: delivers on average 200-400 bunches
    if (Math.random() > 0.3) {
      const bunches = Math.floor(Math.random() * 200) + 200;
      const id = `rec-rosas-${idx}`;
      const bunchPrice = 1.10;
      const total = bunches * bunchPrice;
      insertRecord.run(id, 'sup-rosas', dateStr, bunches, 'Bonches de flores', 0, 0, 0, 'Entregado en óptimas condiciones');
      supplierBalances['sup-rosas'] += total;
    }

    // BellaRosa: delivers on average 150-350 bunches
    if (Math.random() > 0.4) {
      const bunches = Math.floor(Math.random() * 200) + 150;
      const id = `rec-bella-${idx}`;
      const bunchPrice = 0.95;
      const total = bunches * bunchPrice;
      insertRecord.run(id, 'sup-bella', dateStr, bunches, 'Bonches de flores', 0, 0, 0, 'Cargamento de exportación');
      supplierBalances['sup-bella'] += total;
    }

    // 2. Services
    // Transporte: every few days
    if (idx % 3 === 0) {
      const trips = Math.floor(Math.random() * 2) + 1;
      const tripCost = 150;
      const total = trips * tripCost;
      const id = `rec-trans-${idx}`;
      insertRecord.run(id, 'sup-trans', dateStr, 0, 'Flete refrigerado Tabacundo-Quito', trips, tripCost, total, '');
      supplierBalances['sup-trans'] += total;
    }

    // Empaque: monthly boxes
    if (idx % 12 === 0) {
      const qty = Math.floor(Math.random() * 500) + 300;
      const cost = 1.25;
      const total = qty * cost;
      const id = `rec-empaq-${idx}`;
      insertRecord.run(id, 'sup-empaq', dateStr, 0, 'Cajas de cartón QB/HB', qty, cost, total, 'Lote semestral');
      supplierBalances['sup-empaq'] += total;
    }

    // Insumos: every month
    if (idx % 15 === 0) {
      const total = Math.floor(Math.random() * 300) + 150;
      const id = `rec-insum-${idx}`;
      insertRecord.run(id, 'sup-insum', dateStr, 0, 'Fertilizantes y abonos', 1, total, total, '');
      supplierBalances['sup-insum'] += total;
    }

    // 3. Sales Invoices (documents)
    // Create sales to clients
    if (idx % 4 === 0) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const invNum = String(invoiceCounter++);
      const mawb = `729-${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`;
      const hawb = `FFC02${Math.floor(Math.random() * 90000) + 10000}`;
      const docId = `doc-inv-${invNum}-${idx}`;

      // Generate invoice items (1 to 4 items)
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      for (let i = 0; i < numItems; i++) {
        const variety = varieties[Math.floor(Math.random() * varieties.length)];
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        const pieceType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const rate = pieceRates[pieceType];
        const bunchesCount = Math.floor(Math.random() * 20) + 8; // 8-27 bunches
        const unitPrice = (Math.random() * 0.8 + 1.2).toFixed(2); // 1.20 - 2.00 USD
        const sistem = (bunchesCount * rate).toFixed(2);

        items.push({
          id: i + 1,
          variety,
          length,
          bn: String(bunchesCount),
          pieceType,
          pieceRate: rate,
          untFactor: rate,
          unitPrice,
          stemsPerBunch: 25,
          sistem
        });
      }

      const fullData = {
        facturaAnterior: invNum,
        serie: '001-002',
        mawb,
        hawb,
        bodega: 'ROSAS',
        producto: 'ROSAS',
        cliente: client.name,
        fechaFactura: dateStr,
        agencia: agencyNames[Math.floor(Math.random() * agencyNames.length)],
        marcacion: "ANGEL'S BLOOMS",
        dae: `0552026400${Math.floor(Math.random() * 9000000) + 1000000}`,
        pais: client.country,
        items
      };

      insertDocument.run(
        docId,
        'a4',
        fullData.dae,
        fullData.facturaAnterior,
        fullData.serie,
        fullData.fechaFactura,
        fullData.mawb,
        fullData.hawb,
        fullData.pais,
        fullData.marcacion,
        fullData.producto,
        fullData.agencia,
        fullData.cliente,
        JSON.stringify(items),
        JSON.stringify(fullData),
        dateStr + 'T12:00:00Z'
      );

      // Also sometimes create a routing sheet or summary sheet for this sale
      if (Math.random() > 0.5) {
        insertDocument.run(
          `doc-ruta-${invNum}-${idx}`,
          'ruta',
          fullData.dae,
          fullData.facturaAnterior,
          fullData.serie,
          fullData.fechaFactura,
          fullData.mawb,
          fullData.hawb,
          fullData.pais,
          fullData.marcacion,
          fullData.producto,
          fullData.agencia,
          fullData.cliente,
          JSON.stringify(items),
          JSON.stringify(fullData),
          dateStr + 'T12:05:00Z'
        );
      }
    }

    // 4. Payments processing (to suppliers)
    // Check if supplier balances are high, make a payment
    Object.keys(supplierBalances).forEach(supId => {
      const balance = supplierBalances[supId];
      if (balance > 500 || (idx === dates.length - 1 && balance > 0)) {
        const payId = `pay-${idx}-${supId}`;
        // Pay either 80% to 100% of balance
        const payPercent = Math.random() > 0.2 ? 1.0 : 0.8;
        const amount = Number((balance * payPercent).toFixed(2));
        const status = Math.random() > 0.1 ? 'Pagado' : 'Pendiente';
        const method = ['Transferencia', 'Cheque', 'Efectivo'][Math.floor(Math.random() * 3)];
        const note = payPercent === 1.0 ? 'Liquidación total' : 'Abono parcial de saldo';

        insertPayment.run(payId, supId, amount, dateStr, status, method, note);
        supplierBalances[supId] -= amount;
      }
    });
  });

  console.log('Database seeded successfully!');
}

seed();
db.close();
