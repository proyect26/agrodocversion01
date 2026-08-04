import React, { useState, useMemo } from 'react';
import { 
  Sprout, Calendar, Thermometer, Droplets, Target, ShieldAlert, 
  Award, AlertTriangle, Bug, ClipboardList, BookOpen, Info, 
  CheckCircle2, ChevronRight, ChevronDown, RefreshCw
} from 'lucide-react';

const CALENDARIO_MERCADOS = [
  {
    id: 'valentin',
    label: 'San Valentín (14 Feb)',
    desc: 'Ventana de mayor demanda y mejores precios en EE.UU. e internacional.',
    germinacion: '20–31 de octubre',
    trasplante: '15–25 de noviembre',
    cosecha: '25 de enero–10 de febrero',
    estrellas: 5,
    demandaText: 'Muy alta'
  },
  {
    id: 'madre',
    label: 'Día de la Madre (Mayo)',
    desc: 'Excelente ventana para EE.UU. (segundo domingo de mayo).',
    germinacion: '20–31 de enero',
    trasplante: '15–25 de febrero',
    cosecha: '20 de abril–5 de mayo',
    estrellas: 5,
    demandaText: 'Muy alta'
  },
  {
    id: 'mujer',
    label: 'Día de la Mujer (8 Mar)',
    desc: 'Ventana fuerte enfocada en mercado europeo y euroasiático.',
    germinacion: '10–20 de noviembre',
    trasplante: 'Diciembre',
    cosecha: 'Finales de febrero',
    estrellas: 4,
    demandaText: 'Alta'
  },
  {
    id: 'pascua',
    label: 'Pascua (Marzo-Abril)',
    desc: 'Alta demanda de colores pastel y blancos.',
    germinacion: 'Diciembre',
    trasplante: 'Enero',
    cosecha: 'Marzo–Abril',
    estrellas: 3,
    demandaText: 'Media'
  },
  {
    id: 'bodas',
    label: 'Bodas de Verano (Europa)',
    desc: 'Junio a agosto. Alta demanda de flor de corte para eventos.',
    germinacion: 'Febrero',
    trasplante: 'Marzo',
    cosecha: 'Junio–Agosto',
    estrellas: 4,
    demandaText: 'Alta'
  },
  {
    id: 'thanksgiving',
    label: 'Acción de Gracias (Nov)',
    desc: 'Demanda media, fuerte en colores bronce, amarillos y melocotón.',
    germinacion: 'Julio',
    trasplante: 'Agosto',
    cosecha: 'Noviembre',
    estrellas: 3,
    demandaText: 'Media'
  },
  {
    id: 'navidad',
    label: 'Navidad (Diciembre)',
    desc: 'Demanda de colores rojos, púrpuras y blancos intensos.',
    germinacion: 'Agosto',
    trasplante: 'Septiembre',
    cosecha: 'Diciembre',
    estrellas: 4,
    demandaText: 'Alta'
  }
];

