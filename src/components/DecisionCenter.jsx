import React, { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  Users,
  Flower2,
  Bot,
  DollarSign,
  FileText,
  Search,
  TrendingUp,
  Sparkles,
  PieChart,
  Tag,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Layers
} from 'lucide-react';

const CLIENTS_KEY = 'clients_registry_v1';
const PAYMENTS_KEY = 'payments_registry_v1';
const SUPPLIERS_KEY = 'suppliers_registry_v4';
const DOCS_KEY = 'printed_documents';

const KNOWN_VARIETIES = [
  'Pink Floyd',
  'Pink',
  'Orange',
  'Yellow',
  'White',
  'Lavender',
  'Purple',
  'Red',
  'Bicolor',
  'Freedom',
  'Explorer',
  'Mondial',
  'Playa Blanca',
  'Hearts',
  'Kahala'
];

function parseArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeDoc(doc) {
  const rawData = doc?.data || doc?.full_data_json || {};
  let parsedData = rawData;
  if (typeof rawData === 'string') {
    try {
      parsedData = JSON.parse(rawData);
    } catch {
      parsedData = {};
    }
  }

  const itemsRaw = doc?.items || doc?.items_json || parsedData?.items || [];
  let parsedItems = itemsRaw;
  if (typeof itemsRaw === 'string') {
    try {
      parsedItems = JSON.parse(itemsRaw);
    } catch {
      parsedItems = [];
    }
  }

  return {
    ...doc,
    data: parsedData && typeof parsedData === 'object' ? parsedData : {},
    items: Array.isArray(parsedItems) ? parsedItems : []
  };
}

function getClientName(doc) {
  return String(
    doc?.cliente ||
    doc?.data?.cliente ||
    doc?.data?.client ||
    doc?.data?.clienteNombre ||
    doc?.data?.consignee ||
    'Sin Nombre'
  ).trim();
}

