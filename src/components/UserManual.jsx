import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Tag,
  Truck,
  HandCoins,
  Users,
  BrainCircuit,
  Sprout,
  Bot,
  Settings,
  Layers,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Printer,
  ShieldCheck,
  Thermometer,
  Flower2
} from 'lucide-react';

export default function UserManual() {
  const [activeCategory, setActiveCategory] = useState('introduccion');
  const [searchTerm, setSearchTerm] = useState('');

  const MANUAL_SECTIONS = [
    {
      id: 'acceso',
      title: '0. Registro e Inicio de Sesión',
      icon: <ShieldCheck size={20} color="#34d399" />,
      badge: 'Seguridad',
      description: 'Creación de cuenta de florícola e inicio de sesión para ingresar a su dashboard privado.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <strong>AgroDocs</strong> cuenta con una pantalla de acceso que protege los documentos y registros comerciales de cada usuario o empresa florícola:
          </p>

          <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li><strong>Iniciar Sesión</strong>: Ingrese con su correo registrado y contraseña para acceder a su dashboard.
              <ul style={{ marginTop: '0.3rem', fontSize: '0.88rem', color: '#38bdf8' }}>
                <li><strong>Cuenta Angel's Blooms</strong>: <code>aloelian84@gmail.com</code> / Clave: <code>654321</code></li>
                <li><strong>Cuenta Demo</strong>: <code>demo@agrodocs.com</code> / Clave: <code>123456</code></li>
              </ul>
            </li>
            <li><strong>Registrarse</strong>: Seleccione la pestaña <em>Registrarse</em> e ingrese el Nombre de la Florícola/Empresa, Nombre Completo, Correo y Contraseña. Al completar el registro, el sistema guardará su usuario e iniciará sesión automáticamente.</li>
            <li><strong>Cerrar Sesión</strong>: En la esquina superior derecha del panel encontrará el botón <strong>Salir</strong> para cerrar su sesión de forma segura cuando finalice sus tareas.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'introduccion',
      title: '1. Introducción y Vista General',
      icon: <BookOpen size={20} color="#38bdf8" />,
      badge: 'Inicio',
      description: 'Bienvenido a AgroDocs: Plataforma Integral de Gestión de Etiquetas, Facturación y Agronomía.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <strong>AgroDocs</strong> es un sistema diseñado para exportadores y productores florícolas (Alhelí, Rosas y Flores Verdes). Combina la generación automatizada de etiquetas de exportación, facturas comerciales, hojas de ruta logística, registro de cuentas por cobrar y herramientas agronómicas de decisión impulsadas por IA.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px' }}>
              <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <Tag size={16} /> Impresión de Etiquetas
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Formatos estandarizados de etiqueta comercial con códigos de barra, variedad, cajas y datos del consignatario.
              </span>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '14px' }}>
              <strong style={{ color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <BrainCircuit size={16} /> Nodo de Decisiones
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Análisis en vivo de ventas por variedades (Pink Floyd, Orange, Yellow, White, Red, etc.) y ranking de clientes.
              </span>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px' }}>
              <strong style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <Bot size={16} /> Asistente IA Integrado
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Responde preguntas agronómicas de siembra, cosecha, cuarto frío y proyecciones de cobro comercial.
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'emision',
      title: '2. Emisión de Facturas y Etiquetas',
      icon: <FileText size={20} color="#34d399" />,
      badge: 'Módulo Principal',
      description: 'Cómo generar una factura comercial y emitir etiquetas de cajas automáticamente.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: '#ffffff', fontSize: '1.05rem', margin: 0 }}>Pasos para crear un nuevo pedido:</h4>
          <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li>Diríjase a la pestaña <strong>Emisión</strong> en la barra superior.</li>
            <li>Complete los datos del cliente (RUC/TAX ID, Consignatario, País de Destino, Agencia de Carga).</li>
            <li>Agregue los ítems de flor: Seleccione la <strong>Variedad/Color</strong> (ej. <em>Pink Floyd, Orange, Yellow, White, Red</em>), tipo de empaque (HB, QB, EB), número de cajas y precio unitario.</li>
            <li>Haga clic en <strong>Guardar e Imprimir Documento</strong>. El sistema registrará la factura en el historial y preparará las etiquetas asociadas.</li>
          </ol>

          <div style={{ padding: '0.85rem 1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px' }}>
            <strong style={{ color: '#34d399', fontSize: '0.88rem' }}>💡 Tip de Autocompletado:</strong> Los campos cliente y variedad utilizan inteligencia de guardado local. Al escribir las primeras letras, sugerirá valores utilizados anteriormente.
          </div>
        </div>
      )
    },
    {
      id: 'lotes',
      title: '3. Impresión y Lotes de Etiquetas',
      icon: <Printer size={20} color="#facc15" />,
      badge: 'Etiquetas',
      description: 'Visualización de etiquetas con código de barras y formato térmico.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            En la sección <strong>Lotes & Impresión</strong> se despliegan las etiquetas listas para ser pegadas en las cajas de exportación.
          </p>

          <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li><strong>Código de Barras</strong>: Generado automáticamente según el correlativo del pedido y lote.</li>
            <li><strong>Datos Visibles</strong>: Nombre de la Florícola, Cliente Consignatario, Marca, Variedad/Color, Tipo de Caja (HB / QB) y Número de Talles.</li>
            <li><strong>Vista Previa y Tamaño</strong>: Puede ajustar la escala de impresión o márgenes desde el panel de <em>Configuraciones</em>.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'logistica',
      title: '4. Hojas de Ruta y Resumen',
      icon: <Truck size={20} color="#fb923c" />,
      badge: 'Logística',
      description: 'Generación de guía de despacho para choferes y consolidado de carga.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            Para el despacho en camión hacia el cuarto frío del aeropuerto o consolidador:
          </p>

          <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li>Seleccione la pestaña <strong>Hoja de Ruta</strong>.</li>
            <li>Imprima la hoja de despacho con el desglose de chofer, placa del vehículo, agencia de carga y totales de cajas HB/QB por cliente.</li>
            <li>Revise la pestaña <strong>Resumen General</strong> para ver el acumulado del día o del mes.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'decisiones',
      title: '5. Nodo de Decisiones Inteligente',
      icon: <BrainCircuit size={20} color="#ec4899" />,
      badge: 'Analítica Comercial',
      description: 'Monitoreo de variedades vendidas, ranking de clientes y cobranza.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            El <strong>Nodo de Decisiones</strong> organiza la información estratégica de tu empresa en 4 pestañas clave:
          </p>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
              <strong style={{ color: '#ec4899' }}>🌸 Variedades & Colores:</strong> Muestra la flor vendida (Pink Floyd, Orange, Yellow, White, Lavender, Red, Bicolor, etc.), el total de cajas, participación porcentual (%) y el mayor comprador de cada variedad.
            </div>
            <div style={{ padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
              <strong style={{ color: '#38bdf8' }}>📊 Vista General:</strong> Gráficos comparativos de ventas acumuladas en dólares ($) y ranking por volumen de cajas.
            </div>
            <div style={{ padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
              <strong style={{ color: '#34d399' }}>👥 Clientes & Compras:</strong> Matriz detallada de variedades compradas por cada cliente y montos en cartera.
            </div>
            <div style={{ padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
              <strong style={{ color: '#c084fc' }}>🤖 Asistente IA Integrado:</strong> Módulo de consultas rápidas para responder dudas sobre variedades o pagos.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cultivo',
      title: '6. Guía Agronómica de Cultivo',
      icon: <Sprout size={20} color="#a7f3d0" />,
      badge: 'Agronomía',
      description: 'Tiempos de siembra, cosecha, plagas y manejo de poscosecha.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            En la sección <strong>Cultivo</strong> dispones de la enciclopedia técnica para la producción de Alhelí (Matthiola incana) y floricultura:
          </p>

          <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li><strong>Calendario Cosecha</strong>: Fechas de siembra proyectadas para San Valentín (14 Feb), Día de la Madre (Mayo), Día de la Mujer (8 Mar) y Navidad.</li>
            <li><strong>Manejo de Poscosecha y Cuarto Frío</strong>: Temperatura recomendada (2°C a 4°C), humedad relativa (90-95%) y apertura adecuada del botón floral (30%-50%).</li>
            <li><strong>Control Fitosanitario</strong>: Diagnóstico y prevención de Botrytis, Trips, Mildiu y Fusarium.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'asistente-ia',
      title: '7. Asistente IA (Cultivo + Comercio)',
      icon: <Bot size={20} color="#c084fc" />,
      badge: 'Inteligencia Artificial',
      description: 'Consultas automáticas combinando agrononomía con ventas reales.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            Ubicado en la barra superior junto a <em>Cultivo</em> y en <em>Decisiones</em>, el <strong>Asistente IA</strong> analiza en tiempo real las facturas de la base de datos y la guía técnica de cultivo.
          </p>

          <div style={{ padding: '0.9rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px' }}>
            <strong style={{ color: '#c084fc', display: 'block', marginBottom: '0.4rem' }}>Ejemplos de preguntas predefinidas que puedes hacer:</strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              <li>🌸 "¿Qué variedades vendemos y cuál lidera?"</li>
              <li>🌾 "Fechas de siembra y cosecha para San Valentín"</li>
              <li>🌡️ "¿Temperatura y humedad ideal para el cultivo?"</li>
              <li>🛡️ "¿Cómo prevenimos Botrytis y Trips?"</li>
              <li>❄️ "¿Condiciones de poscosecha y cuarto frío?"</li>
              <li>🏆 "¿Cuál es nuestro cliente principal?"</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'pagos-clientes',
      title: '8. Registro de Pagos, Clientes y Proveedores',
      icon: <HandCoins size={20} color="#38bdf8" />,
      badge: 'Finanzas',
      description: 'Cobranzas a clientes y seguimiento de facturas pendientes.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
            Administra tus cuentas por cobrar y servicios adicionales:
          </p>

          <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <li><strong>Registro Pagos</strong>: Marque las facturas cobradas ("Pagado") o manténgalas en estado "Pendiente". El saldo afectará directamente los reportes del Nodo de Decisiones.</li>
            <li><strong>Gestión Clientes</strong>: Base de datos de clientes, teléfonos, emails y contactos de exportación.</li>
            <li><strong>Proveedores</strong>: Registro de agencias de carga, proveedores de cartón, plásticos y químicos.</li>
          </ol>
        </div>
      )
    }
  ];

  const filteredSections = MANUAL_SECTIONS.filter((sec) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sec.title.toLowerCase().includes(term) ||
      sec.description.toLowerCase().includes(term) ||
      sec.badge.toLowerCase().includes(term)
    );
  });

  const selectedSection = MANUAL_SECTIONS.find((s) => s.id === activeCategory) || MANUAL_SECTIONS[0];

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
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(52, 211, 153, 0.25))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen color="#38bdf8" size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Manual de Usuario AgroDocs
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: 'rgba(52, 211, 153, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  fontWeight: 700
                }}
              >
                GUÍA OFICIAL V2.5
              </span>
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Documentación y guía de uso paso a paso de todos los módulos del sistema.
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar en el manual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Grid: Navigation List + Section Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(400px, 2fr)', gap: '1.25rem' }}>
        {/* Navigation Column */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', uppercase: true, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            Módulos de la Aplicación
          </span>

          {filteredSections.map((sec) => {
            const isSelected = sec.id === activeCategory;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveCategory(sec.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
                  background: isSelected ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(14, 165, 233, 0.1))' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {sec.icon}
                  <span>{sec.title}</span>
                </div>
                <ChevronRight size={14} opacity={isSelected ? 1 : 0.4} />
              </button>
            );
          })}
        </div>

        {/* Content Viewer Column */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border-strong)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: 'var(--glass-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.85rem' }}>
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '0.4rem'
                }}
              >
                {selectedSection.badge}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#ffffff', fontWeight: 800 }}>{selectedSection.title}</h2>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedSection.description}</p>
            </div>
          </div>

          <div style={{ minHeight: '300px' }}>
            {selectedSection.content}
          </div>
        </div>
      </div>
    </main>
  );
}