const MANEJO_SEMANAL = [
  { sem: 1, categoria: 'Riego', titulo: 'Monitoreo Inicial y Humedad', desc: 'Revisar la humedad constante en el semillero. Mantener entre 15–18°C y 75% de humedad. No aplicar ningún tipo de fertilizante en esta etapa.' },
  { sem: 2, categoria: 'Nutrición', titulo: 'Aplicación de Calcio', desc: 'Aplicar calcio foliar suave para el fortalecimiento de las paredes celulares en las primeras plántulas germinadas.' },
  { sem: 3, categoria: 'Nutrición', titulo: 'Primer Abonado Suave', desc: 'Aplicar un fertilizante inicial muy ligero diluido en agua para estimular el crecimiento de las raíces jóvenes.' },
  { sem: 4, categoria: 'Labores', titulo: 'Preparación de Trasplante', desc: 'Las plántulas deben tener entre 3 y 4 hojas verdaderas (8–10 cm). Preparación del suelo (pH 6.5–7.2, drenaje óptimo, fósforo y calcio incorporados).' },
  { sem: 5, categoria: 'Labores', titulo: 'Trasplante y Tutorado', desc: 'Realizar el trasplante al campo definitivo con un marco de 15x20 cm o 20x20 cm. Colocar redes de tutorado inmediatamente para guiar el crecimiento recto del tallo.' },
  { sem: 6, categoria: 'Labores', titulo: 'Descarte y Selección', desc: 'Eliminar plantas débiles, torcidas o que muestren retraso. En alhelí, el descarte oportuno garantiza el alto porcentaje de calidad de exportación.' },
  { sem: 7, categoria: 'Plagas', titulo: 'Monitoreo Fitosanitario', desc: 'Monitoreo exhaustivo de plagas (pulgones y trips). Instalar trampas cromáticas azules para la detección y control de trips.' },
  { sem: 8, categoria: 'Nutrición', titulo: 'Inducción de Potasio', desc: 'Aumentar las dosis de potasio en la fertilización y reducir levemente el nitrógeno para inducir la maduración del tallo y el color floral.' },
  { sem: 9, categoria: 'Enfermedades', titulo: 'Prevención de Botrytis y Mildiu', desc: 'Aplicar fungicidas preventivos y mejorar la ventilación en el invernadero para evitar acumulación de humedad sobre el follaje.' },
  { sem: 10, categoria: 'Labores', titulo: 'Medición de Altura', desc: 'Evaluación de la longitud del tallo. El objetivo comercial para exportación es alcanzar un rango de 60 a 80 cm de largo.' },
  { sem: 11, categoria: 'Fisiología', titulo: 'Botón Floral', desc: 'Aparición de los primeros botones florales. Ajustar el riego para que el suelo esté húmedo pero nunca encharcado.' },
  { sem: 12, categoria: 'Labores', titulo: 'Aclareo y Desbotone', desc: 'Eliminar flores o botones deformes o espigas laterales para concentrar toda la energía de la planta en la inflorescencia principal.' },
  { sem: 13, categoria: 'Labores', titulo: 'Preparación Logística', desc: 'Alistar herramientas de corte desinfectadas, mallas, ligas, y preparar las tinas con solución hidratante.' },
  { sem: 14, categoria: 'Cosecha', titulo: 'Cosecha e Hidratación', desc: 'Iniciar el corte cuando el 30–50% de las flores de la espiga estén abiertas. Hidratar de inmediato en agua con bactericida.' },
  { sem: 15, categoria: 'Cosecha', titulo: 'Poscosecha y Despacho', desc: 'Almacenamiento en cuarto frío a 2–4°C y 90–95% de humedad relativa para estabilizar la flor antes del empaque final.' }
];

const ENFERMEDADES = [
  {
    nombre: 'Botrytis (Moho Gris)',
    causa: 'Exceso de humedad relativa (>90%) y agua estancada sobre pétalos.',
    sintomas: 'Moho aterciopelado grisáceo sobre hojas, botones y flores. Pudrición de la espiga floral.',
    prevencion: 'Excelente ventilación en los invernaderos, evitar el riego foliar y retirar de inmediato todo residuo o follaje enfermo.'
  },
  {
    nombre: 'Fusarium',
    causa: 'Hongo de suelo favorecido por drenaje deficiente.',
    sintomas: 'Marchitez unilateral de la planta, amarillamiento foliar progresivo y necrosis de los haces vasculares del tallo.',
    prevencion: 'Desinfección previa del suelo, uso de sustratos limpios y evitar encharcamientos continuos.'
  },
  {
    nombre: 'Pythium (Damping-off)',
    causa: 'Hongo acuático asociado directamente al exceso de riego en sustrato.',
    sintomas: 'Pudrición radicular, tallo blando en la base (cuello de la planta) y colapso de plántulas en semillero.',
    prevencion: 'Drenaje impecable, riego regulado por goteo y desinfección estricta de bandejas de germinación.'
  },
  {
    nombre: 'Mildiu',
    causa: 'Humedad relativa alta y temperaturas frescas en las noches.',
    sintomas: 'Manchas amarillentas en el haz de la hoja y un polvo blanquecino en el envés.',
    prevencion: 'Espaciamiento adecuado entre plantas (marco de siembra amplio) y aplicaciones preventivas de cobre.'
  }
];

