import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  Sprout,
  Calendar,
  Flower2,
  DollarSign,
  Users,
  ShieldAlert,
  ChevronRight,
  Thermometer,
  Droplets,
  Search,
  Tag,
  Truck,
  HandCoins,
  CheckCircle2,
  HelpCircle,
  TrendingUp
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

// Cultivation Knowledge Base
const CULTIVATION_INFO = {
  temp: '12°C a 20°C',
  humidity: '60% a 75%',
  pH: '6.5 a 7.2 pH',
  cycle: '90 a 110 Días',
  cuartoFrio: '2°C a 4°C con 90% a 95% de Humedad Relativa',
  corteStage: '30% a 50% de las flores en la espiga abiertas',
  talloLargo: '60 a 80 cm de largo comercial',
  markets: [
    { name: 'San Valentín (14 Feb)', sembrado: '20-31 Octubre', trasplante: '15-25 Noviembre', cosecha: '25 Enero - 10 Febrero' },
    { name: 'Día de la Madre (Mayo)', sembrado: '20-31 Enero', trasplante: '15-25 Febrero', cosecha: '20 Abril - 5 Mayo' },
    { name: 'Día de la Mujer (8 Mar)', sembrado: '10-20 Noviembre', trasplante: 'Diciembre', cosecha: 'Finales Febrero' },
    { name: 'Navidad (Dic)', sembrado: 'Agosto', trasplante: 'Septiembre', cosecha: 'Diciembre' }
  ],
  pests: [
    { name: 'Trips', control: 'Trampas cromáticas azules y control preventivo en botón floral.' },
    { name: 'Botrytis', control: 'Ventilación óptima en invernadero, evitar riego foliar, retiro de residuo enfermo.' },
    { name: 'Fusarium', control: 'Desinfección de suelo y excelente drenaje para evitar estancamiento de agua.' },
    { name: 'Mildiu', control: 'Aplicaciones preventivas de cobre y marco de siembra amplio.' }
  ]
};

