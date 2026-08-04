import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronDown, Pin } from 'lucide-react';

export default function SmartField({ name, label, value, onChange }) {
  const [savedValues, setSavedValues] = useState([]);
  const [defaultValue, setDefaultValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const storageKey = `smart_field_${name}`;
  const defaultKey = `smart_field_default_${name}`;

  // Cargar valores guardados del localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setSavedValues(stored);
      const storedDefault = localStorage.getItem(defaultKey) || '';
      setDefaultValue(storedDefault);
    } catch {
      setSavedValues([]);
      setDefaultValue('');
    }
  }, [storageKey, defaultKey]);

  useEffect(() => {
    if (!value && defaultValue) {
      onChange({ target: { name, value: defaultValue } });
    }
  }, [value, defaultValue, onChange, name]);

  const persist = (values) => {
    localStorage.setItem(storageKey, JSON.stringify(values));
    setSavedValues(values);
  };

  // Agregar valor actual a la lista
  const handleAdd = (e) => {
    e.stopPropagation();
    const trimmed = (value || '').trim();
    if (!trimmed || savedValues.includes(trimmed)) return;
    persist([trimmed, ...savedValues]);
  };

  // Quitar un valor de la lista
  const handleRemove = (e, val) => {
    e.stopPropagation();
    persist(savedValues.filter(v => v !== val));
  };

  // Seleccionar un valor del dropdown
  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  const handleSetDefault = (e) => {
    e.stopPropagation();
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    localStorage.setItem(defaultKey, trimmed);
    setDefaultValue(trimmed);
  };

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alreadySaved = savedValues.includes((value || '').trim());

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Label */}
      <label style={{
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        marginBottom: '0.2rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>

      {/* Input + botones al lado derecho */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'stretch' }}>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          style={{
            flex: 1,
            padding: '0.45rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => { setIsOpen(true); e.target.style.borderColor = 'rgba(56, 189, 248, 0.6)'; e.target.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.35)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
        />

        {/* Botón + (guardar) */}
        <button
          onClick={handleAdd}
          title={alreadySaved ? 'Ya guardado' : 'Guardar en lista'}
          style={{
            padding: '0 0.45rem',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            background: alreadySaved ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: alreadySaved ? '#34d399' : 'var(--text-secondary)',
            cursor: alreadySaved ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          <Plus size={13} />
        </button>

        {/* Botón ∨ (desplegar lista) — solo si hay guardados */}
        {savedValues.length > 0 && (
          <button
            onClick={() => setIsOpen(o => !o)}
            title={`${savedValues.length} valor(es) guardado(s)`}
            style={{
              padding: '0 0.4.rem',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              background: isOpen ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
              color: isOpen ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        )}

        {/* Botón pin (predeterminado) */}
        <button
          onClick={handleSetDefault}
          title="Guardar como predeterminado"
          style={{
            padding: '0 0.4rem',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            background: defaultValue && (value || '').trim() === defaultValue ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            color: defaultValue && (value || '').trim() === defaultValue ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s'
          }}
        >
          <Pin size={12} />
        </button>
      </div>

      {/* Dropdown con valores guardados */}
      {isOpen && savedValues.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border-strong)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            Valores guardados ({savedValues.length})
          </div>
          {savedValues.map((val) => (
            <div
              key={val}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderBottom: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'background 0.1s',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                background: 'transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span
                onClick={() => handleSelect(val)}
                style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {val}
              </span>
              <button
                onClick={(e) => handleRemove(e, val)}
                title="Quitar de la lista"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  padding: '0.1rem 0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0.5rem',
                  flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