function normalizeVarietyName(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Variedad General';

  const lower = raw.toLowerCase();

  if (lower === 'pink' || lower === 'pink floyd') return 'Pink Floyd';
  if (lower === 'orange' || lower === 'naranja') return 'Orange';
  if (lower === 'yellow' || lower === 'wellow' || lower === 'amarillo') return 'Yellow';
  if (lower === 'white' || lower === 'blanco') return 'White';
  if (lower === 'lavender' || lower === 'lavanda') return 'Lavender';
  if (lower === 'purple' || lower === 'morado') return 'Purple';
  if (lower === 'red' || lower === 'rojo') return 'Red';
  if (lower === 'bicolor') return 'Bicolor';
  if (lower === 'freedom') return 'Freedom';
  if (lower === 'explorer') return 'Explorer';
  if (lower === 'mondial') return 'Mondial';
  if (lower === 'playa blanca' || lower === 'playablanca') return 'Playa Blanca';
  if (lower === 'hearts') return 'Hearts';
  if (lower === 'kahala') return 'Kahala';

  const matchedKnown = KNOWN_VARIETIES.find((v) => v.toLowerCase() === lower);
  if (matchedKnown) return matchedKnown;

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getVarietyName(item) {
  const rawValue = item?.variety ?? item?.color ?? item?.variedad ?? '';
  return normalizeVarietyName(rawValue);
}

function money(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
}

function getVarietyColor(varietyName) {
  const name = String(varietyName || '').toLowerCase();
  if (name.includes('pink') || name.includes('rosa')) {
    return { bg: 'rgba(236, 72, 153, 0.18)', border: 'rgba(236, 72, 153, 0.5)', text: '#f472b6', bar: 'linear-gradient(90deg, #ec4899, #f472b6)' };
  }
  if (name.includes('orange') || name.includes('naranja')) {
    return { bg: 'rgba(249, 115, 22, 0.18)', border: 'rgba(249, 115, 22, 0.5)', text: '#fb923c', bar: 'linear-gradient(90deg, #f97316, #fb923c)' };
  }
  if (name.includes('yellow') || name.includes('wellow') || name.includes('amarillo')) {
    return { bg: 'rgba(234, 179, 8, 0.18)', border: 'rgba(234, 179, 8, 0.5)', text: '#facc15', bar: 'linear-gradient(90deg, #eab308, #facc15)' };
  }
  if (name.includes('red') || name.includes('rojo') || name.includes('freedom') || name.includes('hearts')) {
    return { bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171', bar: 'linear-gradient(90deg, #ef4444, #f87171)' };
  }
  if (name.includes('white') || name.includes('blanco') || name.includes('mondial') || name.includes('playa')) {
    return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', text: '#7dd3fc', bar: 'linear-gradient(90deg, #38bdf8, #bae6fd)' };
  }
  if (name.includes('purple') || name.includes('lavender') || name.includes('morado')) {
    return { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.5)', text: '#c084fc', bar: 'linear-gradient(90deg, #a855f7, #c084fc)' };
  }
  if (name.includes('bicolor')) {
    return { bg: 'rgba(244, 63, 94, 0.18)', border: 'rgba(244, 63, 94, 0.5)', text: '#fb7185', bar: 'linear-gradient(90deg, #ec4899, #f97316)' };
  }
  return { bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399', bar: 'linear-gradient(90deg, #10b981, #34d399)' };
}

function summarizeDocuments(docs) {
  return docs.reduce(
    (acc, doc) => {
      const normalized = normalizeDoc(doc);
      const client = getClientName(normalized);
      const total = (normalized.items || []).reduce((sum, item) => {
        const quantity = Number(item.bn) || 1;
        const price = Number(item.unitPrice) || 0;
        return sum + quantity * price;
      }, 0);

      const totalBoxes = (normalized.items || []).reduce((sum, item) => sum + (Number(item.bn) || 0), 0);

      acc.totalRevenue += total;
      acc.totalBoxes += totalBoxes;
      acc.totalOrders += 1;
      acc.clients.add(client);
      acc.byClient[client] = (acc.byClient[client] || 0) + total;
      acc.boxesByClient[client] = (acc.boxesByClient[client] || 0) + totalBoxes;
      return acc;
    },
    { totalRevenue: 0, totalBoxes: 0, totalOrders: 0, clients: new Set(), byClient: {}, boxesByClient: {} }
  );
}

function makeBotAnswer(question, analytics) {
  const q = question.toLowerCase();

  if (q.includes('cultivo') || q.includes('cosecha') || q.includes('siembra') || q.includes('fechas') || q.includes('san valentin') || q.includes('madre')) {
    return `🌱 **Guía Agronómica de Cultivo y Cosecha (Alhelí / Matthiola incana):**

⏱️ **Parámetros Básicos:**
• **Ciclo Total**: 90 a 110 Días
• **Temperatura Ideal**: 12°C a 20°C
• **Humedad Relativa**: 60% a 75% | **pH**: 6.5 a 7.2

📅 **Fechas Clave de Siembra y Cosecha:**
• **San Valentín (14 Feb)**: Siembra 20-31 Oct ➔ Cosecha 25 Ene - 10 Feb
• **Día de la Madre (Mayo)**: Siembra 20-31 Ene ➔ Cosecha 20 Abr - 5 Mayo
• **Día de la Mujer (8 Mar)**: Siembra 10-20 Nov ➔ Cosecha Finales Febrero
• **Navidad (Dic)**: Siembra Agosto ➔ Cosecha Diciembre

❄️ **Poscosecha & Cuarto Frío**: Cosechar con 30-50% de flor abierta. Cuarto frío a 2°C–4°C con 90-95% HR.`;
  }

  if (q.includes('plaga') || q.includes('botrytis') || q.includes('trips') || q.includes('enfermedad') || q.includes('fungicida')) {
    return `🛡️ **Control de Plagas y Enfermedades en Cultivo:**

• **Trips**: Trampas cromáticas azules y control de botón floral.
• **Botrytis**: Buena ventilación en el invernadero, evitar humedad sobre pétalos.
• **Fusarium / Pythium**: Desinfección de suelo y drenaje óptimo para evitar estancamiento.
• **Mildiu**: Aplicación preventiva de cobre y marco de siembra amplio (15x20 cm).`;
  }

  if (q.includes('frio') || q.includes('poscosecha') || q.includes('corte') || q.includes('cuarto')) {
    return `❄️ **Parámetros de Poscosecha y Cuarto Frío:**

1. **Punto de Corte**: Cosechar cuando el **30% al 50%** de la espiga esté abierta.
2. **Hidratación**: Mínimo 4 horas en agua filtrada con solución bactericida.
3. **Almacenamiento**: Mantener el cuarto frío entre **2°C y 4°C** con una humedad relativa del **90% al 95%** para asegurar la máxima duración en florero ("Vase Life").`;
  }

  if (q.includes('variedad') || q.includes('variedades') || q.includes('color') || q.includes('pink') || q.includes('orange') || q.includes('yellow') || q.includes('wellow') || q.includes('flor')) {
    const list = analytics.varietyBreakdown.slice(0, 5).map((v) => `• **${v.name}**: ${v.volume} cajas (${v.revenue ? money(v.revenue) : 'ventas registradas'})`).join('\n');
    return `🌸 **Análisis de Variedades y Colores vendidas:**\n\nNuestras variedades principales reportadas son:\n${list}\n\n💡 **Tip de Decisión**: La variedad líder es **${analytics.topVariety.name}** con **${analytics.topVariety.volume} cajas** (${analytics.topVariety.percentage}% del total).`;
  }

  if (q.includes('cliente') || q.includes('ventas') || q.includes('compras') || q.includes('top') || q.includes('quien')) {
    const top = analytics.topClient;
    const top3 = analytics.clientRevenueBreakdown.slice(0, 3).map((c, i) => `${i + 1}. **${c.name}**: ${money(c.value)}`).join('\n');
    return `🏆 **Top Clientes por Ingresos:**\n${top3}\n\n👤 El cliente líder es **${top.name}** con **${money(top.value)}** en compras totales.`;
  }

  if (q.includes('pago') || q.includes('pagos') || q.includes('pendiente') || q.includes('deuda') || q.includes('cobro')) {
    const pending = analytics.payments.pending;
    const paid = analytics.payments.paid;
    return `💳 **Estado Financiero de Pagos:**\n• **Pendiente de Cobro/Pago**: ${money(pending)}\n• **Pagado y Confirmado**: ${money(paid)}\n\n⚠️ **Recomendación**: ${pending > 0 ? `Revisar cobro de ${money(pending)} con los clientes para mantener flujo de caja sano.` : 'No hay pagos pendientes acumulados.'}`;
  }

  if (q.includes('proveedor') || q.includes('proveedores') || q.includes('servicio') || q.includes('transporte') || q.includes('empaque')) {
    const provs = analytics.providers.map((p) => `• **${p.name}**: ${p.services}`).join('\n');
    return `🚚 **Proveedores y Servicios Integrados:**\n${provs}`;
  }

  if (q.includes('resumen') || q.includes('hola') || q.includes('ayuda') || q.includes('que haces')) {
    return `📊 **Resumen General de Operaciones:**\n• **Ingresos Totales**: ${money(analytics.totalRevenue)}\n• **Cajas Exportadas**: ${analytics.totalBoxes} cajas\n• **Variedad Más Vendida**: ${analytics.topVariety.name} (${analytics.topVariety.volume} cajas)\n• **Cliente Principal**: ${analytics.topClient.name} (${money(analytics.topClient.value)})\n• **Pagos Pendientes**: ${money(analytics.payments.pending)}`;
  }

  return `🤖 He analizado tu consulta. Basado en nuestros registros:\n• **Ingresos totales**: ${money(analytics.totalRevenue)}\n• **Variedad líder**: ${analytics.topVariety.name} (${analytics.topVariety.volume} cajas)\n• **Cliente principal**: ${analytics.topClient.name}\n\nPuedes preguntarme específicamente por: *"variedades que vendemos"*, *"top de clientes"*, *"pagos pendientes"* o *"resumen general"*.`;
}

export default function DecisionCenter() {
  const [documents, setDocuments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('varieties');
  const [question, setQuestion] = useState('');
  const [botReply, setBotReply] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = () => {
      const savedDocuments = parseArray(localStorage.getItem(DOCS_KEY));
      const savedSuppliers = parseArray(localStorage.getItem(SUPPLIERS_KEY));
      const savedPayments = parseArray(localStorage.getItem(PAYMENTS_KEY));

      setDocuments(savedDocuments);
      setSuppliers(savedSuppliers);
      setPayments(savedPayments);
    };

    loadData();
  }, []);

  const analytics = useMemo(() => {
    const summary = summarizeDocuments(documents);

    const clientRevenueBreakdown = Object.entries(summary.byClient)
      .map(([name, value]) => ({
        name,
        value,
        boxes: summary.boxesByClient[name] || 0
      }))
      .sort((a, b) => b.value - a.value);

    const topClient = clientRevenueBreakdown[0] || { name: 'Sin registro', value: 0, boxes: 0 };

    const varietyMap = {};
    const varietyRevenueMap = {};
    const varietyClientMap = {};

    documents.forEach((doc) => {
      const normalized = normalizeDoc(doc);
      const client = getClientName(normalized);

      (normalized.items || []).forEach((item) => {
        const variety = getVarietyName(item);
        const qty = Number(item.bn) || 0;
        const price = Number(item.unitPrice) || 0;
        const rev = qty * price;

        varietyMap[variety] = (varietyMap[variety] || 0) + qty;
        varietyRevenueMap[variety] = (varietyRevenueMap[variety] || 0) + rev;

        if (!varietyClientMap[variety]) varietyClientMap[variety] = {};
        varietyClientMap[variety][client] = (varietyClientMap[variety][client] || 0) + qty;
      });
    });

    const totalVarietyBoxes = Object.values(varietyMap).reduce((a, b) => a + b, 0) || 1;

    const varietyBreakdown = Object.entries(varietyMap)
      .map(([name, volume]) => {
        const revenue = varietyRevenueMap[name] || 0;
        const percentage = Math.round((volume / totalVarietyBoxes) * 100);
        const clientsForVariety = varietyClientMap[name] || {};
        const topClientForVariety = Object.entries(clientsForVariety).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

        return {
          name,
          volume,
          revenue,
          percentage,
          topClientName: topClientForVariety[0],
          topClientVolume: topClientForVariety[1],
          style: getVarietyColor(name)
        };
      })
      .sort((a, b) => b.volume - a.volume);

    const topVariety = varietyBreakdown[0] || {
      name: 'Pink Floyd',
      volume: 0,
      revenue: 0,
      percentage: 0,
      style: getVarietyColor('Pink Floyd')
    };

    const providerSummary = suppliers.map((supplier) => {
      const services = String(supplier.service || supplier.type || 'Servicio Agro-Logístico')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      return {
        id: supplier.id,
        name: supplier.name,
        services: services.length ? services.join(', ') : 'Servicios generales'
      };
    });

    const pending = payments
      .filter((payment) => String(payment.status).toLowerCase() === 'pendiente')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const paid = payments
      .filter((payment) => String(payment.status).toLowerCase() === 'pagado')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const byClientVariety = {};
    documents.forEach((doc) => {
      const client = getClientName(doc);
      const normalized = normalizeDoc(doc);
      if (!byClientVariety[client]) byClientVariety[client] = {};
      (normalized.items || []).forEach((item) => {
        const variety = getVarietyName(item);
        byClientVariety[client][variety] = (byClientVariety[client][variety] || 0) + (Number(item.bn) || 0);
      });
    });

    return {
      totalRevenue: summary.totalRevenue,
      totalBoxes: summary.totalBoxes,
      totalOrders: summary.totalOrders,
      clientsCount: summary.clients.size,
      topClient,
      topVariety,
      clientRevenueBreakdown,
      varietyBreakdown,
      providers: providerSummary,
      payments: { pending, paid },
      varietyByClient: Object.entries(byClientVariety)
        .map(([name, varieties]) => ({
          name,
          varieties: Object.entries(varieties)
            .map(([variety, volume]) => ({
              variety,
              volume,
              style: getVarietyColor(variety)
            }))
            .sort((a, b) => b.volume - a.volume)
        }))
        .sort((a, b) => (b.varieties[0]?.volume || 0) - (a.varieties[0]?.volume || 0))
    };
  }, [documents, payments, suppliers]);

  const activeBotReply = botReply || makeBotAnswer('resumen', analytics);

  const askBot = (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    setBotReply(makeBotAnswer(question, analytics));
    setQuestion('');
  };

  const askQuickQuestion = (qText) => {
    setQuestion(qText);
    setBotReply(makeBotAnswer(qText, analytics));
  };

  const filteredVarieties = useMemo(() => {
    if (!searchTerm.trim()) return analytics.varietyBreakdown;
    const term = searchTerm.toLowerCase();
    return analytics.varietyBreakdown.filter(
      (v) => v.name.toLowerCase().includes(term) || v.topClientName.toLowerCase().includes(term)
    );
  }, [analytics.varietyBreakdown, searchTerm]);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return analytics.varietyByClient;
    const term = searchTerm.toLowerCase();
    return analytics.varietyByClient.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.varieties.some((v) => v.variety.toLowerCase().includes(term))
    );
  }, [analytics.varietyByClient, searchTerm]);

  const insightCards = [
    {
      title: 'Ingresos Totales',
      value: money(analytics.totalRevenue),
      subtitle: `${analytics.totalOrders} documentos emitidos`,
      icon: <DollarSign size={20} color="#38bdf8" />,
      accent: 'rgba(56, 189, 248, 0.15)'
    },
    {
      title: 'Cajas Exportadas',
      value: `${analytics.totalBoxes} cajas`,
      subtitle: 'Volumen total de flor',
      icon: <Flower2 size={20} color="#ec4899" />,
      accent: 'rgba(236, 72, 153, 0.15)'
    },
    {
      title: 'Variedad Líder',
      value: analytics.topVariety.name,
      subtitle: `${analytics.topVariety.volume} cajas (${analytics.topVariety.percentage}% mercado)`,
      icon: <Tag size={20} color="#facc15" />,
      accent: 'rgba(234, 179, 8, 0.15)'
    },
    {
      title: 'Cliente Principal',
      value: analytics.topClient.name,
      subtitle: `${money(analytics.topClient.value)} acumulado`,
      icon: <Users size={20} color="#34d399" />,
      accent: 'rgba(52, 211, 153, 0.15)'
    }
  ];

  return (
    <main className="main-content suppliers-main" style={{ padding: '1.5rem', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border-strong)',
          padding: '1.25rem 1.5rem',
          borderRadius: '20px',
          boxShadow: 'var(--glass-shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(236, 72, 153, 0.25))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BrainCircuit color="#38bdf8" size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Nodo & Centro de Decisiones Inteligente
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  fontWeight: 700
                }}
              >
                LIVE ANALYTICS
              </span>
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Monitoreo claro de variedades sold (Pink, Orange, Yellow, etc.), clientes, entregas y pagos.
            </p>
          </div>
        </div>

        {/* Subtab Selector */}
        <div
          style={{
            display: 'inline-flex',
            padding: '0.3rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '14px',
            border: '1px solid var(--glass-border)',
            gap: '0.3rem'
          }}
        >
          {[
            { id: 'varieties', label: '🌸 Variedades & Colores' },
            { id: 'dashboard', label: '📊 Vista General' },
            { id: 'clients', label: '👥 Clientes & Compras' },
            { id: 'bot', label: '🤖 Asistente IA' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '0.55rem 1rem',
                border: 'none',
                borderRadius: '10px',
                background: activeSubTab === tab.id ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(14, 165, 233, 0.2))' : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: activeSubTab === tab.id ? 'rgba(56, 189, 248, 0.5)' : 'transparent',
                color: activeSubTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeSubTab === tab.id ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeSubTab === tab.id ? '0 4px 12px rgba(56, 189, 248, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Top */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {insightCards.map((card) => (
          <article
            key={card.title}
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'transform 0.2s',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.title}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '10px', background: card.accent }}>{card.icon}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.1rem 0' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{card.subtitle}</div>
            </div>
          </article>
        ))}
      </section>

      {/* Main SubTab Contents */}

      {/* TAB 1: VARIEDADES Y COLORES */}
      {activeSubTab === 'varieties' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Variety Search & Quick Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flower2 color="#ec4899" size={22} />
                Variedades y Colores Comercializados
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                Desglose detallado de ventas por tipo de flor (Pink Floyd, Orange, Yellow, White, Red, Bicolor, Freedom, etc.)
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar variedad o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Variety Grid Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredVarieties.map((item) => (
              <div
                key={item.name}
                style={{
                  background: 'rgba(15, 23, 42, 0.35)',
                  backdropFilter: 'var(--glass-blur)',
                  border: `1px solid ${item.style.border}`,
                  borderRadius: '16px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  boxShadow: 'var(--glass-shadow)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: item.style.bg,
                    filter: 'blur(20px)',
                    pointerEvents: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      background: item.style.bg,
                      color: item.style.text,
                      border: `1px solid ${item.style.border}`,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Tag size={13} />
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {item.percentage}% del total
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.volume}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>cajas / lotes</span>
                  </div>
                  {item.revenue > 0 && (
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: item.style.text }}>
                      {money(item.revenue)}
                    </div>
                  )}
                </div>

                {/* Bar */}
                <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(item.percentage, 6)}%`,
                      height: '100%',
                      background: item.style.bar,
                      borderRadius: '999px',
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>

                {/* Top buyer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mayor comprador:</span>
                  <strong style={{ color: '#ffffff' }}>{item.topClientName} ({item.topClientVolume} cajas)</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Variedades por Cliente Matrix */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#38bdf8" />
              Preferencia de Variedad por Cliente
            </h3>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {analytics.varietyByClient.map((clientObj) => (
                <div
                  key={clientObj.name}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>{clientObj.name}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {clientObj.varieties.reduce((sum, v) => sum + v.volume, 0)} cajas totales
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {clientObj.varieties.map((v) => (
                      <span
                        key={`${clientObj.name}-${v.variety}`}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          background: v.style.bg,
                          color: v.style.text,
                          border: `1px solid ${v.style.border}`,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {v.variety}: <strong>{v.volume} cajas</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISTA GENERAL */}
      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {/* Client Revenue Chart */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#38bdf8" />
              Ventas Principales por Cliente
            </h3>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {analytics.clientRevenueBreakdown.slice(0, 6).map((client) => {
                const max = analytics.clientRevenueBreakdown[0]?.value || 1;
                const width = Math.max((client.value / max) * 100, 8);
                return (
                  <div key={client.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.83rem' }}>
                      <strong style={{ color: '#ffffff' }}>{client.name}</strong>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{money(client.value)}</span>
                    </div>
                    <div style={{ height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${width}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
                          borderRadius: '999px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variety Volume Bar Chart */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="#ec4899" />
              Ranking de Variedades por Volumen (Cajas)
            </h3>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {analytics.varietyBreakdown.slice(0, 6).map((variety) => {
                const max = analytics.varietyBreakdown[0]?.volume || 1;
                const width = Math.max((variety.volume / max) * 100, 8);
                return (
                  <div key={variety.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.83rem' }}>
                      <span style={{ color: variety.style.text, fontWeight: 800 }}>{variety.name}</span>
                      <strong style={{ color: '#ffffff' }}>{variety.volume} cajas</strong>
                    </div>
                    <div style={{ height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${width}%`,
                          height: '100%',
                          background: variety.style.bar,
                          borderRadius: '999px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suppliers Control */}
          <div
            style={{
              gridColumn: '1 / -1',
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
              Servicios Registrados por Proveedores
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {analytics.providers.map((provider) => (
                <div
                  key={provider.id}
                  style={{
                    padding: '0.75rem 0.9rem',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>{provider.name}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{provider.services}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENTES Y COMPRAS */}
      {activeSubTab === 'clients' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users color="#38bdf8" size={22} />
              Registro Operacional por Cliente
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {filteredClients.map((client) => {
              const revInfo = analytics.clientRevenueBreakdown.find((c) => c.name === client.name) || { value: 0, boxes: 0 };
              const topVar = client.varieties[0] || { variety: 'N/A', volume: 0, style: getVarietyColor('') };

              return (
                <div
                  key={client.name}
                  style={{
                    background: 'rgba(15, 23, 42, 0.35)',
                    backdropFilter: 'var(--glass-blur)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    boxShadow: 'var(--glass-shadow)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>{client.name}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {revInfo.boxes} cajas totales
                      </span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                      {money(revInfo.value)}
                    </span>
                  </div>

                  <div style={{ padding: '0.6rem 0.75rem', borderRadius: '10px', background: topVar.style.bg, border: `1px solid ${topVar.style.border}` }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Variedad Preferida:</span>
                    <strong style={{ color: topVar.style.text, fontSize: '0.88rem' }}>
                      {topVar.variety} ({topVar.volume} cajas)
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Todas las variedades compradas:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {client.varieties.map((v) => (
                        <span
                          key={v.variety}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {v.variety}: {v.volume}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payments State */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
              Estado Financiero de Cuentas por Cobrar
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <span style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 700, display: 'block' }}>Monto Pendiente</span>
                <strong style={{ fontSize: '1.5rem', color: '#ffffff' }}>{money(analytics.payments.pending)}</strong>
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span style={{ fontSize: '0.8rem', color: '#86efac', fontWeight: 700, display: 'block' }}>Monto Cobrado / Pagado</span>
                <strong style={{ fontSize: '1.5rem', color: '#ffffff' }}>{money(analytics.payments.paid)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASISTENTE DE DECISIONES CON IA */}
      {activeSubTab === 'bot' && (
        <section
          style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border-strong)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: 'var(--glass-shadow-lg)',
            display: 'grid',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <Bot color="#38bdf8" size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>Asistente Inteligente AgroDocs</h2>
              <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Consultas automáticas en tiempo real sobre ventas, variedades (Pink, Orange, Yellow, etc.), clientes y proveedores.
              </p>
            </div>
          </div>

          {/* Quick buttons */}
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Preguntas Frecuentes Sugeridas:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                '🌸 ¿Qué variedades vendemos y cuál lidera?',
                '🌾 Fechas de siembra y cosecha (San Valentín / Madre)',
                '🌡️ ¿Temperatura y humedad ideal para el cultivo?',
                '🛡️ ¿Cómo prevenimos Botrytis y Trips?',
                '❄️ ¿Condiciones de poscosecha y cuarto frío?',
                '🏆 ¿Cuál es nuestro cliente principal?',
                '💳 ¿Cuál es el saldo pendiente de pagos?',
                '🚚 ¿Qué servicios ofrecen los proveedores?',
                '📊 Resumen completo de la empresa'
              ].map((qText) => (
                <button
                  key={qText}
                  onClick={() => askQuickQuestion(qText)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56,189,248,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                >
                  {qText}
                  <ChevronRight size={13} color="var(--text-secondary)" />
                </button>
              ))}
            </div>
          </div>

          {/* Form input */}
          <form onSubmit={askBot} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej: ¿Qué cliente compra más Pink u Orange? ¿Cuánto hay en facturas?"
              style={{
                flex: 1,
                minWidth: '260px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border-strong)',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.8), rgba(14, 165, 233, 0.8))',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
              }}
            >
              <Sparkles size={16} />
              Consultar
            </button>
          </form>

          {/* Reply box */}
          {activeBotReply && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8' }}>
                <Bot size={20} />
                <strong style={{ fontSize: '0.95rem' }}>Respuesta de Inteligencia AgroDocs</strong>
              </div>
              <div
                style={{
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}
              >
                {activeBotReply}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