function answerQuestion(query, liveData) {
  const q = String(query || '').toLowerCase().trim();

  // Cultivation & Harvest Questions
  if (q.includes('cultivo') || q.includes('cosecha') || q.includes('siembra') || q.includes('fechas') || q.includes('san valentin') || q.includes('madre')) {
    const marketList = CULTIVATION_INFO.markets
      .map(m => `• **${m.name}**: Siembra ${m.sembrado} ➔ Cosecha ${m.cosecha}`)
      .join('\n');

    return `🌱 **Guía Agronómica de Cultivo y Cosecha (Alhelí / Matthiola incana):**

⏱️ **Parámetros Generales:**
• **Ciclo de Producción**: ${CULTIVATION_INFO.cycle}
• **Temperatura Ideal**: ${CULTIVATION_INFO.temp}
• **Humedad Relativa**: ${CULTIVATION_INFO.humidity}
• **pH de Suelo**: ${CULTIVATION_INFO.pH}

📅 **Calendarios Clave para Exportación:**
${marketList}

❄️ **Manejo en Poscosecha:**
• **Punto de Corte**: ${CULTIVATION_INFO.corteStage}.
• **Cuarto Frío**: ${CULTIVATION_INFO.cuartoFrio}.`;
  }

  // Pests & Diseases
  if (q.includes('plaga') || q.includes('botrytis') || q.includes('trips') || q.includes('enfermedad') || q.includes('fungicida') || q.includes('limpieza')) {
    const pestsList = CULTIVATION_INFO.pests
      .map(p => `• **${p.name}**: ${p.control}`)
      .join('\n');

    return `🛡️ **Fitosanidad y Control de Plagas/Enfermedades:**

${pestsList}

💡 **Recomendación General**: Monitoreo diario, ventilación adecuada en el invernadero y desinfección estricta de herramientas de corte.`;
  }

  // Cold Room & Post Harvest
  if (q.includes('frio') || q.includes('poscosecha') || q.includes('corte') || q.includes('duracion') || q.includes('florero') || q.includes('cuarto')) {
    return `❄️ **Poscosecha y Conservación en Cuarto Frío:**

1. **Momento de Corte**: Cosechar con el **${CULTIVATION_INFO.corteStage}**. Tallo largo de **${CULTIVATION_INFO.talloLargo}**.
2. **Hidratación**: Colocar en agua filtrada con bactericida durante mínimo 4 horas.
3. **Temperatura de Almacenamiento**: Mantener a **${CULTIVATION_INFO.cuartoFrio}**.
4. **Objetivo**: Asegurar máxima vida en florero ("Vase Life") para el cliente final.`;
  }

  // Varieties & Colors (Pink, Orange, Yellow, etc.)
  if (q.includes('variedad') || q.includes('variedades') || q.includes('color') || q.includes('pink') || q.includes('orange') || q.includes('yellow') || q.includes('wellow') || q.includes('flor')) {
    if (liveData.varietyBreakdown.length === 0) {
      return `🌸 **Variedades Comercializadas:**
Trabajamos con variedades como **Pink Floyd**, **Orange**, **Yellow**, **White**, **Lavender**, **Red**, **Freedom**, **Mondial**, **Playa Blanca**, **Hearts** y **Kahala**.

Actualmente no hay facturas o lotes registrados para desglose de volumen.`;
    }

    const list = liveData.varietyBreakdown
      .slice(0, 7)
      .map((v) => `• **${v.name}**: ${v.volume} cajas (${v.percentage}% del total, ${v.revenue ? money(v.revenue) : 'registrado'})`)
      .join('\n');

    return `🌸 **Análisis de Variedades y Colores más Vendidos:**

${list}

🏆 **Variedad Líder**: **${liveData.topVariety.name}** con **${liveData.topVariety.volume} cajas** (${liveData.topVariety.percentage}% de participación).`;
  }

  // Clients & Sales
  if (q.includes('cliente') || q.includes('ventas') || q.includes('compras') || q.includes('top') || q.includes('quien')) {
    if (liveData.clientBreakdown.length === 0) {
      return `👥 **Gestión de Clientes:**\nNo se registran compras todavía en el sistema.`;
    }

    const top3 = liveData.clientBreakdown
      .slice(0, 4)
      .map((c, i) => `${i + 1}. **${c.name}**: ${money(c.value)} (${c.boxes} cajas)`)
      .join('\n');

    return `🏆 **Clientes Principales por Volumen de Compra:**

${top3}

📊 **Resumen**: **${liveData.topClient.name}** encabeza la lista con un total acumulado de **${money(liveData.topClient.value)}**.`;
  }

  // Payments & Debt
  if (q.includes('pago') || q.includes('pagos') || q.includes('pendiente') || q.includes('deuda') || q.includes('cobro') || q.includes('banco')) {
    return `💳 **Estado de Cuentas y Pagos:**

• **Monto Pendiente de Cobro**: ${money(liveData.payments.pending)}
• **Monto Cobrado / Confirmado**: ${money(liveData.payments.paid)}

💡 **Sugerencia de Gestión**: ${
      liveData.payments.pending > 0
        ? `Coordinar con contabilidad la cobranza de ${money(liveData.payments.pending)}.`
        : 'Todos los pagos se encuentran al día.'
    }`;
  }

  // Suppliers & Logistics
  if (q.includes('proveedor') || q.includes('proveedores') || q.includes('servicio') || q.includes('transporte') || q.includes('carga')) {
    if (liveData.providers.length === 0) {
      return `🚚 **Proveedores**: No hay proveedores registrados.`;
    }

    const provs = liveData.providers.map((p) => `• **${p.name}**: ${p.services}`).join('\n');
    return `🚚 **Red de Proveedores y Servicios Agro-Logísticos:**\n\n${provs}`;
  }

  // General summary / greeting
  return `🤖 **AgroDocs AI - Resumen de Operación y Cultivo:**

📊 **Ventas & Operación**:
• **Ingresos Totales**: ${money(liveData.totalRevenue)} (${liveData.totalOrders} documentos emitidos)
• **Cajas Exportadas**: ${liveData.totalBoxes} cajas
• **Variedad Líder**: ${liveData.topVariety.name} (${liveData.topVariety.volume} cajas)
• **Cliente Principal**: ${liveData.topClient.name} (${money(liveData.topClient.value)})

🌱 **Agronomía & Cosecha**:
• **Ciclo Ideal**: 90-110 días | Temp: 12-20°C | Humedad: 60-75%
• **Cuarto Frío**: 2-4°C con 90-95% HR

Puedes hacerme preguntas sobre:
1. *"Variedades y colores que vendemos"*
2. *"Fechas de siembra para San Valentín o Día de la Madre"*
3. *"Temperaturas e indicación de cuarto frío"*
4. *"Plagas y prevención de Botrytis o Trips"*
5. *"Clientes top y saldos pendientes"*`;
}

