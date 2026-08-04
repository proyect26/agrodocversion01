import React from 'react';
import { Printer, CheckCircle, Smartphone } from 'lucide-react';

export default function PrintSettings() {
  return (
    <div className="settings-section">
      <div className="settings-group">
        <span className="settings-group-header">CONNECTED DEVICE</span>
        <div className="flex justify-between items-center" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div className="flex gap-3 items-center">
            <div style={{ background: '#f4f5ff', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Printer color="var(--primary)" size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Zebra ZT411</div>
              <div className="flex gap-1 items-center" style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                 <CheckCircle size={12} /> Online • 203 DPI
              </div>
            </div>
          </div>
          <button className="icon-button">
             &gt;
          </button>
        </div>
      </div>

      <div className="settings-group">
        <span className="settings-group-header">CONFIGURATION</span>
        <div className="flex gap-4">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>COPIES</label>
            <div className="input-number-group">
              <button>-</button>
              <input type="number" defaultValue="100" />
              <button>+</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ORIENTATION</label>
            <div className="flex">
              <button className="btn btn-outline" style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, background: '#f4f5ff', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <Smartphone size={18} />
              </button>
              <button className="btn btn-outline" style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}>
                <Smartphone size={18} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <span className="settings-group-header">PRINT QUALITY</span>
        <div className="flex flex-col gap-2">
          <div className="radio-card selected">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Standard Technical</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimized for scanning readability</div>
            </div>
            <div className="radio-indicator">
            </div>
          </div>
          <div className="radio-card">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Eco Draft</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reduced ink usage for internals</div>
            </div>
            <div className="radio-indicator">
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="settings-group" style={{ flex: 1 }}>
          <span className="settings-group-header">EST. DURATION</span>
          <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>1m 12s</div>
        </div>
        <div className="settings-group" style={{ flex: 1 }}>
          <span className="settings-group-header">MEDIA SIZE</span>
          <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>4 x 6 IN</div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.125rem', display: 'flex', gap: '0.5rem', boxShadow: '0 10px 25px -5px rgba(45,43,158,0.4)', borderRadius: 'var(--radius-lg)' }}>
        <Printer size={20} />
        Print Now
      </button>

      <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', padding: '0 1rem' }}>
        By clicking Print Now, your document will be sent directly to the selected queue. Standard thermal formatting will be applied.
      </p>
    </div>
  );
}
