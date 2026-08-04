// Dynamic generation of demo data for browser localStorage

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

export function generateDemoData() {
  const suppliers = [
    { id: 'sup-chimbo', name: 'Segundo Remigio Chimbo Guamán', type: 'Flores', service: '', cedula: '0502345678', email: 'remigio.chimbo@gmail.com', phone: '0981234561' },
    { id: 'sup-toaquiza', name: 'María Tránsito Toaquiza Choloquinga', type: 'Flores', service: '', cedula: '0503456789', email: 'transito.toaquiza@gmail.com', phone: '0982345672' },
    { id: 'sup-tipan', name: 'Luis Alfonso Tipán Quishpe', type: 'Flores', service: '', cedula: '0504567890', email: 'alfonso.tipan@gmail.com', phone: '0983456783' },
    { id: 'sup-caiza', name: 'Rosa Elena Caiza Pilataxi', type: 'Flores', service: '', cedula: '0505678901', email: 'elena.caiza@gmail.com', phone: '0984567894' },
    { id: 'sup-pila', name: 'José Manuel Pila Tucumbi', type: 'Flores', service: '', cedula: '0506789012', email: 'manuel.pila@gmail.com', phone: '0985678905' },
    { id: 'sup-tuala', name: 'Carmen Julia Tuala Latacunga', type: 'Flores', service: '', cedula: '0507890123', email: 'julia.tuala@gmail.com', phone: '0986789016' },
    { id: 'sup-chancusi', name: 'Manuel Mesías Chancusi Pallo', type: 'Flores', service: '', cedula: '0508901234', email: 'mesias.chancusi@gmail.com', phone: '0987890127' },
    { id: 'sup-chasi', name: 'Ángel Heriberto Chasi Ugsha', type: 'Flores', service: '', cedula: '0509012345', email: 'heriberto.chasi@gmail.com', phone: '0988901238' },
    { id: 'sup-vega', name: 'María Mercedes Vega Iza', type: 'Flores', service: '', cedula: '0501122334', email: 'mercedes.vega@gmail.com', phone: '0989012349' },
    { id: 'sup-guanochanga', name: 'Juan Francisco Guanochanga Pilapanta', type: 'Flores', service: '', cedula: '0502233445', email: 'francisco.guanochanga@gmail.com', phone: '0980123450' },
    
    // Logistics & Packaging Services (to keep the system functioning)
    { id: 'sup-trans', name: 'Transportes Rápidos Florales S.A.', type: 'Transporte', service: 'Transporte refrigerado', cedula: '1798765432001', email: 'transito@transflor.com', phone: '0998765432' },
    { id: 'sup-empaq', name: 'Empaques Andinos Cia. Ltda.', type: 'Empaque', service: 'Cajas y capuchones', cedula: '1793456789001', email: 'ventas@empaquesandinos.ec', phone: '0993456789' }
  ];

  const prices = {
    'sup-chimbo': 0.85,
    'sup-toaquiza': 0.90,
    'sup-tipan': 0.88,
    'sup-caiza': 0.92,
    'sup-pila': 0.87,
    'sup-tuala': 0.89,
    'sup-chancusi': 0.91,
    'sup-chasi': 0.93,
    'sup-vega': 0.86,
    'sup-guanochanga': 0.90
  };

  const clients = [
    { id: 'cli-miami', name: 'Miami Floral Importers S.A.', cedula: '1109876543', email: 'purchasing@miamifloral.com', phone: '+1 305-555-0199', country: 'ESTADOS UNIDOS', notes: 'Bodega de consolidación en Miami. Variedad Freedom preferida.' },
    { id: 'cli-ny', name: 'New York Flower Distributors', cedula: '4409876543', email: 'orders@nyflowers.com', phone: '+1 212-555-0177', country: 'ESTADOS UNIDOS', notes: 'Entregas semanales en aeropuerto JFK.' },
    { id: 'cli-toronto', name: 'Toronto Petals Dist.', cedula: '2209876543', email: 'logistics@torontopetals.ca', phone: '+1 416-555-0144', country: 'CANADÁ', notes: 'Despachos en camión refrigerado desde Miami.' },
    { id: 'cli-madrid', name: 'Madrid Rosas S.L.', cedula: '3309876543', email: 'importaciones@madridrosas.es', phone: '+34 91-555-0122', country: 'ESPAÑA', notes: 'Calidad Premium, tallos largos de 70-80cm.' },
    { id: 'cli-ams', name: 'Amsterdam Bloom Import Co', cedula: '5509876543', email: 'contact@amsbloom.nl', phone: '+31 20-555-0111', country: 'PAÍSES BAJOS', notes: 'Despacho directo vía aérea KLM.' }
  ];

  const dates = getDatesInRange('2025-08-01', '2026-07-31');

  const records = [];
  const payments = [];
  const documents = [];

  let invoiceCounter = 1200;

  const supplierBalances = {
    'sup-chimbo': 0,
    'sup-toaquiza': 0,
    'sup-tipan': 0,
    'sup-caiza': 0,
    'sup-pila': 0,
    'sup-tuala': 0,
    'sup-chancusi': 0,
    'sup-chasi': 0,
    'sup-vega': 0,
    'sup-guanochanga': 0,
    'sup-trans': 0,
    'sup-empaq': 0
  };

  const flowerSupplierIds = [
    'sup-chimbo', 'sup-toaquiza', 'sup-tipan', 'sup-caiza', 'sup-pila',
    'sup-tuala', 'sup-chancusi', 'sup-chasi', 'sup-vega', 'sup-guanochanga'
  ];

  const varieties = ['Freedom', 'Explorer', 'Mondial', 'Playa Blanca', 'Pink Floyd', 'Hearts', 'Kahala'];
  const lengths = ['50 cm', '60 cm', '70 cm', '80 cm'];
  const pieceTypes = ['QB', 'HB', 'EB', 'FB'];
  const pieceRates = { QB: 0.25, HB: 0.5, EB: 0.125, FB: 1.0 };
  const agencyNames = ['FRESH FLOWER CARGO', 'EXPRESS CARGO S.A.', 'LATAM CARGO', 'DHL GLOBAL FORWARDING'];

  dates.forEach((dateStr, idx) => {
    // 1. Deliveries from smallholder farmers (campesinos)
    // On each date, 2 to 4 random farmers deliver flower batches
    const activeFarmersCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 farmers
    const shuffledFarmers = [...flowerSupplierIds].sort(() => 0.5 - Math.random());
    const selectedFarmers = shuffledFarmers.slice(0, activeFarmersCount);

    selectedFarmers.forEach(supId => {
      const bunches = Math.floor(Math.random() * 150) + 80; // 80 to 230 bunches per delivery
      const bunchPrice = prices[supId];
      const total = bunches * bunchPrice;
      const id = `rec-${supId}-${idx}`;
      records.push({
        id,
        supplierId: supId,
        date: dateStr,
        bunches,
        detail: 'Bonches de flores entregados',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        notes: 'Entrega directa de productor'
      });
      supplierBalances[supId] += total;
    });

    // 2. Services
    if (idx % 3 === 0) {
      const trips = Math.floor(Math.random() * 2) + 1;
      const tripCost = 150;
      const total = trips * tripCost;
      const id = `rec-trans-${idx}`;
      records.push({
        id,
        supplierId: 'sup-trans',
        date: dateStr,
        bunches: 0,
        detail: 'Flete refrigerado Tabacundo-Quito',
        quantity: trips,
        unitCost: tripCost,
        totalCost: total,
        notes: ''
      });
      supplierBalances['sup-trans'] += total;
    }

    if (idx % 12 === 0) {
      const qty = Math.floor(Math.random() * 500) + 300;
      const cost = 1.25;
      const total = qty * cost;
      const id = `rec-empaq-${idx}`;
      records.push({
        id,
        supplierId: 'sup-empaq',
        date: dateStr,
        bunches: 0,
        detail: 'Cajas de cartón QB/HB',
        quantity: qty,
        unitCost: cost,
        totalCost: total,
        notes: 'Lote semestral'
      });
      supplierBalances['sup-empaq'] += total;
    }

    // 3. Invoices (sales) and related documents
    if (idx % 4 === 0) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const invNum = String(invoiceCounter++);
      const mawb = `729-${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`;
      const hawb = `FFC02${Math.floor(Math.random() * 90000) + 10000}`;
      const docId = `doc-inv-${invNum}-${idx}`;

      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      for (let i = 0; i < numItems; i++) {
        const variety = varieties[Math.floor(Math.random() * varieties.length)];
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        const pieceType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const rate = pieceRates[pieceType];
        const bunchesCount = Math.floor(Math.random() * 20) + 8;
        const unitPrice = (Math.random() * 0.8 + 1.2).toFixed(2);
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

      // A4 Invoice
      documents.push({
        id: docId,
        type: 'a4',
        dae: fullData.dae,
        invoice_number: fullData.facturaAnterior,
        serie: fullData.serie,
        fecha_factura: fullData.fechaFactura,
        mawb: fullData.mawb,
        hawb: fullData.hawb,
        pais_destino: fullData.pais,
        exportadora: fullData.marcacion,
        producto: fullData.producto,
        agencia: fullData.agencia,
        cliente: fullData.cliente,
        items_json: JSON.stringify(items),
        full_data_json: JSON.stringify(fullData),
        printDate: dateStr + 'T12:00:00Z',
        data: fullData,
        items: items
      });

      // Sticker/Label
      documents.push({
        id: `doc-sticker-${invNum}-${idx}`,
        type: 'sticker',
        dae: fullData.dae,
        invoice_number: fullData.facturaAnterior,
        serie: fullData.serie,
        fecha_factura: fullData.fechaFactura,
        mawb: fullData.mawb,
        hawb: fullData.hawb,
        pais_destino: fullData.pais,
        exportadora: fullData.marcacion,
        producto: fullData.producto,
        agencia: fullData.agencia,
        cliente: fullData.cliente,
        items_json: JSON.stringify(items),
        full_data_json: JSON.stringify(fullData),
        printDate: dateStr + 'T12:02:00Z',
        data: fullData,
        items: items
      });

      // Hoja Resumen
      documents.push({
        id: `doc-hoja1-${invNum}-${idx}`,
        type: 'hoja1',
        dae: fullData.dae,
        invoice_number: fullData.facturaAnterior,
        serie: fullData.serie,
        fecha_factura: fullData.fechaFactura,
        mawb: fullData.mawb,
        hawb: fullData.hawb,
        pais_destino: fullData.pais,
        exportadora: fullData.marcacion,
        producto: fullData.producto,
        agencia: fullData.agencia,
        cliente: fullData.cliente,
        items_json: JSON.stringify(items),
        full_data_json: JSON.stringify(fullData),
        printDate: dateStr + 'T12:03:00Z',
        data: fullData,
        items: items
      });

      // Hoja Ruta
      if (Math.random() > 0.5) {
        documents.push({
          id: `doc-ruta-${invNum}-${idx}`,
          type: 'ruta',
          dae: fullData.dae,
          invoice_number: fullData.facturaAnterior,
          serie: fullData.serie,
          fecha_factura: fullData.fechaFactura,
          mawb: fullData.mawb,
          hawb: fullData.hawb,
          pais_destino: fullData.pais,
          exportadora: fullData.marcacion,
          producto: fullData.producto,
          agencia: fullData.agencia,
          cliente: fullData.cliente,
          items_json: JSON.stringify(items),
          full_data_json: JSON.stringify(fullData),
          printDate: dateStr + 'T12:05:00Z',
          data: fullData,
          items: items
        });
      }
    }

    // 4. Payments
    Object.keys(supplierBalances).forEach(supId => {
      const balance = supplierBalances[supId];
      if (balance > 500 || (idx === dates.length - 1 && balance > 0)) {
        const payId = `pay-${idx}-${supId}`;
        const payPercent = Math.random() > 0.2 ? 1.0 : 0.8;
        const amount = Number((balance * payPercent).toFixed(2));
        const status = Math.random() > 0.1 ? 'Pagado' : 'Pendiente';
        const method = ['Transferencia', 'Cheque', 'Efectivo'][Math.floor(Math.random() * 3)];
        const note = payPercent === 1.0 ? 'Liquidación total' : 'Abono parcial de saldo';

        payments.push({
          id: payId,
          supplierId: supId,
          amount,
          date: dateStr,
          status,
          method,
          note
        });
        supplierBalances[supId] -= amount;
      }
    });
  });

  return { suppliers, prices, clients, records, payments, documents };
}