const PLAGAS = [
  {
    nombre: 'Trips (Frankliniella)',
    gravedad: 'Extrema',
    sintomas: 'Deformación de pétalos, manchas plateadas en hojas, transmisión de virus. Daño directo al valor estético comercial.',
    control: 'Instalar trampas cromáticas azules adhesivas desde la siembra, y aplicar controles biológicos o químicos preventivos en fase de botón.'
  },
  {
    nombre: 'Pulgones',
    gravedad: 'Alta',
    sintomas: 'Succión de savia, deformación de brotes tiernos, secreción de melaza que propicia el hongo negrilla.',
    control: 'Monitoreo desde los primeros días. Aplicaciones localizadas de jabón potásico o insecticidas selectivos.'
  },
  {
    nombre: 'Mosca Blanca',
    gravedad: 'Media',
    sintomas: 'Debilitamiento general de la planta, pérdida de vigor foliar.',
    control: 'Control biológico (avispas parasitoides) e instalación de trampas amarillas adhesivas.'
  },
  {
    nombre: 'Ácaros (Araña Roja)',
    gravedad: 'Media-Alta',
    sintomas: 'Puntos cloróticos en hojas, telarañas finas en el envés bajo condiciones calurosas y secas.',
    control: 'Revisión semanal exhaustiva del envés de las hojas y mantenimiento de niveles adecuados de humedad relativa.'
  }
];

