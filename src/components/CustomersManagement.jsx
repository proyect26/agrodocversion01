import React, { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, BarChart3, ListFilter, ClipboardList, Plus, Trash2, Globe, Phone, Mail, FileText } from 'lucide-react';

const CLIENTS_KEY = 'clients_registry_v1';

async function dbQuery(sql, params = []) {
  if (!window.desktop?.dbQuery) return null;
  try {
    return await window.desktop.dbQuery(sql, params);
  } catch (error) {
    console.error('Error running SQLite query:', error);
    return null;
  }
}

function parseArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatUSD(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
}

const MONTH_NAMES = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
};

function formatMonthLabel(monthKey) {
  if (!monthKey || monthKey === 'Desconocido') return 'Desconocido';
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[month] || month} ${year}`;
}

export default function CustomersManagement() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // 'dashboard', 'history', 'directory'
  const [documents, setDocuments] = useState([]);
  const [directoryClients, setDirectoryClients] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClientHistory, setSelectedClientHistory] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form states for manual client creation
  const [clientForm, setClientForm] = useState({
    name: '',
    cedula: '',
    email: '',
    phone: '',
    country: '',
    notes: ''
  });
  
  // Interactive tooltip state for the chart
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // 1. Load initial data
  useEffect(() => {
    async function loadData() {
      // Load documents
      let docsList = [];
      if (window.desktop?.dbQuery) {
        const rows = await dbQuery('SELECT * FROM documents ORDER BY printDate DESC');
        if (rows) {
          docsList = rows.map(row => {
            const rawData = row.full_data_json || row.data || null;
            let parsedData = {};
            if (typeof rawData === 'string') {
              try { parsedData = JSON.parse(rawData); } catch {}
            } else if (rawData && typeof rawData === 'object') {
              parsedData = rawData;
            }
            
            const itemsRaw = row.items_json || null;
            let parsedItems = [];
            if (typeof itemsRaw === 'string') {
              try { parsedItems = JSON.parse(itemsRaw); } catch {}
            }
            
            return {
              ...row,
              data: parsedData || {},
              items: Array.isArray(parsedItems) ? parsedItems : []
            };
          });
        }
      } else {
        const saved = localStorage.getItem('printed_documents');
        if (saved) {
          try {
            docsList = JSON.parse(saved);
          } catch {}
        }
      }
      setDocuments(docsList);

      // Load clients directory
      let clientsList = [];
      if (window.desktop?.dbQuery) {
        const rows = await dbQuery('SELECT * FROM clients ORDER BY name ASC');
        if (rows) {
          clientsList = rows;
        }
      } else {
        clientsList = parseArray(localStorage.getItem(CLIENTS_KEY));
      }
      setDirectoryClients(clientsList);
      setIsLoaded(true);
    }

    loadData();
  }, []);

  // Sync directory clients to localStorage
  useEffect(() => {
    if (isLoaded && !window.desktop?.dbQuery) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(directoryClients));
    }
  }, [directoryClients, isLoaded]);

  // Helper: Extract client name from document
  const getDocCliente = (doc) => {
    const value = doc.cliente
      || doc.data?.cliente
      || doc.data?.client
      || doc.data?.clienteNombre
      || doc.data?.consignee
      || 'Sin Nombre';
    return String(value).trim();
  };

  // Helper: Extract date & parse to YYYY-MM
  const getDocMonth = (doc) => {
    const dateStr = doc.printDate || doc.fecha_factura || doc.data?.fechaFactura || '';
    if (!dateStr) return 'Desconocido';
    if (dateStr.includes('-') && dateStr.length >= 7 && dateStr.charAt(4) === '-') {
      const parts = dateStr.split('-');
      return `${parts[0]}-${parts[1]}`; // 'YYYY-MM'
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      }
    } catch {}
    return 'Desconocido';
  };

  // Helper: Get document metrics (cajas, FOB)
  const getDocMetrics = (doc) => {
    const isSticker = doc.type === 'sticker';
    if (isSticker) {
      return {
        cajas: 0.25, // QB box equivalence
        fob: 0,
        tallos: 0
      };
    }
    
    // For A4 invoices, sum the items
    const items = doc.items || [];
    let totalEB = 0;
    let totalQB = 0;
    let totalHB = 0;
    let totalFB = 0;
    let totalFob = 0;
    let totalTallos = 0;

    items.forEach(item => {
      const pieces = Number(item.bn) || 0;
      const price = Number(item.unitPrice) || 0;
      const stemsPerBunch = Number(item.stemsPerBunch) || 25;
      const totalStems = pieces * stemsPerBunch;
      const fob = pieces * price;

      if (item.pieceType === 'EB') totalEB += pieces;
      else if (item.pieceType === 'QB') totalQB += pieces;
      else if (item.pieceType === 'HB' || item.pieceType === 'HB0') totalHB += pieces;
      else if (item.pieceType === 'FB') totalFB += pieces;

      totalFob += fob;
      totalTallos += totalStems;
    });

    const totalCajas = (totalEB * 0.125) + (totalQB * 0.25) + (totalHB * 0.5) + (totalFB * 1.0);
    return {
      cajas: totalCajas || 0,
      fob: totalFob || 0,
      tallos: totalTallos || 0
    };
  };

  // 2. Aggregate everything by Client and Month
  const aggregatedStats = useMemo(() => {
    const stats = {}; // { [month]: { [clientName]: { cajas, fob, tallos, orders, products: { [prod]: cajas } } } }

    documents.forEach(doc => {
      const client = getDocCliente(doc);
      const month = getDocMonth(doc);
      if (month === 'Desconocido') return;

      const product = doc.producto || doc.data?.producto || 'Flores';
      const metrics = getDocMetrics(doc);

      if (!stats[month]) stats[month] = {};
      if (!stats[month][client]) {
        stats[month][client] = {
          cajas: 0,
          fob: 0,
          tallos: 0,
          orders: 0,
          products: {}
        };
      }

      const clientMonth = stats[month][client];
      clientMonth.cajas += metrics.cajas;
      clientMonth.fob += metrics.fob;
      clientMonth.tallos += metrics.tallos;
      clientMonth.orders += 1;

      // Group products
      if (!clientMonth.products[product]) {
        clientMonth.products[product] = 0;
      }
      clientMonth.products[product] += metrics.cajas;
    });

    return stats;
  }, [documents]);

  // Unique sorted months list
  const monthsList = useMemo(() => {
    return Object.keys(aggregatedStats).sort((a, b) => b.localeCompare(a));
  }, [aggregatedStats]);

  // Set default month when data loads
  useEffect(() => {
    if (monthsList.length > 0 && !selectedMonth) {
      setSelectedMonth(monthsList[0]);
    }
  }, [monthsList, selectedMonth]);

  // Auto-detect clients: clients that appear in documents but are not manually added to directory
  const clientsInDocuments = useMemo(() => {
    const set = new Set();
    documents.forEach(doc => {
      set.add(getDocCliente(doc));
    });
    return Array.from(set).filter(name => name && name !== 'Sin Nombre');
  }, [documents]);

  // Combined client directory (directory + auto-detected ones)
  const allClientsList = useMemo(() => {
    const directoryNames = directoryClients.map(c => c.name.trim().toUpperCase());
    const combined = [...directoryClients];

    clientsInDocuments.forEach(name => {
      const normalized = name.trim().toUpperCase();
      if (!directoryNames.includes(normalized)) {
        combined.push({
          id: 'auto-' + normalized.replace(/\s+/g, '-'),
          name: name.trim(),
          isAutodetected: true
        });
      }
    });

    return combined.sort((a, b) => a.name.localeCompare(b.name));
  }, [directoryClients, clientsInDocuments]);

  // Set default client for history tab
  useEffect(() => {
    if (allClientsList.length > 0 && !selectedClientHistory) {
      setSelectedClientHistory(allClientsList[0].name);
    }
  }, [allClientsList, selectedClientHistory]);

  // Month-specific stats and calculations
  const monthData = useMemo(() => {
    if (!selectedMonth || !aggregatedStats[selectedMonth]) return {};
    return aggregatedStats[selectedMonth];
  }, [selectedMonth, aggregatedStats]);

  // KPIs for the selected month
  const monthlyKPIs = useMemo(() => {
    const clients = Object.keys(monthData);
    if (!clients.length) {
      return { clientsCount: 0, totalCajas: 0, topClient: 'Ninguno', avgCajas: 0 };
    }

    let totalCajas = 0;
    let maxCajas = 0;
    let topClientName = 'Ninguno';
    let totalOrders = 0;

    clients.forEach(name => {
      const data = monthData[name];
      totalCajas += data.cajas;
      totalOrders += data.orders;
      if (data.cajas > maxCajas) {
        maxCajas = data.cajas;
        topClientName = name;
      }
    });

    return {
      clientsCount: clients.length,
      totalCajas: Number(totalCajas.toFixed(2)),
      topClient: topClientName,
      avgCajas: totalOrders ? Number((totalCajas / totalOrders).toFixed(2)) : 0
    };
  }, [monthData]);

  // Client rankings in selected month
  const clientRankings = useMemo(() => {
    return Object.entries(monthData)
      .map(([name, data]) => ({
        name,
        cajas: Number(data.cajas.toFixed(2)),
        fob: Number(data.fob.toFixed(2)),
        tallos: data.tallos,
        orders: data.orders,
        products: data.products
      }))
      .sort((a, b) => b.cajas - a.cajas);
  }, [monthData]);

  // 3. SVG Stacked Bar Chart Setup (Client vs Product)
  const chartData = useMemo(() => {
    // Take top 6 clients of the month to present clearly on the chart
    const topClients = clientRankings.slice(0, 6);
    
    // Find all products present in these clients
    const productsSet = new Set();
    topClients.forEach(c => {
      Object.keys(c.products).forEach(p => productsSet.add(p));
    });
    const products = Array.from(productsSet);

    // Product colors map
    const colorPalette = [
      'hsl(199, 90%, 65%)', // Bright Blue
      'hsl(142, 70%, 50%)', // Green
      'hsl(340, 90%, 60%)', // Pink / Coral
      'hsl(45, 95%, 55%)',  // Gold / Yellow
      'hsl(270, 80%, 65%)', // Purple
      'hsl(15, 90%, 60%)',  // Orange
      'hsl(180, 70%, 50%)'  // Teal
    ];
    const productColors = {};
    products.forEach((p, idx) => {
      productColors[p] = colorPalette[idx % colorPalette.length];
    });

    return {
      clients: topClients,
      products,
      colors: productColors
    };
  }, [clientRankings]);

  // History stats for the selected client
  const clientHistoryDetails = useMemo(() => {
    if (!selectedClientHistory) return [];
    
    const history = [];
    monthsList.forEach(m => {
      const monthData = aggregatedStats[m];
      if (monthData && monthData[selectedClientHistory]) {
        history.push({
          month: m,
          ...monthData[selectedClientHistory]
        });
      }
    });
    return history;
  }, [selectedClientHistory, monthsList, aggregatedStats]);

  // Client favorite products breakdown
  const clientFavoriteProducts = useMemo(() => {
    const summary = {};
    clientHistoryDetails.forEach(h => {
      Object.entries(h.products || {}).forEach(([p, val]) => {
        if (!summary[p]) summary[p] = 0;
        summary[p] += val;
      });
    });
    return Object.entries(summary)
      .map(([name, cajas]) => ({ name, cajas: Number(cajas.toFixed(2)) }))
      .sort((a, b) => b.cajas - a.cajas);
  }, [clientHistoryDetails]);

  // Save manual client details
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    const newClient = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'cli-' + Date.now(),
      name: clientForm.name.trim(),
      cedula: clientForm.cedula.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone.trim(),
      country: clientForm.country.trim(),
      notes: clientForm.notes.trim()
    };

    if (window.desktop?.dbQuery) {
      await dbQuery(
        'INSERT OR REPLACE INTO clients (id, name, cedula, email, phone, country, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newClient.id, newClient.name, newClient.cedula, newClient.email, newClient.phone, newClient.country, newClient.notes]
      );
    }

    setDirectoryClients(prev => {
      const filtered = prev.filter(c => c.name.toLowerCase() !== newClient.name.toLowerCase());
      return [...filtered, newClient].sort((a, b) => a.name.localeCompare(b.name));
    });

    setClientForm({
      name: '',
      cedula: '',
      email: '',
      phone: '',
      country: '',
      notes: ''
    });
  };

  const handleDeleteClient = async (id, name) => {
    if (!confirm(`¿Eliminar al cliente "${name}" del directorio?`)) return;

    if (window.desktop?.dbQuery) {
      await dbQuery('DELETE FROM clients WHERE id = ?', [id]);
    }
    setDirectoryClients(prev => prev.filter(c => c.id !== id));
  };

  const handleAutodetectedAdd = (name) => {
    setClientForm(prev => ({
      ...prev,
      name
    }));
    setActiveSubTab('directory');
  };

  return (
    <main className="main-content suppliers-main" style={{ padding: '1.5rem', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      
      {/* Module Title & Tab Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'white' }}>
            <Users color="var(--primary)" size={26} />
            Gestión de Clientes
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Analíticas de ventas mensuales, historial comercial y directorio de contactos.
          </p>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard & Gráficas', icon: <BarChart3 size={14} /> },
            { id: 'history', label: 'Historial Comercial', icon: <ClipboardList size={14} /> },
            { id: 'directory', label: 'Directorio', icon: <Globe size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === tab.id ? 'rgba(255,255,255,0.08)' : 'none',
                color: activeSubTab === tab.id ? 'white' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB TAB: DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Monthly filter */}
          <div className="card" style={{ padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListFilter size={16} color="var(--primary)" />
              Período de análisis:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                color: 'white',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {monthsList.map(m => (
                <option key={m} value={m} style={{ background: '#1e293b' }}>
                  {formatMonthLabel(m)}
                </option>
              ))}
              {!monthsList.length && <option>No hay meses disponibles</option>}
            </select>
          </div>

          {/* KPIs Section */}
          <section className="suppliers-dashboard">
            <article className="card suppliers-kpi">
              <h3>Clientes Activos</h3>
              <p>{monthlyKPIs.clientsCount || 0}</p>
            </article>
            <article className="card suppliers-kpi">
              <h3>Cajas Despachadas</h3>
              <p>{monthlyKPIs.totalCajas || 0} EQ</p>
            </article>
            <article className="card suppliers-kpi">
              <h3>Top Comprador</h3>
              <p style={{ fontSize: '1.15rem', color: 'hsl(199, 90%, 68%)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {monthlyKPIs.topClient || 'Ninguno'}
              </p>
            </article>
            <article className="card suppliers-kpi">
              <h3>Cajas Promedio</h3>
              <p>{monthlyKPIs.avgCajas || 0} por Doc</p>
            </article>
          </section>

          {/* Grid Layout: Graph & Monthly Table */}
          <div className="suppliers-grid">
            
            {/* SVG STACKED BAR CHART */}
            <article className="card suppliers-block" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'white' }}>Distribución Cliente - Producto</h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Valores en Cajas Equivalentes</span>
              </div>
              
              {chartData.clients.length === 0 ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  Sin datos suficientes para graficar en este mes.
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* SVG Chart Container */}
                  <svg width="100%" height="280" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                    {/* Y-axis gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                      const maxVal = Math.max(...chartData.clients.map(c => c.cajas)) || 10;
                      const gridY = 40 + ratio * 180;
                      const gridVal = ((1.0 - ratio) * maxVal).toFixed(1);
                      return (
                        <g key={idx}>
                          <line x1="50" y1={gridY} x2="570" y2={gridY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                          <text x="40" y={gridY + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end">{gridVal}</text>
                        </g>
                      );
                    })}

                    {/* Draw Columns */}
                    {chartData.clients.map((client, cIdx) => {
                      const maxVal = Math.max(...chartData.clients.map(c => c.cajas)) || 10;
                      const colWidth = 40;
                      const colGap = 80;
                      const colX = 75 + cIdx * colGap;
                      
                      // Calculate stacks
                      let currentY = 220; // baseline
                      const productEntries = Object.entries(client.products);
                      
                      return (
                        <g key={client.name}>
                          {productEntries.map(([prod, cajas]) => {
                            const barHeight = (cajas / maxVal) * 180;
                            const barY = currentY - barHeight;
                            const fill = chartData.colors[prod] || 'grey';
                            const selfY = barY;
                            const selfHeight = barHeight;
                            currentY = barY; // prepare next stack

                            return (
                              <rect
                                key={prod}
                                x={colX}
                                y={selfY}
                                width={colWidth}
                                height={selfHeight}
                                fill={fill}
                                rx="3"
                                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => setHoveredSegment({
                                  client: client.name,
                                  product: prod,
                                  cajas: cajas.toFixed(2),
                                  x: colX + 20,
                                  y: selfY
                                })}
                                onMouseLeave={() => setHoveredSegment(null)}
                              />
                            );
                          })}

                          {/* Client Label */}
                          <text
                            x={colX + 20}
                            y="240"
                            fill="var(--text-primary)"
                            fontSize="9"
                            textAnchor="middle"
                            style={{ fontWeight: 600 }}
                          >
                            {client.name.length > 8 ? client.name.slice(0, 8) + '..' : client.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Chart Tooltip */}
                    {hoveredSegment && (
                      <g>
                        <rect
                          x={hoveredSegment.x - 60}
                          y={hoveredSegment.y - 45}
                          width="120"
                          height="40"
                          rx="6"
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke="var(--glass-border)"
                          strokeWidth="1"
                        />
                        <text x={hoveredSegment.x} y={hoveredSegment.y - 32} fill="white" fontSize="9" fontWeight="700" textAnchor="middle">
                          {hoveredSegment.product}
                        </text>
                        <text x={hoveredSegment.x} y={hoveredSegment.y - 18} fill="hsl(199, 90%, 68%)" fontSize="9" textAnchor="middle">
                          {hoveredSegment.cajas} Cajas (EQ)
                        </text>
                      </g>
                    )}
                  </svg>
                  
                  {/* Legend Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.8rem', justifyContent: 'center' }}>
                    {chartData.products.map(p => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: chartData.colors[p] }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* MONTHLY RANKING TABLE */}
            <article className="card suppliers-block" style={{ gridColumn: 'span 1' }}>
              <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'white' }}>Ranking de Clientes</h2>
              
              <div className="suppliers-table-wrap" style={{ maxHeight: '310px', overflowY: 'auto' }}>
                <div className="suppliers-row suppliers-row-head" style={{ gridTemplateColumns: '1.8fr 1fr 1fr' }}>
                  <strong>Cliente</strong>
                  <strong>Pedidos</strong>
                  <strong>Cajas</strong>
                </div>
                {clientRankings.map((row, idx) => (
                  <div key={row.name} className="suppliers-row" style={{ gridTemplateColumns: '1.8fr 1fr 1fr', padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}>
                    <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.name}>
                      {idx + 1}. {row.name}
                    </strong>
                    <span>{row.orders}</span>
                    <strong style={{ color: 'hsl(199, 90%, 68%)' }}>{row.cajas}</strong>
                  </div>
                ))}
                {!clientRankings.length && <p className="suppliers-empty">Sin compras registradas este mes.</p>}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* SUB TAB: HISTORY */}
      {activeSubTab === 'history' && (
        <div className="suppliers-grid">
          
          {/* Client Selection */}
          <article className="card suppliers-block" style={{ gridColumn: '1 / 2' }}>
            <h2>1) Seleccionar Cliente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Listado Comercial
              </label>
              <select
                value={selectedClientHistory}
                onChange={(e) => setSelectedClientHistory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.82rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'white',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allClientsList.map(c => (
                  <option key={c.id} value={c.name} style={{ background: '#1e293b' }}>
                    {c.name} {c.isAutodetected ? '(Auto-detectado)' : ''}
                  </option>
                ))}
                {!allClientsList.length && <option>No hay clientes</option>}
              </select>
            </div>
            
            {/* Selected Client metadata from directory */}
            {(() => {
              const info = directoryClients.find(c => c.name.toLowerCase() === selectedClientHistory.toLowerCase());
              if (!info) {
                return (
                  <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(239, 149, 0, 0.08)', border: '1px solid rgba(239, 149, 0, 0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(239, 149, 0, 0.85)' }}>
                    <strong>Cliente no registrado.</strong> Este cliente se detectó automáticamente desde tus facturas guardadas. Registra sus detalles en la pestaña de Directorio.
                    <button 
                      onClick={() => handleAutodetectedAdd(selectedClientHistory)}
                      className="btn btn-outline" 
                      style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.75rem', padding: '0.3rem' }}
                    >
                      Registrar cliente
                    </button>
                  </div>
                );
              }
              return (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, color: 'white' }}>Ficha de Cliente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Globe size={13} color="var(--primary)" /> 
                      <span style={{ color: 'var(--text-secondary)' }}>Destino:</span> {info.country || 'N/A'}
                    </div>
                    {info.cedula && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FileText size={13} color="var(--primary)" />
                        <span style={{ color: 'var(--text-secondary)' }}>Cédula/RUC:</span> {info.cedula}
                      </div>
                    )}
                    {info.phone && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Phone size={13} color="var(--primary)" />
                        <span style={{ color: 'var(--text-secondary)' }}>Teléfono:</span> {info.phone}
                      </div>
                    )}
                    {info.email && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Mail size={13} color="var(--primary)" />
                        <span style={{ color: 'var(--text-secondary)' }}>Email:</span> {info.email}
                      </div>
                    )}
                    {info.notes && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '0.45rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Notas comerciales:</span>
                        <span style={{ fontSize: '0.78rem' }}>{info.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </article>

          {/* Client Purchase History Table & Favorite Products */}
          <article className="card suppliers-block" style={{ gridColumn: '2 / 4' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'white' }}>Historial Comercial: {selectedClientHistory}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
              {/* Left Column: Months list */}
              <div>
                <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-secondary)' }}>Historial de Meses</h3>
                <div className="suppliers-table-wrap">
                  <div className="suppliers-row suppliers-row-head" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1fr' }}>
                    <strong>Mes</strong>
                    <strong>Pedidos</strong>
                    <strong>Cajas (EQ)</strong>
                    <strong>FOB USD</strong>
                  </div>
                  {clientHistoryDetails.map(row => (
                    <div key={row.month} className="suppliers-row" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1fr', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}>
                      <strong>{formatMonthLabel(row.month)}</strong>
                      <span>{row.orders}</span>
                      <strong style={{ color: 'hsl(199, 90%, 68%)' }}>{row.cajas.toFixed(2)}</strong>
                      <span>{formatUSD(row.fob)}</span>
                    </div>
                  ))}
                  {!clientHistoryDetails.length && <p className="suppliers-empty">Sin compras registradas en el historial.</p>}
                </div>
              </div>

              {/* Right Column: Products breakdown */}
              <div>
                <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-secondary)' }}>Distribución de Flores</h3>
                <div className="suppliers-table-wrap">
                  <div className="suppliers-row suppliers-row-head" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                    <strong>Producto / Variedad</strong>
                    <strong>Cajas</strong>
                  </div>
                  {clientFavoriteProducts.map(item => (
                    <div key={item.name} className="suppliers-row" style={{ gridTemplateColumns: '1.5fr 1fr', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}>
                      <strong>{item.name}</strong>
                      <strong style={{ color: 'hsl(142, 70%, 50%)' }}>{item.cajas}</strong>
                    </div>
                  ))}
                  {!clientFavoriteProducts.length && <p className="suppliers-empty">Sin datos.</p>}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* SUB TAB: DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="suppliers-grid">
          
          {/* Add Manual Client Form */}
          <article className="card suppliers-block" style={{ gridColumn: '1 / 2' }}>
            <h2>Registrar Cliente Nuevo</h2>
            <form onSubmit={handleSaveClient} className="suppliers-form" style={{ gap: '0.6rem' }}>
              <input
                style={{ gridColumn: '1 / -1' }}
                value={clientForm.name}
                onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la empresa / Cliente"
                required
              />
              <input
                value={clientForm.cedula}
                onChange={(e) => setClientForm(prev => ({ ...prev, cedula: e.target.value }))}
                placeholder="Cédula / RUC"
              />
              <input
                value={clientForm.country}
                onChange={(e) => setClientForm(prev => ({ ...prev, country: e.target.value }))}
                placeholder="País de destino"
              />
              <input
                value={clientForm.phone}
                onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Teléfono"
                type="tel"
              />
              <input
                style={{ gridColumn: '1 / -1' }}
                value={clientForm.email}
                onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Correo electrónico"
                type="email"
              />
              <textarea
                style={{ gridColumn: '1 / -1', minHeight: '60px', padding: '0.45rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.82rem', fontFamily: 'inherit' }}
                value={clientForm.notes}
                onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas o términos de venta..."
              />
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Plus size={15} /> Guardar Cliente
              </button>
            </form>
          </article>

          {/* Directory Client list */}
          <article className="card suppliers-block" style={{ gridColumn: '2 / 4' }}>
            <h2>Directorio de Contactos</h2>
            <div className="suppliers-table-wrap">
              <div className="suppliers-row suppliers-row-head" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1.5fr auto' }}>
                <strong>Empresa / Cliente</strong>
                <strong>Cédula/RUC</strong>
                <strong>País</strong>
                <strong>Contacto</strong>
                <strong></strong>
              </div>
              {directoryClients.map(client => (
                <div key={client.id} className="suppliers-row" style={{ gridTemplateColumns: '1.5fr 1fr 1.2fr 1.5fr auto', padding: '0.65rem 0.85rem', fontSize: '0.82rem' }}>
                  <strong>📁 {client.name}</strong>
                  <span>{client.cedula || '-'}</span>
                  <span>{client.country || '-'}</span>
                  <div>
                    {client.phone && <small>📞 {client.phone}</small>}
                    {client.email && <small style={{ color: 'var(--text-secondary)' }}>✉️ {client.email}</small>}
                  </div>
                  <button className="btn btn-outline" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }} onClick={() => handleDeleteClient(client.id, client.name)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {!directoryClients.length && <p className="suppliers-empty">No hay clientes manuales guardados. Agrega uno con el formulario.</p>}
            </div>
          </article>

        </div>
      )}

    </main>
  );
}
