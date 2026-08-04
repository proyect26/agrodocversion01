import React, { useState, useEffect } from 'react';
import { Mail, X, Send, CheckCircle, AlertCircle, Loader, Settings } from 'lucide-react';

const SMTP_KEY = 'smtp_config_v1';

const defaultSmtp = {
  host: 'smtp.gmail.com',
  port: '587',
  user: '',
  pass: '',
  fromName: "ANGEL'S BLOOMS",
  secure: false,
};

function loadSmtp() {
  try {
    const saved = JSON.parse(localStorage.getItem(SMTP_KEY) || '{}');
    return { ...defaultSmtp, ...saved };
  } catch {
    return defaultSmtp;
  }
}

/**
 * Modal de envío de correo.
 * Props:
 *   isOpen: bool
 *   onClose: fn
 *   subject: string  (pre-rellenado)
 *   bodyHtml: string (pre-rellenado, HTML)
 *   docLabel: string (descripción del documento, ej: "Factura 001-002-557")
 */
export default function EmailModal({ isOpen, onClose, subject = '', bodyHtml = '', docLabel = 'Documento' }) {
  const [smtp, setSmtp] = useState(loadSmtp);
  const [form, setForm] = useState({
    to: '',
    cc: '',
    subject: subject,
    body: bodyHtml || `<p>Adjunto encontrará el documento <strong>${docLabel}</strong> generado por el sistema AgroDocs.</p><p>Saludos cordiales.</p>`,
  });
  const [showSmtp, setShowSmtp] = useState(false);
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  // Re-sincronizar subject/body cuando cambian las props
  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({
        ...prev,
        subject: subject,
        body: bodyHtml || `<p>Adjunto encontrará el documento <strong>${docLabel}</strong> generado por el sistema AgroDocs.</p><p>Saludos cordiales.</p>`,
      }));
      setStatus(null);
      setStatusMsg('');
    }
  }, [isOpen, subject, bodyHtml, docLabel]);

  if (!isOpen) return null;

  const handleSmtpChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...smtp, [name]: type === 'checkbox' ? checked : value };
    setSmtp(updated);
    localStorage.setItem(SMTP_KEY, JSON.stringify(updated));
  };

  const handleVerify = async () => {
    if (!smtp.host || !smtp.user || !smtp.pass) {
      setStatus('error');
      setStatusMsg('Completa los datos SMTP antes de verificar.');
      return;
    }
    setStatus('sending');
    setStatusMsg('Verificando conexión SMTP…');

    if (window.desktop?.verifySmtp) {
      const result = await window.desktop.verifySmtp(smtp);
      if (result.success) {
        setStatus('success');
        setStatusMsg('✓ Conexión SMTP verificada correctamente.');
      } else {
        setStatus('error');
        setStatusMsg(`Error SMTP: ${result.error}`);
      }
    } else {
      setStatus('error');
      setStatusMsg('Solo disponible en la app de escritorio (Electron).');
    }
  };

  const handleSend = async () => {
    if (!form.to) {
      setStatus('error');
      setStatusMsg('El campo "Para" es obligatorio.');
      return;
    }
    if (!smtp.host || !smtp.user || !smtp.pass) {
      setStatus('error');
      setStatusMsg('Configura el servidor SMTP primero (sección Configurar SMTP).');
      setShowSmtp(true);
      return;
    }

    setStatus('sending');
    setStatusMsg('Enviando correo…');

    const emailData = {
      to: form.to,
      cc: form.cc || undefined,
      subject: form.subject,
      body: form.body,
    };

    if (window.desktop?.sendEmail) {
      const result = await window.desktop.sendEmail(smtp, emailData);
      if (result.success) {
        setStatus('success');
        setStatusMsg(`✓ Correo enviado exitosamente a ${form.to}`);
      } else {
        setStatus('error');
        setStatusMsg(`Error al enviar: ${result.error}`);
      }
    } else {
      // Fallback para modo web (desarrollo)
      setStatus('error');
      setStatusMsg('El envío de correo solo está disponible en la app de escritorio.');
    }
  };

  return (
    <div className="email-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="email-modal">

        {/* Header */}
        <div className="email-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, hsl(155,55%,36%), hsl(160,55%,28%))', borderRadius: '8px', padding: '0.45rem', display: 'flex' }}>
              <Mail size={18} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'hsl(145,50%,20%)' }}>
                Enviar por Correo
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{docLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '0.35rem', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="email-modal-body">

          {/* Para + CC */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="email-field">
              <label>Para *</label>
              <input
                type="email"
                placeholder="cliente@empresa.com"
                value={form.to}
                onChange={(e) => setForm(p => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div className="email-field">
              <label>CC (opcional)</label>
              <input
                type="email"
                placeholder="copia@empresa.com"
                value={form.cc}
                onChange={(e) => setForm(p => ({ ...p, cc: e.target.value }))}
              />
            </div>
          </div>

          {/* Asunto */}
          <div className="email-field">
            <label>Asunto</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
            />
          </div>

          {/* Cuerpo */}
          <div className="email-field">
            <label>Mensaje</label>
            <textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Cuerpo del correo (admite HTML básico)"
            />
          </div>

          {/* Status message */}
          {status === 'success' && (
            <div className="email-status-success">
              <CheckCircle size={16} /> {statusMsg}
            </div>
          )}
          {status === 'error' && (
            <div className="email-status-error">
              <AlertCircle size={16} /> {statusMsg}
            </div>
          )}
          {status === 'sending' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(155,55%,32%)', fontSize: '0.88rem' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              {statusMsg}
            </div>
          )}

          {/* SMTP Toggle */}
          <div>
            <button
              onClick={() => setShowSmtp(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: showSmtp ? 'hsl(145,30%,95%)' : 'transparent',
                border: '1px solid hsl(145,25%,85%)',
                borderRadius: '8px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'hsl(155,40%,35%)',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Settings size={14} />
              {showSmtp ? 'Ocultar configuración SMTP' : 'Configurar SMTP'}
            </button>

            {showSmtp && (
              <div style={{
                marginTop: '0.75rem',
                padding: '1rem',
                background: 'hsl(145,20%,97%)',
                borderRadius: '10px',
                border: '1px solid hsl(145,20%,88%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Configuración del servidor SMTP (guardada localmente)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                  <div className="email-field">
                    <label>Servidor SMTP</label>
                    <input name="host" value={smtp.host} onChange={handleSmtpChange} placeholder="smtp.gmail.com" />
                  </div>
                  <div className="email-field">
                    <label>Puerto</label>
                    <input name="port" value={smtp.port} onChange={handleSmtpChange} placeholder="587" style={{ width: '80px' }} />
                  </div>
                </div>
                <div className="email-field">
                  <label>Usuario (email)</label>
                  <input name="user" type="email" value={smtp.user} onChange={handleSmtpChange} placeholder="tuemail@gmail.com" />
                </div>
                <div className="email-field">
                  <label>Contraseña / App Password</label>
                  <input name="pass" type="password" value={smtp.pass} onChange={handleSmtpChange} placeholder="••••••••••••" />
                </div>
                <div className="email-field">
                  <label>Nombre del remitente</label>
                  <input name="fromName" value={smtp.fromName} onChange={handleSmtpChange} placeholder="ANGEL'S BLOOMS" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-on-glass)' }}>
                  <input type="checkbox" name="secure" checked={!!smtp.secure} onChange={handleSmtpChange} />
                  Usar SSL/TLS (puerto 465)
                </label>
                <button
                  onClick={handleVerify}
                  style={{
                    padding: '0.5rem', fontSize: '0.82rem', fontWeight: 600,
                    background: 'hsl(155,50%,90%)', color: 'hsl(155,55%,25%)',
                    border: '1px solid hsl(155,40%,75%)', borderRadius: '8px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  Verificar conexión SMTP
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="email-modal-footer">
          <button className="btn btn-outline" onClick={onClose} style={{ fontSize: '0.875rem' }}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={status === 'sending'}
            style={{
              fontSize: '0.875rem',
              padding: '0.6rem 1.4rem',
              opacity: status === 'sending' ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {status === 'sending' ? (
              <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Enviando…</>
            ) : (
              <><Send size={15} /> Enviar Correo</>
            )}
          </button>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