export default function CultivationGuide() {
  const [activeMarket, setActiveMarket] = useState('valentin');
  const [expandedWeek, setExpandedWeek] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('calendario'); // 'calendario', 'semanas', 'fitosanitario', 'calidad'
  
  // Custom calculator states
  const [customHarvestDate, setCustomHarvestDate] = useState('2026-02-14');
  const [showCustomCalculation, setShowCustomCalculation] = useState(false);

  const selectedMarketData = useMemo(() => {
    return CALENDARIO_MERCADOS.find(m => m.id === activeMarket);
  }, [activeMarket]);

  // Dynamic back-calculation based on targeted harvest date
  const calculatedDates = useMemo(() => {
    if (!customHarvestDate) return null;
    const harvest = new Date(customHarvestDate);
    if (isNaN(harvest.getTime())) return null;

    // Averages:
    // Cosecha: starts 95 days after sowing (germinación)
    // Trasplante: 30 days after sowing
    // Formacion floral: 70 days after sowing
    const germDate = new Date(harvest);
    germDate.setDate(harvest.getDate() - 95);

    const transplantDate = new Date(germDate);
    transplantDate.setDate(germDate.getDate() + 30);

    const floralDate = new Date(germDate);
    floralDate.setDate(germDate.getDate() + 70);

    const format = (d) => d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      germinar: format(germDate),
      trasplantar: format(transplantDate),
      floral: format(floralDate),
      cosecha: format(harvest)
    };
  }, [customHarvestDate]);

  return (
    <main className="main-content suppliers-main" style={{ padding: '1.5rem', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      
      {/* Header and overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'white' }}>
            <Sprout color="var(--primary)" size={26} />
            Guía de Cultivo: Alhelí de Exportación
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manual técnico y cronograma para la producción de Matthiola incana de alta calidad en Ecuador.
          </p>
        </div>

        {/* Top tab selector */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'calendario', label: 'Fechas & Siembra', icon: <Calendar size={14} /> },
            { id: 'semanas', label: 'Cronograma Semanal', icon: <ClipboardList size={14} /> },
            { id: 'fitosanitario', label: 'Plagas & Enfermedades', icon: <ShieldAlert size={14} /> },
            { id: 'calidad', label: 'Calidad & Poscosecha', icon: <Award size={14} /> }
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

      {/* SUB-TAB 1: CALENDARIOS Y FECHAS DE SIEMBRA */}
      {activeSubTab === 'calendario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Parameters Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#38bdf8' }}>
                <Thermometer size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Temperatura Ideal</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>12°C – 20°C</p>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#10b981' }}>
                <Droplets size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Humedad Relativa</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>60% – 75%</p>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#eab308' }}>
                <Sprout size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ciclo de Producción</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>90 – 110 Días</p>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#8b5cf6' }}>
                <Target size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Suelo pH Ideal</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>6.5 – 7.2 pH</p>
              </div>
            </div>
          </div>

          {/* Interactive Market Calendars */}
          <div className="suppliers-grid">
            
            {/* List of high-demand markets */}
            <article className="card suppliers-block">
              <h2>Calendarios de Mayor Demanda</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '-0.3rem', marginBottom: '1rem' }}>
                Las ventanas florales que pagan mejores precios en el mercado internacional de exportación.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {CALENDARIO_MERCADOS.map(m => {
                  const isActive = m.id === activeMarket;
                  return (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setActiveMarket(m.id);
                        setShowCustomCalculation(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--primary)' : 'var(--glass-border)',
                        background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.01)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: isActive ? 'white' : 'var(--text-primary)' }}>{m.label}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cosecha: {m.cosecha}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#eab308', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                          {'⭐'.repeat(m.estrellas)}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.demandaText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Selected Market Timeline */}
            <article className="card suppliers-block" style={{ gridColumn: 'span 1' }}>
              {!showCustomCalculation ? (
                <>
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                      <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Cronograma: {selectedMarketData.label}</h2>
                    </div>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {selectedMarketData.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', paddingLeft: '1rem' }}>
                    {/* Vertical timeline line */}
                    <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '4px', width: '2px', background: 'rgba(255,255,255,0.06)' }} />

                    {/* Step 1: Germinación */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px #eab308' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#eab308', letterSpacing: '0.05em' }}>Fase 1 · Germinar en Semillero</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{selectedMarketData.germinacion}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Semillas en sustrato liviano (turba, perlita, vermiculita). Tapar levemente (2-3 mm). Temperatura ideal: 15–18°C.</p>
                    </div>

                    {/* Step 2: Trasplante */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>Fase 2 · Trasplante a Campo</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{selectedMarketData.trasplante}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Plantas con 3-4 hojas verdaderas (8-10 cm). Marco de 15x20 cm. Incorporar fósforo, calcio y materia orgánica al suelo.</p>
                    </div>

                    {/* Step 3: Formación Floral */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.05em' }}>Fase 3 · Desarrollo & Inducción</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>Durante el ciclo medio (Semanas 6 - 12)</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tutorado, control fitosanitario preventivo, incremento paulatino de Potasio para engrosamiento del tallo y definición de color.</p>
                    </div>

                    {/* Step 4: Cosecha */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>Fase 4 · Corte para Exportación</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{selectedMarketData.cosecha}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Cortar con 30–50% de las flores de la espiga abiertas. Hidratación inmediata y almacenamiento en frío (2–4°C).</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }} />
                      <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Calculadora de Siembra a Medida</h2>
                    </div>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Ingresa la fecha estimada en la que deseas realizar tu despacho/corte, y el sistema calculará hacia atrás tu calendario de siembra óptimo.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', paddingLeft: '1rem' }}>
                    <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '4px', width: '2px', background: 'rgba(255,255,255,0.06)' }} />

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#eab308' }}>Paso 1: Germinar / Semillero</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{calculatedDates.germinar}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Debes sembrar aproximadamente 95 días antes de la fecha final del corte.</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#38bdf8' }}>Paso 2: Trasplantar al campo</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{calculatedDates.trasplantar}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>A los 30 días de germinado (plántulas con 3-4 hojas verdaderas).</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#8b5cf6' }}>Paso 3: Formación e Inducción Floral</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{calculatedDates.floral}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>A los 70 días de germinado. Ajuste fino de fertilización rica en potasio.</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#10b981' }}>Paso 4: Fecha de Corte Proyectada</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', margin: '0.1rem 0', color: 'white' }}>{calculatedDates.cosecha}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tu fecha objetivo de cosecha seleccionada para el mercado.</p>
                    </div>
                  </div>
                </>
              )}
            </article>

          </div>

          {/* Interactive Siembra Calculator tool */}
          <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(56,189,248,0.04) 100%)', border: '1px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={16} color="var(--primary)" />
                ¿Tienes una fecha de corte o evento específico fuera de calendario?
              </h3>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Usa nuestra calculadora a medida. Ingresa tu fecha deseada y calcularemos todo tu ciclo técnico de producción automáticamente.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <input
                type="date"
                value={customHarvestDate}
                onChange={(e) => {
                  setCustomHarvestDate(e.target.value);
                  setShowCustomCalculation(true);
                }}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  fontWeight: 600,
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <button 
                onClick={() => {
                  setShowCustomCalculation(true);
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Calcular Ciclo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CRONOGRAMA SEMANAL (15 WEEKS) */}
      {activeSubTab === 'semanas' && (
        <div className="suppliers-grid" style={{ gridTemplateColumns: '1.4fr 1.6fr' }}>
          
          {/* Week Selector Checklist */}
          <article className="card suppliers-block">
            <h2>Manejo Técnico Semanal</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.3rem', marginBottom: '1.2rem' }}>
              Despliega la semana del cultivo para revisar las tareas obligatorias y evitar errores.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {MANEJO_SEMANAL.map(w => {
                const isExpanded = w.sem === expandedWeek;
                const catColors = {
                  Riego: 'rgba(56, 189, 248, 0.12)',
                  Nutrición: 'rgba(234, 179, 8, 0.12)',
                  Labores: 'rgba(139, 92, 246, 0.12)',
                  Plagas: 'rgba(239, 68, 68, 0.12)',
                  Enfermedades: 'rgba(244, 63, 94, 0.12)',
                  Fisiología: 'rgba(236, 72, 153, 0.12)',
                  Cosecha: 'rgba(16, 185, 129, 0.12)'
                };
                const catTextColors = {
                  Riego: '#38bdf8',
                  Nutrición: '#facc15',
                  Labores: '#c084fc',
                  Plagas: '#f87171',
                  Enfermedades: '#fb7185',
                  Fisiología: '#f472b6',
                  Cosecha: '#34d399'
                };
                return (
                  <div 
                    key={w.sem}
                    onClick={() => setExpandedWeek(w.sem)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isExpanded ? 'var(--primary)' : 'var(--glass-border)',
                      background: isExpanded ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '6px', 
                        background: isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {w.sem}
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: isExpanded ? 'white' : 'var(--text-primary)' }}>{w.titulo}</strong>
                      </div>
                    </div>
                    
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '99px',
                      background: catColors[w.categoria] || 'grey',
                      color: catTextColors[w.categoria] || 'white'
                    }}>
                      {w.categoria}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Week Detail Display Card */}
          <article className="card suppliers-block" style={{ height: 'fit-content' }}>
            {(() => {
              const currentWeekData = MANEJO_SEMANAL.find(w => w.sem === expandedWeek);
              if (!currentWeekData) return null;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ClipboardList color="var(--primary)" size={20} />
                      <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Detalle de Semana {currentWeekData.sem}</h2>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)'
                    }}>
                      Fase de Cultivo
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Actividad o Acción Principal</span>
                      <h3 style={{ margin: '0.1rem 0 0.4rem 0', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>{currentWeekData.titulo}</h3>
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        fontSize: '0.86rem',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)'
                      }}>
                        {currentWeekData.desc}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', color: 'white', fontWeight: 700 }}>Notas de Recomendación Rápida</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <li>Mantén un registro manual diario del comportamiento de plagas.</li>
                        <li>Verifica el riego por goteo; el alhelí es altamente susceptible a hongos de raíz.</li>
                        <li>Si el color de las hojas empieza a palidecer, evalúa la conductividad eléctrica del suelo.</li>
                        <li>Asegúrate de retirar residuos vegetales enfermos inmediatamente.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </article>
        </div>
      )}

      {/* SUB-TAB 3: FITOSANITARIO (PESTS & DISEASES) */}
      {activeSubTab === 'fitosanitario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section: Diseases */}
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'white', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="hsl(340, 95%, 60%)" />
              Enfermedades Principales y Prevención
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {ENFERMEDADES.map((enf, idx) => (
                <div 
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    background: 'var(--glass-bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, #f43f5e, #ec4899)' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: 'white', fontWeight: 700 }}>{enf.nombre}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>Causa:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{enf.causa}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>Síntomas:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{enf.sintomas}</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#fb7185', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>Prevención:</span>
                      <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{enf.prevencion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Pests */}
          <div>
            <h2 style={{ fontSize: '1.15rem', color: 'white', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bug size={18} color="hsl(45, 95%, 55%)" />
              Plagas Críticas y Control
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {PLAGAS.map((plaga, idx) => (
                <div 
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    background: 'var(--glass-bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, #eab308, #ca8a04)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.92rem', color: 'white', fontWeight: 700 }}>{plaga.nombre}</h3>
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 850,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      background: plaga.gravedad === 'Extrema' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                      color: plaga.gravedad === 'Extrema' ? '#f87171' : '#facc15'
                    }}>
                      Riesgo: {plaga.gravedad}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>Daño & Síntomas:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{plaga.sintomas}</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#facc15', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>Estrategia de Control:</span>
                      <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{plaga.control}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CALIDAD Y POSCOSECHA */}
      {activeSubTab === 'calidad' && (
        <div className="suppliers-grid">
          
          {/* Post-harvest procedures */}
          <article className="card suppliers-block">
            <h2>Paso a Paso de la Poscosecha</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.3rem', marginBottom: '1.2rem' }}>
              Proteger la vida en florero (Vase Life) y asegurar que el cargamento soporte el vuelo a destino.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '6px', width: '2px', background: 'rgba(255,255,255,0.06)' }} />
              
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#38bdf8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>1</span>
                <strong>Corte Adecuado</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Cosechar cuando el 30% a 50% de las flores en la espiga estén abiertas. Si se corta muy cerrada, no abrirá; si se corta muy abierta, se dañará en el empaque.
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#38bdf8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>2</span>
                <strong>Hidratación Inmediata</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Colocar los tallos recién cortados en agua limpia filtrada con agentes bactericidas y nutrientes durante un mínimo de 4 horas en zona fresca.
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#38bdf8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>3</span>
                <strong>Choque de Frío (Cuarto Frío)</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Trasladar los tallos hidratados al cuarto frío a una temperatura estable de **2°C a 4°C** con una humedad relativa del **90% al 95%**.
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#38bdf8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>4</span>
                <strong>Clasificación y Empaque</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Revisar tallos individualmente. Descartar espigas deformes o con presencia de insectos. Armar los ramos comerciales de exportación según requerimientos del cliente.
                </p>
              </div>
            </div>
          </article>

          {/* Export quality standards checklist */}
          <article className="card suppliers-block">
            <h2>Estándares de Calidad de Exportación</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.3rem', marginBottom: '1rem' }}>
              Verifica los parámetros exigidos por aduana e inspectores comerciales en aeropuertos.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Tallo recto y rígido que soporte el peso de la espiga.',
                'Longitud mínima requerida del tallo de 60 a 80 cm.',
                'Color de flor uniforme, intenso y característico de la variedad.',
                'Ausencia total de manchas foliares, clorosis o quemaduras.',
                'Follaje y flores libres de insectos vivos o rastros de plaga (trips/pulgones).',
                'Espiga compacta, sin flores marchitas o podridas por exceso de humedad.',
                'Corte higiénico basal libre de pudriciones o bacterias.'
              ].map((std, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.02)',
                    background: 'rgba(255,255,255,0.01)'
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{std}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.2rem',
              padding: '0.8rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              fontSize: '0.8rem',
              color: '#34d399'
            }}>
              <strong>Meta esperada:</strong> Con un buen manejo fitosanitario y nutricional, tu finca debería obtener entre un **90% y 95%** de plantas comerciales listas para la exportación.
            </div>
          </article>
        </div>
      )}

      {/* Common errors and alerts banner */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'rgba(239, 68, 68, 0.04)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        borderRadius: '12px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
        <AlertTriangle size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#f87171', fontWeight: 800 }}>Alertas de Control y Errores más Comunes a Evitar</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.6rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <div>• **Exceso de Riego:** Pythium y pudriciones de raíz colapsan el cultivo. Mantén buen drenaje.</div>
            <div>• **Falta de Luz Post-germinación:** Genera tallos largos pero débiles y espigas florales pequeñas.</div>
            <div>• **Sembrar Fuera de Fecha:** El alhelí no esperará. Si siembras tarde, perderás la cotización de San Valentín.</div>
            <div>• **Exceso de Nitrógeno:** Produce un desarrollo vegetativo exagerado en desmedro de la firmeza y calidad del tallo.</div>
            <div>• **Retardo en tutorar:** Tallos doblados que no calificarán para exportación. Coloca mallas temprano.</div>
            <div>• **No monitorear trips:** Los trips arruinan el botón floral antes de abrir. Controla desde el día 1.</div>
          </div>
        </div>
      </div>
      
    </main>
  );
}
