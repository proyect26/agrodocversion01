import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Building,
  User,
  Sparkles,
  CheckCircle2,
  Tag,
  BrainCircuit,
  Sprout,
  Truck,
  ArrowRight,
  ShieldCheck,
  Bot,
  LogIn,
  UserPlus
} from 'lucide-react';

const USERS_KEY = 'agrodocs_users_v1';
const CURRENT_USER_KEY = 'agrodocs_current_user_v1';

// Pre-seeded default users
const ANGELS_USER = {
  id: 'usr_angels_01',
  email: 'aloelian84@gmail.com',
  password: '654321',
  companyName: 'Angel\'s Blooms Florícola',
  fullName: 'Angel\'s Blooms Admin'
};

const DEMO_USER = {
  id: 'usr_demo_101',
  email: 'demo@agrodocs.com',
  password: '123456',
  companyName: 'Angel\'s Blooms Florícola',
  fullName: 'Administrador Demo'
};

function getUsersDB() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify([ANGELS_USER, DEMO_USER]));
      return [ANGELS_USER, DEMO_USER];
    }
    // Ensure ANGELS_USER and DEMO_USER exist in the database if not present
    let updated = [...parsed];
    if (!updated.some(u => u.email.toLowerCase() === ANGELS_USER.email.toLowerCase())) {
      updated.push(ANGELS_USER);
    } else {
      // Update password for ANGELS_USER if requested
      updated = updated.map(u => u.email.toLowerCase() === ANGELS_USER.email.toLowerCase() ? { ...u, password: '654321' } : u);
    }
    if (!updated.some(u => u.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
      updated.push(DEMO_USER);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify([ANGELS_USER, DEMO_USER]));
    return [ANGELS_USER, DEMO_USER];
  }
}

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regCompany, setRegCompany] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const emailTrim = loginEmail.trim().toLowerCase();
    const passwordTrim = loginPassword.trim();

    if (!emailTrim || !passwordTrim) {
      setErrorMessage('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    const users = getUsersDB();
    const userFound = users.find(
      (u) => u.email.toLowerCase() === emailTrim && u.password === passwordTrim
    );

    if (!userFound) {
      setErrorMessage('Credenciales incorrectas. Verifique su correo o contraseña.');
      return;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userFound));
    setSuccessMessage(`¡Bienvenido de nuevo, ${userFound.fullName || userFound.companyName}!`);
    setTimeout(() => {
      onLoginSuccess(userFound);
    }, 600);
  };

  const handleAngelsLogin = () => {
    setErrorMessage('');
    setSuccessMessage('');
    const users = getUsersDB();
    let user = users.find((u) => u.email.toLowerCase() === ANGELS_USER.email.toLowerCase());
    if (!user) {
      user = ANGELS_USER;
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setSuccessMessage('¡Ingresando con la cuenta de Angel\'s Blooms!');
    setTimeout(() => {
      onLoginSuccess(user);
    }, 500);
  };

  const handleDemoLogin = () => {
    setErrorMessage('');
    setSuccessMessage('');
    const users = getUsersDB();
    let demo = users.find((u) => u.email === DEMO_USER.email);
    if (!demo) {
      demo = DEMO_USER;
      users.push(demo);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demo));
    setSuccessMessage('¡Ingresando con cuenta Demo!');
    setTimeout(() => {
      onLoginSuccess(demo);
    }, 500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const companyTrim = regCompany.trim();
    const nameTrim = regFullName.trim();
    const emailTrim = regEmail.trim().toLowerCase();
    const passwordTrim = regPassword.trim();

    if (!companyTrim || !nameTrim || !emailTrim || !passwordTrim) {
      setErrorMessage('Todos los campos son obligatorios para completar el registro.');
      return;
    }

    if (passwordTrim.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (passwordTrim !== regConfirmPassword.trim()) {
      setErrorMessage('Las contraseñas no coinciden. Verifique ambas claves.');
      return;
    }

    const users = getUsersDB();
    const existing = users.find((u) => u.email.toLowerCase() === emailTrim);
    if (existing) {
      setErrorMessage('Este correo ya se encuentra registrado. Inicie sesión directamente.');
      return;
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: emailTrim,
      password: passwordTrim,
      companyName: companyTrim,
      fullName: nameTrim,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    setSuccessMessage(`¡Cuenta creada con éxito para ${companyTrim}! Ingresando al panel...`);
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          background: 'rgba(10, 16, 30, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
        }}
      >
        {/* Left Side: System Information & Features */}
        <div
          style={{
            padding: '2.5rem',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.15))',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img
                src="./logo_agro.png"
                alt="AgroDocs Logo"
                style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: '#38bdf8',
                    letterSpacing: '0.04em'
                  }}
                >
                  AgroDocs
                </h1>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#c084fc',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  Plataforma Florícola & Exportación
                </span>
              </div>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Sistema integral de gestión de etiquetas de exportación con código de barras, facturación comercial, analítica de variedades y asesoramiento agronómico con IA.
            </p>

            {/* Feature Highlights List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <Tag size={18} color="#38bdf8" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.92rem', fontWeight: 700 }}>
                    Emisión de Etiquetas & Facturas
                  </h4>
                  <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    Genera facturas comerciales y etiquetas de empaque HB/QB con códigos de barra listos para imprimir.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                  <BrainCircuit size={18} color="#ec4899" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.92rem', fontWeight: 700 }}>
                    Analítica de Variedades de Flor
                  </h4>
                  <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    Mide el rendimiento de Pink Floyd, Orange, Yellow, White, Red y descubre tus mejores clientes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <Bot size={18} color="#c084fc" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.92rem', fontWeight: 700 }}>
                    Asistente de Cultivo con IA
                  </h4>
                  <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    Consulta automática sobre siembra, cosecha para San Valentín / Día de la Madre, cuarto frío y plagas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <ShieldCheck size={20} color="#34d399" />
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              Gestión segura con almacenamiento de datos independiente por usuario.
            </span>
          </div>
        </div>

        {/* Right Side: Login & Registration Form */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tab Controls */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.3rem',
              borderRadius: '14px',
              border: '1px solid var(--glass-border)',
              marginBottom: '1.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: !isRegistering ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: !isRegistering ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: !isRegistering ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <LogIn size={16} />
              Iniciar Sesión
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: isRegistering ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: isRegistering ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isRegistering ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <UserPlus size={16} />
              Registrarse
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                fontWeight: 600
              }}
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                color: '#34d399',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                fontWeight: 600
              }}
            >
              {successMessage}
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@floricola.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(14, 165, 233, 0.9))',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Ingresar al Dashboard
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', margin: '0.4rem 0', position: 'relative' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(10, 16, 30, 0.8)', padding: '0 0.5rem' }}>
                  o accede directamente con:
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleAngelsLogin}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={15} />
                  Angel's Blooms
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={15} />
                  Cuenta Demo
                </button>
              </div>

              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ fontWeight: 700, color: '#38bdf8' }}>🔑 Credenciales de Acceso:</div>
                <div>• <strong>Angel's Blooms</strong>: aloelian84@gmail.com / <code>654321</code></div>
                <div>• <strong>Demo</strong>: demo@agrodocs.com / <code>123456</code></div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Nombre de la Florícola / Empresa
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="Ej. RosaBella Export S.A."
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Nombre Completo del Usuario
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ej. Ing. Carlos Mendoza"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@floricola.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Confirmar Clave
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border-strong)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(56, 189, 248, 0.9))',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Crear Cuenta e Ingresar
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
