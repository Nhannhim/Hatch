import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// SVG Illustrations
// ═══════════════════════════════════════════════════════════════

function GoldenEgg({ size = 64, id = '' }) {
  const gid = 'eg' + id;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" style={{ filter: 'drop-shadow(0 4px 12px rgba(196,136,48,.35))' }}>
      <defs>
        <radialGradient id={gid + 'g'} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE082" /><stop offset="40%" stopColor="#F0C850" />
          <stop offset="75%" stopColor="#C48830" /><stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <radialGradient id={gid + 's'} cx="35%" cy="28%" r="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="44" rx="26" ry="34" fill={`url(#${gid}g)`} stroke="#A67C20" strokeWidth="0.8" />
      <ellipse cx="28" cy="36" rx="14" ry="20" fill={`url(#${gid}s)`} />
      <ellipse cx="24" cy="30" rx="4" ry="7" fill="#fff" opacity="0.45" />
    </svg>
  );
}

function BasketOfEggs({ size = 160 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 160 136" style={{ filter: 'drop-shadow(0 6px 20px rgba(196,136,48,.25))' }}>
      <defs>
        <linearGradient id="basketWeave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C48830" /><stop offset="50%" stopColor="#A67020" /><stop offset="100%" stopColor="#8B5E14" />
        </linearGradient>
        <radialGradient id="miniEggGold" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE082" /><stop offset="50%" stopColor="#F0C850" /><stop offset="100%" stopColor="#C48830" />
        </radialGradient>
      </defs>
      <path d="M20 60 L10 120 Q10 130 20 130 L140 130 Q150 130 150 120 L140 60 Z" fill="url(#basketWeave)" stroke="#8B5E14" strokeWidth="1.5" />
      <line x1="30" y1="70" x2="20" y2="125" stroke="#A67020" strokeWidth="1.5" opacity="0.5" />
      <line x1="55" y1="60" x2="45" y2="125" stroke="#A67020" strokeWidth="1.5" opacity="0.5" />
      <line x1="80" y1="60" x2="75" y2="125" stroke="#A67020" strokeWidth="1.5" opacity="0.5" />
      <line x1="105" y1="60" x2="105" y2="125" stroke="#A67020" strokeWidth="1.5" opacity="0.5" />
      <line x1="130" y1="60" x2="135" y2="125" stroke="#A67020" strokeWidth="1.5" opacity="0.5" />
      <line x1="15" y1="80" x2="145" y2="80" stroke="#A67020" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="100" x2="148" y2="100" stroke="#A67020" strokeWidth="1" opacity="0.4" />
      <path d="M40 60 Q80 5 120 60" fill="none" stroke="url(#basketWeave)" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 60 Q80 10 120 60" fill="none" stroke="#D4A03C" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="55" cy="55" rx="16" ry="20" fill="url(#miniEggGold)" stroke="#A67C20" strokeWidth="0.6" />
      <ellipse cx="80" cy="50" rx="16" ry="20" fill="url(#miniEggGold)" stroke="#A67C20" strokeWidth="0.6" />
      <ellipse cx="105" cy="55" rx="16" ry="20" fill="url(#miniEggGold)" stroke="#A67C20" strokeWidth="0.6" />
      <ellipse cx="52" cy="48" rx="5" ry="8" fill="#fff" opacity="0.35" />
      <ellipse cx="77" cy="43" rx="5" ry="8" fill="#fff" opacity="0.35" />
      <ellipse cx="102" cy="48" rx="5" ry="8" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function NestIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <radialGradient id="nestEgg" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE082" /><stop offset="60%" stopColor="#F0C850" /><stop offset="100%" stopColor="#C48830" />
        </radialGradient>
      </defs>
      <path d="M6 28 Q6 38 24 40 Q42 38 42 28" fill="none" stroke="#A67020" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 30 Q8 36 24 38 Q40 36 40 30" fill="none" stroke="#C48830" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M4 26 Q4 22 12 24" fill="none" stroke="#A67020" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 26 Q44 22 36 24" fill="none" stroke="#A67020" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="24" rx="8" ry="11" fill="url(#nestEgg)" stroke="#A67C20" strokeWidth="0.6" />
      <ellipse cx="22" cy="20" rx="3" ry="5" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function GoldenShield({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" /><stop offset="50%" stopColor="#D4A03C" /><stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      <path d="M24 4l16 6v12c0 10-6 18-16 22C14 40 8 32 8 22V10z" fill="url(#shieldGold)" stroke="#A67C20" strokeWidth="1" />
      <path d="M18 24l4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartGoose({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="chartGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C48830" /><stop offset="100%" stopColor="#FFE082" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFFDF5" stroke="#F0E6D0" strokeWidth="1" />
      <polyline points="8,36 16,28 22,32 30,18 40,12" fill="none" stroke="url(#chartGold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="12" r="3" fill="#C48830" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const LANDING_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;600&family=Quicksand:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&display=swap');

.landing-root {
  width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden;
  background: #FFFEF9; font-family: 'Quicksand', sans-serif; color: #333334;
  scroll-behavior: smooth;
}
.landing-root * { box-sizing: border-box; margin: 0; padding: 0; }

/* Navbar */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 64px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; background: transparent;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all .4s ease;
}
.lp-nav.scrolled {
  background: rgba(255,254,249,.95);
  box-shadow: 0 2px 20px rgba(196,136,48,.08);
  border-bottom: 1px solid rgba(196,136,48,.1);
}
.lp-nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
.lp-nav-logo-text {
  font-size: 28px; font-weight: 900; font-family: 'Instrument Serif', serif;
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  transition: all .4s;
}
.lp-nav.scrolled .lp-nav-logo-text {
  background: linear-gradient(135deg, #C48830, #8B6914);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-nav-links { display: flex; align-items: center; gap: 8px; }
.lp-nav-link {
  padding: 8px 16px; font-size: 14px; font-weight: 700; color: rgba(255,248,225,.7);
  text-decoration: none; border-radius: 10px; cursor: pointer; border: none; background: none;
  font-family: 'Quicksand', sans-serif; transition: all .3s;
}
.lp-nav.scrolled .lp-nav-link { color: #8A7040; }
.lp-nav-link:hover { background: rgba(255,248,238,.15); color: #FFE082; }
.lp-nav.scrolled .lp-nav-link:hover { background: #FFF8EE; color: #C48830; }
.lp-btn-login {
  padding: 9px 22px; font-size: 14px; font-weight: 800; color: #FFE082;
  background: transparent; border: 1.5px solid rgba(255,224,130,.3); border-radius: 12px;
  cursor: pointer; font-family: 'Quicksand', sans-serif; transition: all .3s;
}
.lp-nav.scrolled .lp-btn-login { color: #8B6914; border-color: #C4883040; }
.lp-btn-login:hover { border-color: #FFE082; background: rgba(255,224,130,.1); }
.lp-nav.scrolled .lp-btn-login:hover { border-color: #C48830; background: #FFF8EE; }
.lp-btn-signup {
  padding: 9px 22px; font-size: 14px; font-weight: 800; color: #1A1410;
  background: linear-gradient(135deg, #FFE082, #D4A03C); border: none; border-radius: 12px;
  cursor: pointer; font-family: 'Quicksand', sans-serif; transition: all .2s;
  box-shadow: 0 2px 12px rgba(196,136,48,.25);
}
.lp-nav.scrolled .lp-btn-signup { color: #fff; background: linear-gradient(135deg, #C48830, #8B6914); }
.lp-btn-signup:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(196,136,48,.35); }

/* Hero */
.lp-hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 100px 60px 80px; position: relative; overflow: hidden;
  background: #1A1410;
}
.lp-hero-bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center 30%;
  opacity: 0.35; filter: blur(1px);
  animation: heroZoom 20s ease-in-out infinite alternate;
}
@keyframes heroZoom { 0%{transform:scale(1)} 100%{transform:scale(1.08)} }
.lp-hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(26,20,16,.7) 0%, rgba(26,20,16,.3) 40%, rgba(26,20,16,.6) 100%);
}
.lp-hero-inner {
  max-width: 800px; width: 100%; display: flex; flex-direction: column;
  align-items: center; text-align: center; z-index: 2;
}
.lp-hero-text { width: 100%; display: flex; flex-direction: column; align-items: center; }
.lp-hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 50px;
  background: rgba(255,224,130,.12);
  border: 1px solid rgba(196,136,48,.25); font-size: 13px; font-weight: 800;
  color: #FFE082; letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 24px; animation: fadeUp .6s ease both;
}
.lp-hero-h1 {
  font-size: 72px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #FFFEF5; line-height: 1.08; margin-bottom: 24px;
  animation: fadeUp .6s ease .1s both;
  text-shadow: 0 2px 40px rgba(0,0,0,.4);
}
.lp-hero-h1 span {
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-hero-sub {
  font-size: 20px; line-height: 1.7; color: rgba(255,248,225,.75); font-weight: 600;
  margin-bottom: 40px; max-width: 540px;
  animation: fadeUp .6s ease .2s both;
}
.lp-hero-ctas {
  display: flex; gap: 16px; align-items: center; justify-content: center;
  animation: fadeUp .6s ease .3s both;
}
.lp-hero-btn-primary {
  padding: 16px 36px; font-size: 18px; font-weight: 900;
  font-family: 'Instrument Serif', serif; color: #1A1410;
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  border: none; border-radius: 16px; cursor: pointer;
  box-shadow: 0 4px 24px rgba(196,136,48,.4);
  transition: all .2s;
}
.lp-hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,224,130,.5); }
.lp-hero-btn-secondary {
  padding: 16px 28px; font-size: 16px; font-weight: 800;
  color: #FFE082; background: transparent;
  border: 2px solid rgba(255,224,130,.3); border-radius: 16px;
  cursor: pointer; font-family: 'Quicksand', sans-serif; transition: all .2s;
}
.lp-hero-btn-secondary:hover { border-color: #FFE082; background: rgba(255,224,130,.1); }

/* Golden goose emblem — peeks from below the hero */
.lp-emblem-slide {
  display: flex; align-items: flex-start; justify-content: center;
  padding: 0 40px 80px; text-align: center;
  background: #FFFEF9;
}
.lp-emblem-slide img {
  max-height: 680px; width: auto; max-width: 80%;
  object-fit: contain;
  filter: drop-shadow(0 20px 60px rgba(196,136,48,.2));
}

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

/* Fable quote banner */
.lp-fable-banner {
  padding: 80px 40px; text-align: center;
  background: linear-gradient(180deg, #FFF3D4, #FFEDC0, #FFF3D4);
  position: relative; overflow: hidden;
}
.lp-fable-quote {
  font-size: 34px; font-family: 'Instrument Serif', serif;
  color: #1A1A1A; line-height: 1.6; max-width: 700px;
  margin: 0 auto 12px; font-style: italic;
}
.lp-fable-attr {
  font-size: 16px; font-weight: 700; color: #8B6914;
  letter-spacing: 2px; text-transform: uppercase;
}

/* Features */
.lp-features {
  padding: 100px 40px; max-width: 1200px; margin: 0 auto;
}
.lp-section-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 50px;
  background: #FFF8E1; border: 1px solid #F0E6D0;
  font-size: 12px; font-weight: 800; color: #C48830;
  letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px;
}
.lp-section-h2 {
  font-size: 44px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #1A1A2E; margin-bottom: 16px; line-height: 1.15;
}
.lp-section-sub {
  font-size: 20px; color: #6B5A2E; font-weight: 600;
  line-height: 1.7; max-width: 540px; margin-bottom: 48px;
}
.lp-features-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.lp-feature-card {
  padding: 32px 28px; border-radius: 20px;
  background: #fff; border: 1.5px solid #F0E6D0;
  transition: all .25s ease; cursor: default;
}
.lp-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(196,136,48,.1);
  border-color: #C4883040;
}
.lp-feature-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px; font-size: 28px;
}
.lp-feature-title {
  font-size: 24px; font-weight: 900; color: #1A1A2E;
  font-family: 'Instrument Serif', serif; margin-bottom: 8px;
}
.lp-feature-desc {
  font-size: 17px; color: #6B5A2E; font-weight: 600; line-height: 1.65;
}

/* How it works */
.lp-how {
  padding: 100px 40px;
  background: linear-gradient(180deg, #FFFEF9, #FFF9E6);
}
.lp-how-inner { max-width: 1000px; margin: 0 auto; text-align: center; }
.lp-steps {
  display: flex; gap: 32px; margin-top: 60px; align-items: flex-start;
}
.lp-step {
  flex: 1; text-align: center; position: relative;
  padding: 32px 20px;
}
.lp-step-num {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #C48830, #D4A03C);
  color: #fff; font-size: 20px; font-weight: 900;
  font-family: 'Instrument Serif', serif;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px; box-shadow: 0 4px 16px rgba(196,136,48,.25);
}
.lp-step-icon { margin-bottom: 16px; }
.lp-step-title {
  font-size: 26px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #1A1A2E; margin-bottom: 8px;
}
.lp-step-desc {
  font-size: 17px; color: #6B5A2E; font-weight: 600; line-height: 1.65;
}
.lp-step-connector {
  position: absolute; top: 56px; right: -20px; width: 40px;
  display: flex; align-items: center; justify-content: center;
  color: #C4883050; font-size: 20px;
}

/* Stats */
.lp-stats {
  padding: 80px 40px;
  background: linear-gradient(180deg, #FFEDC0, #FFE6A8, #FFEDC0);
}
.lp-stats-inner {
  max-width: 1000px; margin: 0 auto;
  display: flex; justify-content: center; gap: 60px;
}
.lp-stat-item { text-align: center; }
.lp-stat-num {
  font-size: 48px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #1A1A1A;
  margin-bottom: 4px;
}
.lp-stat-label {
  font-size: 16px; font-weight: 700; color: #5A4A20;
  letter-spacing: 1px; text-transform: uppercase;
}

/* Trust */
.lp-trust {
  padding: 100px 40px; max-width: 1100px; margin: 0 auto;
}
.lp-trust-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}
.lp-trust-card {
  text-align: center; padding: 28px 20px;
  border-radius: 20px; background: #FFFDF5;
  border: 1.5px solid #F0E6D0;
}
.lp-trust-card-icon { margin-bottom: 16px; }
.lp-trust-card-title {
  font-size: 22px; font-weight: 900; color: #1A1A2E;
  font-family: 'Instrument Serif', serif; margin-bottom: 6px;
}
.lp-trust-card-desc {
  font-size: 16px; color: #8A7040; font-weight: 600; line-height: 1.6;
}

/* CTA */
.lp-cta {
  padding: 120px 40px; text-align: center;
  background: #1A1410;
  position: relative; overflow: hidden;
}
.lp-cta-bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; opacity: 0.2; filter: blur(3px);
}
.lp-cta-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(26,20,16,.5) 0%, rgba(26,20,16,.85) 70%);
}
.lp-cta-h2 {
  font-size: 48px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #FFFEF5; margin-bottom: 16px; position: relative; z-index: 2;
  text-shadow: 0 2px 30px rgba(0,0,0,.3);
}
.lp-cta-h2 span {
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-cta-sub {
  font-size: 20px; color: rgba(255,248,225,.7); font-weight: 600;
  line-height: 1.7; max-width: 480px; margin: 0 auto 36px;
  position: relative; z-index: 2;
}

/* Footer */
.lp-footer {
  padding: 60px 40px 30px; background: #FFF8E1;
  border-top: 1px solid #F0E6D0;
}
.lp-footer-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 40px; flex-wrap: wrap;
}
.lp-footer-brand { max-width: 280px; }
.lp-footer-brand-name {
  font-size: 28px; font-weight: 900; font-family: 'Instrument Serif', serif;
  background: linear-gradient(135deg, #C48830, #8B6914);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}
.lp-footer-brand-desc {
  font-size: 14px; color: #8A7040; font-weight: 600; line-height: 1.65;
}
.lp-footer-col-title {
  font-size: 12px; font-weight: 800; color: #8B6914;
  letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;
}
.lp-footer-link {
  display: block; font-size: 14px; color: #8A7040;
  font-weight: 600; text-decoration: none; margin-bottom: 8px;
  cursor: pointer; transition: color .15s;
}
.lp-footer-link:hover { color: #C48830; }
.lp-footer-bottom {
  max-width: 1100px; margin: 40px auto 0;
  padding-top: 24px; border-top: 1px solid #E0D0B0;
  text-align: center;
}
.lp-footer-legal {
  font-size: 12px; color: #8A704080; font-weight: 600; line-height: 1.8;
}

/* Features header with illustration */
.lp-features-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 48px; margin-bottom: 48px;
}
.lp-features-header-text { flex: 1; }
.lp-features-header-text .lp-section-sub { margin-bottom: 0; }
.lp-features-header-illustration {
  flex-shrink: 0;
  animation: float 4s ease-in-out infinite;
}

/* Peek-a-boo egg section */
.lp-peekaboo {
  height: 33vh;
  display: flex; align-items: center; justify-content: center;
  background: #FFFEF9; overflow: hidden;
}
.lp-peekaboo-img {
  transform: scale(0.3);
  will-change: transform;
}
.lp-peekaboo-img img {
  max-height: 28vh; width: auto;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 900px) {
  .lp-hero-h1 { font-size: 48px; }
  .lp-hero-sub { max-width: 100%; }
  .lp-features-grid { grid-template-columns: 1fr; }
  .lp-features-header { flex-direction: column; }
  .lp-features-header-illustration { display: none; }
  .lp-steps { flex-direction: column; align-items: center; }
  .lp-step-connector { display: none; }
  .lp-stats-inner { flex-wrap: wrap; gap: 32px; }
  .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-nav { padding: 0 20px; }
  .lp-nav-links .lp-nav-link { display: none; }
}
@media (max-width: 600px) {
  .lp-hero { padding: 90px 24px 60px; }
  .lp-hero-h1 { font-size: 38px; }
  .lp-emblem-slide { padding: 0 24px 60px; }
  .lp-emblem-slide img { max-height: 420px; }
  .lp-hero-ctas { flex-direction: column; width: 100%; }
  .lp-hero-btn-primary, .lp-hero-btn-secondary { width: 100%; text-align: center; }
  .lp-section-h2 { font-size: 32px; }
  .lp-cta-h2 { font-size: 32px; }
  .lp-peekaboo-img img { max-height: 20vh; }
  .lp-trust-grid { grid-template-columns: 1fr; }
  .lp-features, .lp-how, .lp-trust, .lp-cta { padding: 60px 24px; }
}
`;

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: <BasketOfEggs size={48} />,
    bg: '#FFF8E1',
    title: 'Basket Investing',
    desc: "Don't put all your eggs in one basket — build many. Group stocks, bonds & ETFs into themed baskets and invest with a single tap.",
  },
  {
    icon: <ChartGoose size={48} />,
    bg: '#F0FFF0',
    title: 'Live Market Signals',
    desc: 'Real-time prices, AI-powered trade signals, and macro regime detection. The golden goose watches the markets so you can rest easy.',
  },
  {
    icon: <NestIcon size={48} />,
    bg: '#FFF3E0',
    title: 'Nest Egg Protection',
    desc: 'Stress-test your portfolio against market crashes, recessions, and black swan events. Protect your golden eggs from harm.',
  },
  {
    icon: <GoldenShield size={48} />,
    bg: '#E8F5E9',
    title: 'Risk Management',
    desc: 'Factor exposures, correlation matrices, and hedge recommendations. Know exactly how your eggs are connected.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFFDF5" stroke="#F0E6D0" strokeWidth="1" />
        <path d="M14 34 V18 L24 14 L34 18 V34" fill="none" stroke="#C48830" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 34 V26 H28 V34" fill="none" stroke="#D4A03C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: '#EDE7F6',
    title: 'Portfolio Analytics',
    desc: 'Deep dives into your holdings with P&L tracking, sector allocation, and performance attribution. Know where every golden egg came from.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" fill="#FFFDF5" stroke="#F0E6D0" strokeWidth="1" />
        <path d="M24 12 V24 L32 28" fill="none" stroke="#C48830" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill="#D4A03C" />
      </svg>
    ),
    bg: '#FFF3E0',
    title: 'Patience Pays',
    desc: "The farmer waited for each golden egg. Hatch rewards long-term thinking with smart rebalancing and patience-based insights.",
  },
];

const STEPS = [
  { num: '1', icon: <GoldenEgg size={36} id="s1" />, title: 'Hatch Your Account', desc: 'Sign up in seconds. Your golden goose journey begins with a single step.' },
  { num: '2', icon: <BasketOfEggs size={56} />, title: 'Fill Your Baskets', desc: 'Browse curated baskets or build your own. Mix stocks, bonds, and ETFs across themes and strategies.' },
  { num: '3', icon: <NestIcon size={44} />, title: 'Watch Them Grow', desc: 'Track your nest egg with real-time data, AI signals, and risk analytics. Patience rewards the wise.' },
];

const STATS = [
  { num: '50+', label: 'Curated Baskets' },
  { num: '1,000+', label: 'Instruments' },
  { num: '24/7', label: 'Market Monitoring' },
  { num: '0', label: 'Commission Fees' },
];

const TRUST_ITEMS = [
  { icon: <GoldenShield size={40} />, title: 'Bank-Grade Security', desc: '256-bit encryption protects your nest egg at every layer.' },
  {
    icon: <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FFF8E1" stroke="#F0E6D0" strokeWidth="1" /><path d="M14 20l4 4 8-8" fill="none" stroke="#C48830" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    title: 'SIPC Protected', desc: 'Your investments are covered up to $500,000 in securities.',
  },
  {
    icon: <svg width="40" height="40" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="8" fill="#FFF8E1" stroke="#F0E6D0" strokeWidth="1" /><circle cx="20" cy="18" r="5" fill="none" stroke="#C48830" strokeWidth="2" /><path d="M12 32 Q12 24 20 24 Q28 24 28 32" fill="none" stroke="#C48830" strokeWidth="2" strokeLinecap="round" /></svg>,
    title: 'Your Data, Your Nest', desc: 'We never sell your data. Your golden eggs are yours alone.',
  },
  {
    icon: <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FFF8E1" stroke="#F0E6D0" strokeWidth="1" /><text x="20" y="26" textAnchor="middle" fontSize="18" fill="#C48830" fontWeight="900" fontFamily="Instrument Serif">24</text></svg>,
    title: '24/7 Support', desc: 'Our flock is always here. Reach us anytime, day or night.',
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function LandingPage({ onGetStarted, onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef(null);
  const gooseRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);

      if (gooseRef.current) {
        const rect = gooseRef.current.getBoundingClientRect();
        const viewH = el.clientHeight;
        const progress = Math.max(0, Math.min(1, (viewH - rect.top) / viewH));
        gooseRef.current.style.transform = `scale(${0.3 + progress * 0.7})`;
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-root" ref={rootRef}>
      <style>{LANDING_STYLES}</style>

      {/* ── Navbar ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-logo">
          <GoldenEgg size={28} id="nav" />
          <span className="lp-nav-logo-text">Hatch</span>
        </div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => document.getElementById('lp-features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
          <button className="lp-nav-link" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</button>
          <button className="lp-nav-link" onClick={() => document.getElementById('lp-trust')?.scrollIntoView({ behavior: 'smooth' })}>Security</button>
          <button className="lp-btn-login" onClick={onLogin}>Log In</button>
          <button className="lp-btn-signup" onClick={onGetStarted}>Sign Up</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <img className="lp-hero-bg" src="/fable-nest-egg.jpg" alt="" />
        <div className="lp-hero-overlay" />

        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-tag">
              <GoldenEgg size={14} id="tag" />
              Smart Investing, Simplified
            </div>
            <h1 className="lp-hero-h1">
              Your Golden Goose<br />
              for <span>Smarter Investing</span>
            </h1>
            <p className="lp-hero-sub">
              Like the fable's golden goose, great wealth comes from patience and wisdom.
              Hatch helps you build diversified baskets, track live markets, and grow
              your nest egg — one golden egg at a time.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-hero-btn-primary" onClick={onGetStarted}>
                Start Hatching — It's Free
              </button>
              <button className="lp-hero-btn-secondary" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fable Quote ── */}
      <section className="lp-fable-banner">
        <p className="lp-fable-quote">
          "He who possesses a goose that lays golden eggs should be content
          with one egg a day — and never kill the goose."
        </p>
        <p className="lp-fable-attr">Aesop's Fables</p>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="lp-features">
        <div className="lp-features-header">
          <div className="lp-features-header-text">
            <div className="lp-section-tag">
              <GoldenEgg size={12} id="ft" /> Golden Features
            </div>
            <h2 className="lp-section-h2">Everything you need to<br />grow your nest egg</h2>
            <p className="lp-section-sub">
              Powerful tools wrapped in simplicity. From basket investing to AI-driven
              risk management — Hatch gives you an unfair advantage.
            </p>
          </div>
          <div className="lp-features-header-illustration">
            <img src="/basket-nest-egg.jpeg" alt="Basket of eggs" style={{ width: 260, height: 'auto', borderRadius: 20, objectFit: 'cover' }} />
          </div>
        </div>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div className="lp-feature-card" key={i}>
              <div className="lp-feature-icon" style={{ background: f.bg, borderRadius: 16 }}>
                {f.icon}
              </div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-how" id="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-tag" style={{ justifyContent: 'center', margin: '0 auto 16px' }}>
            <BasketOfEggs size={14} /> 3 Simple Steps
          </div>
          <h2 className="lp-section-h2" style={{ textAlign: 'center' }}>
            From hatchling to<br />golden goose owner
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center', margin: '0 auto 0' }}>
            Start building your nest in minutes. No experience needed —
            the goose does the heavy lifting.
          </p>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
                {i < STEPS.length - 1 && (
                  <div className="lp-step-connector">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div className="lp-stat-item" key={i}>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="lp-trust" id="lp-trust">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="lp-section-tag" style={{ justifyContent: 'center', margin: '0 auto 16px' }}>
            <GoldenShield size={14} /> Your Nest is Safe
          </div>
          <h2 className="lp-section-h2" style={{ textAlign: 'center' }}>
            Protecting every<br />golden egg
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            The wise farmer guards the goose. We guard your investments
            with institutional-grade security.
          </p>
        </div>
        <div className="lp-trust-grid">
          {TRUST_ITEMS.map((t, i) => (
            <div className="lp-trust-card" key={i}>
              <div className="lp-trust-card-icon">{t.icon}</div>
              <div className="lp-trust-card-title">{t.title}</div>
              <div className="lp-trust-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Peek-a-boo Egg ── */}
      <section className="lp-peekaboo">
        <div ref={gooseRef} className="lp-peekaboo-img">
          <img src="/golden-egg-ribbon.jpg" alt="Golden Goose" />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta">
        <img className="lp-cta-bg" src="/fable-nest-egg.jpg" alt="" />
        <div className="lp-cta-overlay" />
        <div style={{ marginBottom: 24, animation: 'float 4s ease-in-out infinite', position: 'relative', zIndex: 2 }}>
          <BasketOfEggs size={120} />
        </div>
        <h2 className="lp-cta-h2">Ready to hatch your<br /><span>golden future?</span></h2>
        <p className="lp-cta-sub">
          Join thousands of investors who trust the goose.
          Start building your baskets today — it's completely free.
        </p>
        <button className="lp-hero-btn-primary" onClick={onGetStarted} style={{ position: 'relative', zIndex: 2 }}>
          Get Started for Free
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <GoldenEgg size={22} id="ftr" />
              <div className="lp-footer-brand-name">Hatch</div>
            </div>
            <div className="lp-footer-brand-desc">
              Inspired by the timeless wisdom of Aesop's golden goose.
              Build wealth patiently, one golden egg at a time.
            </div>
          </div>
          <div>
            <div className="lp-footer-col-title">Product</div>
            <span className="lp-footer-link" onClick={() => document.getElementById('lp-features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
            <span className="lp-footer-link" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
            <span className="lp-footer-link">Pricing</span>
            <span className="lp-footer-link">API</span>
          </div>
          <div>
            <div className="lp-footer-col-title">Company</div>
            <span className="lp-footer-link">About</span>
            <span className="lp-footer-link">Careers</span>
            <span className="lp-footer-link">Blog</span>
            <span className="lp-footer-link">Press</span>
          </div>
          <div>
            <div className="lp-footer-col-title">Legal</div>
            <span className="lp-footer-link">Terms of Service</span>
            <span className="lp-footer-link">Privacy Policy</span>
            <span className="lp-footer-link">Disclosures</span>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p className="lp-footer-legal">
            Hatch is not a registered broker-dealer or investment advisor. All investing involves risk, including possible loss of principal.
            Past performance does not guarantee future results. The golden goose is a metaphor — we cannot guarantee golden eggs.
          </p>
          <p className="lp-footer-legal" style={{ marginTop: 12 }}>
            &copy; 2026 Hatch. All rights reserved. Inspired by Aesop.
          </p>
        </div>
      </footer>
    </div>
  );
}