export default function AIAssistantView() {
  const [documents, setDocuments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [question, setQuestion] = useState('');
  const [customReply, setCustomReply] = useState(null);

  useEffect(() => {
    const loadData = () => {
      setDocuments(parseArray(localStorage.getItem(DOCS_KEY)));
      setSuppliers(parseArray(localStorage.getItem(SUPPLIERS_KEY)));
      setPayments(parseArray(localStorage.getItem(PAYMENTS_KEY)));
    };
    loadData();
  }, []);

  const liveData = useMemo(() => {
    let totalRevenue = 0;
    let totalBoxes = 0;
    let totalOrders = 0;
    const byClient = {};
    const boxesByClient = {};
    const varietyMap = {};
    const varietyRevenueMap = {};

    documents.forEach((doc) => {
      const normalized = normalizeDoc(doc);
      const client = getClientName(normalized);
      totalOrders += 1;

      (normalized.items || []).forEach((item) => {
        const qty = Number(item.bn) || 0;
        const price = Number(item.unitPrice) || 0;
        const rev = qty * price;
        const variety = getVarietyName(item);

        totalRevenue += rev;
        totalBoxes += qty;

        byClient[client] = (byClient[client] || 0) + rev;
        boxesByClient[client] = (boxesByClient[client] || 0) + qty;

        varietyMap[variety] = (varietyMap[variety] || 0) + qty;
        varietyRevenueMap[variety] = (varietyRevenueMap[variety] || 0) + rev;
      });
    });

    const clientBreakdown = Object.entries(byClient)
      .map(([name, value]) => ({
        name,
        value,
        boxes: boxesByClient[name] || 0
      }))
      .sort((a, b) => b.value - a.value);

    const topClient = clientBreakdown[0] || { name: 'Sin registro', value: 0, boxes: 0 };

    const totalVarietyBoxes = Object.values(varietyMap).reduce((a, b) => a + b, 0) || 1;
    const varietyBreakdown = Object.entries(varietyMap)
      .map(([name, volume]) => ({
        name,
        volume,
        revenue: varietyRevenueMap[name] || 0,
        percentage: Math.round((volume / totalVarietyBoxes) * 100)
      }))
      .sort((a, b) => b.volume - a.volume);

    const topVariety = varietyBreakdown[0] || {
      name: 'Pink Floyd',
      volume: 0,
      revenue: 0,
      percentage: 0
    };

    const providerSummary = suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      services: supplier.service || supplier.type || 'Servicios Agro-Logísticos'
    }));

    const pending = payments
      .filter((p) => String(p.status).toLowerCase() === 'pendiente')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const paid = payments
      .filter((p) => String(p.status).toLowerCase() === 'pagado')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      totalRevenue,
      totalBoxes,
      totalOrders,
      topClient,
      topVariety,
      clientBreakdown,
      varietyBreakdown,
      providers: providerSummary,
      payments: { pending, paid }
    };
  }, [documents, payments, suppliers]);

  const activeReply = customReply !== null ? customReply : answerQuestion('resumen', liveData);

  const handleAsk = (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    setCustomReply(answerQuestion(question, liveData));
    setQuestion('');
  };

  const handleQuickClick = (qText) => {
    setQuestion(qText);
    setCustomReply(answerQuestion(qText, liveData));
  };

  const PREDEFINED_QUESTIONS = [
    { label: '🌸 Variedades y Colores Vendidos (Pink, Orange, Yellow, etc.)', query: 'variedades que vendemos' },
    { label: '🌾 Calendario de Cosecha (San Valentín y Día de la Madre)', query: 'calendario de cultivo y cosecha' },
    { label: '🌡️ Temperatura, Humedad y pH Ideal del Cultivo', query: 'temperatura y humedad ideal del cultivo' },
    { label: '🛡️ Prevención de Plagas (Botrytis, Trips, Mildiu)', query: 'plagas y enfermedades en cultivo' },
    { label: '❄️ Cuarto Frío y Poscosecha (Conservación)', query: 'temperatura de cuarto frio y poscosecha' },
    { label: '🏆 Clientes Top y Volumen de Compras', query: 'clientes principales' },
    { label: '💳 Estado de Pagos y Saldos Pendientes', query: 'pagos pendientes' },
    { label: '🚚 Proveedores de Carga y Servicios', query: 'proveedores y servicios' }
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
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(168, 85, 247, 0.25))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot color="#38bdf8" size={32} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Asistente de Inteligencia IA AgroDocs
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: 'rgba(168, 85, 247, 0.25)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  fontWeight: 700
                }}
              >
                CULTIVO + VENTAS IA
              </span>
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Consulta inteligente de siembra, cosecha, poscosecha, variedades (Pink, Orange, Yellow, etc.) y clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Panel: Predefined Questions */}
        <section
          style={{
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: '18px',
            padding: '1.25rem',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.6rem' }}>
            <HelpCircle color="#38bdf8" size={20} />
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>Preguntas Predefinidas</h2>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Haz clic en cualquiera de estas opciones o escribe tu propia consulta para obtener respuesta al instante:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PREDEFINED_QUESTIONS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickClick(item.query)}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              >
                <span>{item.label}</span>
                <ChevronRight size={14} color="var(--text-secondary)" />
              </button>
            ))}
          </div>
        </section>

        {/* Right Panel: Interactive Query Input & AI Answer Box */}
        <section
          style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border-strong)',
            borderRadius: '18px',
            padding: '1.25rem',
            boxShadow: 'var(--glass-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.6rem' }}>
            <Sparkles color="#c084fc" size={20} />
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>Consulta Inteligente en Tiempo Real</h2>
          </div>

          <form onSubmit={handleAsk} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ej: ¿Qué temperatura usa el cuarto frío? o ¿Cuánto vendimos de Pink u Orange?"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border-strong)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(56, 189, 248, 0.8))',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Sparkles size={16} />
              Preguntar
            </button>
          </form>

          {/* AI Answer Display */}
          <div
            style={{
              background: 'rgba(10, 16, 30, 0.65)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '1.25rem',
              borderRadius: '14px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#38bdf8' }}>
              <Bot size={20} />
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Respuesta de Inteligencia AgroDocs</strong>
            </div>

            <div
              style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                lineHeight: '1.65',
                whiteSpace: 'pre-line'
              }}
            >
              {activeReply}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
