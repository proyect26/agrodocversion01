import React from 'react';
import { FileText, Truck, HandCoins, Settings, Pencil, Users, Sprout, BrainCircuit, Bot } from 'lucide-react';

export default function Header({ activeTab, onTabChange }) {
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
        Digital Assets · Angel's Blooms
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

        <div className="flex items-center gap-4">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(199,85%,50%), hsl(340,90%,55%))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '0.9rem',
            boxShadow: '0 2px 12px rgba(14,165,233,0.45)',
          }}>
            E
          </div>
        </div>
      </header>
    </>
  );
}
