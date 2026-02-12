import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

const SLIDES = [
  {
    emoji: '🪿',
    title: 'The Golden Goose',
    text: 'Once upon a time, a farmer found a goose that laid eggs of pure gold...',
    bg: 'linear-gradient(180deg, #FFF9E6 0%, #FFFDF5 100%)',
  },
  {
    emoji: '🥚',
    title: 'Golden Eggs',
    text: 'Each egg was worth a fortune. But the farmer had to be patient \u2014 one egg at a time.',
    bg: 'linear-gradient(180deg, #FFF3D4 0%, #FFFDF5 100%)',
  },
  {
    emoji: '🧺',
    title: 'Fill Your Basket',
    text: 'Build baskets of stocks, bonds & more. Diversify your golden eggs across markets.',
    bg: 'linear-gradient(180deg, #F5ECD7 0%, #FFFDF5 100%)',
  },
  {
    emoji: '📈',
    title: 'Watch Them Grow',
    text: 'Track live prices, AI signals & risk metrics. Patience rewards the wise farmer.',
    bg: 'linear-gradient(180deg, #EDE4CF 0%, #FFFDF5 100%)',
  },
  {
    emoji: '🐣',
    title: 'Welcome to Hatch',
    text: 'Your golden eggs await. Sign in to start building your nest.',
    bg: 'linear-gradient(180deg, #FFF8E1 0%, #FFFDF5 100%)',
  },
];

// Golden Egg SVG drawn inline
function GoldenEgg({ size = 64 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" style={{ filter: 'drop-shadow(0 4px 12px rgba(196,136,48,.35))' }}>
      <defs>
        <radialGradient id="eggGold" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="40%" stopColor="#F0C850" />
          <stop offset="75%" stopColor="#C48830" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <radialGradient id="eggShine" cx="35%" cy="28%" r="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="44" rx="26" ry="34" fill="url(#eggGold)" stroke="#A67C20" strokeWidth="0.8" />
      <ellipse cx="28" cy="36" rx="14" ry="20" fill="url(#eggShine)" />
      <ellipse cx="24" cy="30" rx="4" ry="7" fill="#fff" opacity="0.45" />
    </svg>
  );
}

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [screen, setScreen] = useState('onboarding'); // 'onboarding' | 'login'
  const [slide, setSlide] = useState(0);
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

  // ── ONBOARDING SLIDES ──
  if (screen === 'onboarding') {
    const s = SLIDES[slide];
    const isLast = slide === SLIDES.length - 1;
    return (
      <div style={{ width: '100%', flex: 1, background: s.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Quicksand', sans-serif", transition: 'background .5s ease' }}>
        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'popIn .5s ease both', filter: 'drop-shadow(0 4px 8px rgba(196,136,48,.25))' }}>{s.emoji}</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Instrument Serif', serif", color: '#333334', marginBottom: 8, animation: 'fadeUp .5s ease .1s both' }}>{s.title}</h1>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: '#6B5A2E', fontWeight: 600, maxWidth: 280, animation: 'fadeUp .5s ease .2s both' }}>{s.text}</p>
        </div>

        {/* Bottom controls */}
        <div style={{ padding: '0 28px 40px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {SLIDES.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                width: i === slide ? 20 : 8, height: 8, borderRadius: 4,
                background: i === slide ? 'linear-gradient(135deg, #C48830, #D4A03C)' : '#D4A03C40',
                cursor: 'pointer', transition: 'all .3s ease',
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            {!isLast ? (
              <>
                <button onClick={() => setScreen('login')} style={{
                  flex: 1, padding: '13px 0', borderRadius: 14, border: '1.5px solid #C4883040',
                  background: 'transparent', fontSize: 11, fontWeight: 800, color: '#8B6914',
                  cursor: 'pointer', fontFamily: "'Quicksand', sans-serif",
                }}>Skip</button>
                <button onClick={() => setSlide(slide + 1)} style={{
                  flex: 2, padding: '13px 0', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #C48830, #D4A03C)', color: '#fff',
                  fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Quicksand', sans-serif",
                }}>Next</button>
              </>
            ) : (
              <button onClick={() => setScreen('login')} style={{
                flex: 1, padding: '14px 0', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #C48830, #8B6914)', color: '#fff',
                fontSize: 12, fontWeight: 900, cursor: 'pointer', fontFamily: "'Instrument Serif', serif",
                boxShadow: '0 4px 16px rgba(196,136,48,.4)',
              }}>Get Started</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN / REGISTER ──
  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', fontFamily: "'Quicksand', sans-serif", background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFDF5 40%, #FFFDF5 100%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', overflow: 'auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>
            <GoldenEgg size={52} />
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Instrument Serif', serif", background: 'linear-gradient(135deg, #C48830, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hatch</span>
          </div>
          <p style={{ fontSize: 8, fontWeight: 700, color: '#C8B898', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Smart Trading</p>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 18, fontWeight: 900, color: '#333334', textAlign: 'center', marginBottom: 4, fontFamily: "'Instrument Serif', serif" }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{ fontSize: 10, color: '#8A7040', textAlign: 'center', marginBottom: 20, fontWeight: 600 }}>
          {isRegister ? 'Start hatching your golden portfolio' : 'Sign in to your nest'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'block' }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{ width: '100%', padding: '11px 12px', fontSize: 11, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#fff', color: '#333334', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'block' }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required minLength={6}
              style={{ width: '100%', padding: '11px 12px', fontSize: 11, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#fff', color: '#333334', boxSizing: 'border-box' }}
            />
          </div>
          {isRegister && (
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#8A704080', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'block' }}>Confirm Password</label>
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required minLength={6}
                style={{ width: '100%', padding: '11px 12px', fontSize: 11, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, border: '1.5px solid #C4883025', borderRadius: 12, outline: 'none', background: '#fff', color: '#333334', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {error && <div style={{ fontSize: 10, fontWeight: 700, color: '#EF5350', background: '#FFEBEE', padding: '8px 12px', borderRadius: 10, textAlign: 'center' }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '12px 0', fontSize: 12, fontWeight: 900,
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          <span style={{ fontSize: 10, color: '#8A704080', fontWeight: 600 }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button onClick={switchMode} style={{ fontSize: 10, fontWeight: 800, color: '#C48830', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Quicksand', sans-serif" }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
