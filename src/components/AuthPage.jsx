import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from './LandingPage';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

function getErrorMessage(error) {
  const code = error?.code || '';
  return ERROR_MESSAGES[code] || error?.message || 'Something went wrong. Please try again.';
}

function GoldenEgg({ size = 64 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" style={{ filter: 'drop-shadow(0 4px 12px rgba(196,136,48,.35))' }}>
      <defs>
        <radialGradient id="authEggGold" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="40%" stopColor="#F0C850" />
          <stop offset="75%" stopColor="#C48830" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <radialGradient id="authEggShine" cx="35%" cy="28%" r="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="44" rx="26" ry="34" fill="url(#authEggGold)" stroke="#A67C20" strokeWidth="0.8" />
      <ellipse cx="28" cy="36" rx="14" ry="20" fill="url(#authEggShine)" />
      <ellipse cx="24" cy="30" rx="4" ry="7" fill="#fff" opacity="0.45" />
    </svg>
  );
}

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [screen, setScreen] = useState('landing'); // 'landing' | 'login'
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError('');
    setConfirmPassword('');
  }

  // ── LANDING PAGE (Robinhood-inspired, golden goose theme) ──
  if (screen === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => { setIsRegister(true); setScreen('login'); }}
        onLogin={() => { setIsRegister(false); setScreen('login'); }}
      />
    );
  }

  // ── LOGIN / REGISTER (Web: centered card) ──
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Quicksand', sans-serif", background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFDF5 40%, #FFFDF5 100%)' }}>
      <div style={{ width: 420, padding: '40px 36px', background: '#fff', borderRadius: 24, boxShadow: '0 8px 40px rgba(196,136,48,.12)', position: 'relative' }}>
        {/* Back to landing */}
        <button onClick={() => setScreen('landing')} style={{
          position: 'absolute', top: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8, border: '1px solid #F0E6D0',
          background: '#FFFDF5', fontSize: 13, fontWeight: 700, color: '#8A7040',
          cursor: 'pointer', fontFamily: "'Quicksand', sans-serif",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 8 }}>
          <div style={{ display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>
            <GoldenEgg size={56} />
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Instrument Serif', serif", background: 'linear-gradient(135deg, #C48830, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hatch</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#C8B898', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Smart Trading</p>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#333334', textAlign: 'center', marginBottom: 4, fontFamily: "'Instrument Serif', serif" }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{ fontSize: 15, color: '#8A7040', textAlign: 'center', marginBottom: 24, fontWeight: 600 }}>
          {isRegister ? 'Start hatching your golden portfolio' : 'Sign in to your nest'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{ width: '100%', padding: '12px 14px', fontSize: 16, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#FFFDF5', color: '#333334', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => e.target.style.borderColor = '#C48830'}
              onBlur={e => e.target.style.borderColor = '#C4883025'}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} required minLength={6}
              style={{ width: '100%', padding: '12px 14px', fontSize: 16, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#FFFDF5', color: '#333334', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => e.target.style.borderColor = '#C48830'}
              onBlur={e => e.target.style.borderColor = '#C4883025'}
            />
          </div>
          {isRegister && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>Confirm Password</label>
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} required minLength={6}
                style={{ width: '100%', padding: '12px 14px', fontSize: 16, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#FFFDF5', color: '#333334', boxSizing: 'border-box', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = '#C48830'}
                onBlur={e => e.target.style.borderColor = '#C4883025'}
              />
            </div>
          )}

          {error && <div style={{ fontSize: 14, fontWeight: 700, color: '#EF5350', background: '#FFEBEE', padding: '10px 14px', borderRadius: 10, textAlign: 'center' }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '13px 0', fontSize: 18, fontWeight: 900,
            fontFamily: "'Instrument Serif', serif", color: '#fff',
            background: submitting ? '#C4883088' : 'linear-gradient(135deg, #C48830, #8B6914)',
            border: 'none', borderRadius: 14, marginTop: 4,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(196,136,48,.3)',
          }}>
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          <span style={{ fontSize: 14, color: '#8A704080', fontWeight: 600 }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button onClick={switchMode} style={{ fontSize: 14, fontWeight: 800, color: '#C48830', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Quicksand', sans-serif" }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
