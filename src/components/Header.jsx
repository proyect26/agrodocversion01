import React from 'react';
import { FileText, Truck, HandCoins, Settings, Pencil, Users, Sprout, BrainCircuit, Bot, BookOpen, LogOut } from 'lucide-react';

export default function Header({ activeTab, onTabChange, currentUser, onLogout }) {
  const initial = currentUser?.fullName
    ? currentUser.fullName.charAt(0).toUpperCase()
    : currentUser?.companyName
    ? currentUser.companyName.charAt(0).toUpperCase()
    : 'A';

  const companyName = currentUser?.companyName || "Angel's Blooms";

  return (
    <>
      <div style={{
        backgroundColor: 'rgba(10, 16, 30, 0.55)',
        backdropFilter: 'blur(12px)',
        color: 'rgba(186, 230, 253, 0.75)',
        padding: '0.2rem 1rem',
        fontSize: '0.62rem',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        Digital Assets · {companyName}
      </div>
      <header className="top-nav">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-black" style={{ fontSize: '1.35rem', color: 'hsl(199, 90%, 68%)', letterSpacing: '0.07em', fontWeight: 900 }}>
            <img 
              src="./logo_agro.png" 
              alt="AgroDocs" 
              style={{ height: '46px', width: 'auto', objectFit: 'contain' }} 
            />
            AgroDocs
          </div>
        </div>

        <nav className="nav-links">
          {[
            { id: 'editor', label: 'Editor', icon: <Pencil size={13} /> },
            { id: 'documents', label: 'Documentos', icon: <FileText size={13} /> },
            { id: 'suppliers', label: 'Control Proveedores', icon: <Truck size={13} /> },
            { id: 'payments', label: 'Pagos', icon: <HandCoins size={13} /> },
            { id: 'customers', label: 'Gestión Clientes', icon: <Users size={13} /> },
            { id: 'decisions', label: 'Decisiones', icon: <BrainCircuit size={13} /> },
            { id: 'cultivo', label: 'Cultivo', icon: <Sprout size={13} /> },
            { id: 'ai-assistant', label: 'Asistente IA', icon: <Bot size={13} /> },
            { id: 'manual', label: 'Manual', icon: <BookOpen size={13} /> },
            { id: 'settings', label: 'Configuraciones', icon: <Settings size={13} /> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(199,85%,50%), hsl(340,90%,55%))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '0.85rem',
              boxShadow: '0 2px 12px rgba(14,165,233,0.45)',
            }}>
              {initial}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                {currentUser?.fullName || 'Usuario'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                {companyName}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </header>
    </>
  );
}

