import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// SVG Illustrations
// ═══════════════════════════════════════════════════════════════

function GoldenEgg({ size = 64 }) {
  return (
    <img
      src="/golden-egg-logo.png?v=2"
      alt=""
      width={size}
      height={Math.round(size * 1.23)}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(196,136,48,.3))' }}
    />
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
  max-width: 1100px; width: 100%; display: flex; flex-direction: column;
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
  font-size: 120px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #FFFEF5; line-height: 1.02; margin-bottom: 32px;
  animation: fadeUp .6s ease .1s both;
  text-shadow: 0 4px 60px rgba(0,0,0,.5);
}
.lp-hero-h1 span {
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-hero-sub {
  font-size: 22px; line-height: 1.7; color: rgba(255,248,225,.75); font-weight: 600;
  margin-bottom: 48px; max-width: 600px;
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

/* App mockup section */
.lp-app-mockup {
  padding: 100px 40px 0;
  background: linear-gradient(180deg, #C49A6C, #A07848 30%, #6B4525 65%, #3A2210);
  overflow: hidden;
}
.lp-app-mockup-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: flex-end; gap: 80px;
}
.lp-app-mockup-text { flex: 1; padding-bottom: 100px; }
.lp-app-mockup-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 50px;
  background: rgba(205,155,80,.12);
  border: 1px solid rgba(205,155,80,.3);
  font-size: 12px; font-weight: 800; color: #D4A03C;
  letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px;
}
.lp-app-mockup-h2 {
  font-size: 56px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #FFFEF5; line-height: 1.1; margin-bottom: 24px;
}
.lp-app-mockup-h2 span {
  background: linear-gradient(135deg, #FFE082, #CD9B50, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-app-mockup-desc {
  font-size: 20px; color: rgba(255,248,225,.65); font-weight: 600;
  line-height: 1.7; max-width: 440px; margin-bottom: 36px;
}
.lp-app-store-btns {
  display: flex; gap: 16px; align-items: center;
}
.lp-store-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 24px; border-radius: 14px;
  background: rgba(205,155,80,.08);
  border: 1.5px solid rgba(205,155,80,.25);
  color: #FFFEF5; font-family: 'Quicksand', sans-serif;
  cursor: pointer; transition: all .2s; text-decoration: none;
}
.lp-store-btn:hover {
  background: rgba(205,155,80,.15);
  border-color: rgba(205,155,80,.5);
  transform: translateY(-2px);
}
.lp-store-btn-icon { font-size: 28px; line-height: 1; }
.lp-store-btn-text { display: flex; flex-direction: column; }
.lp-store-btn-label {
  font-size: 11px; font-weight: 600; color: rgba(255,248,225,.5);
  letter-spacing: 0.5px;
}
.lp-store-btn-name {
  font-size: 18px; font-weight: 800; color: #FFFEF5;
  font-family: 'Quicksand', sans-serif;
}
.lp-app-mockup-phone {
  flex-shrink: 0; position: relative;
  width: 380px; height: 480px;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 40px rgba(0,0,0,.3), 0 0 80px rgba(205,155,80,.1);
}
.lp-app-mockup-phone img {
  width: 100%; height: auto;
  object-fit: cover; object-position: top;
  display: block;
}

/* AI Agent section */
.lp-ai-agent {
  padding: 120px 40px;
  background: linear-gradient(180deg, #FFFEF9, #FFF8E8 40%, #FFFEF9);
  position: relative; overflow: hidden;
}
.lp-ai-agent-title {
  text-align: center; margin-bottom: 64px;
}
.lp-ai-agent-title h2 {
  font-size: 80px; font-weight: 900; font-family: 'Instrument Serif', serif;
  color: #1A1A2E; line-height: 1.05; margin-bottom: 16px;
}
.lp-ai-agent-title h2 span {
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.lp-ai-agent-title p {
  font-size: 20px; color: #5A5A6A; font-weight: 600;
  line-height: 1.7; max-width: 560px; margin: 0 auto;
}
.lp-ai-agent-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; gap: 80px;
}
.lp-ai-agent-visual {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  animation: float 5s ease-in-out infinite;
}
.lp-ai-agent-visual img {
  width: 440px; height: auto;
  filter: drop-shadow(0 24px 60px rgba(196,136,48,.25));
}
.lp-ai-agent-visual-label {
  margin-top: 16px; font-size: 14px; font-weight: 800;
  color: #C48830; font-family: 'Quicksand', sans-serif;
  letter-spacing: 1px; text-transform: uppercase;
}
.lp-ai-agent-visual { position: relative; cursor: pointer; }
.lp-egg-hover-bubble {
  position: absolute; top: -20px; right: -40px;
  background: #fff; border-radius: 20px; padding: 14px 20px;
  box-shadow: 0 6px 24px rgba(0,0,0,.1);
  border: 1.5px solid #F0E6D0;
  white-space: nowrap;
  font-size: 15px; font-weight: 700; color: #1A1A2E;
  font-family: 'Quicksand', sans-serif;
  opacity: 0; transform: translateY(8px) scale(0.95);
  transition: all .3s ease;
  pointer-events: none; z-index: 10;
}
.lp-egg-hover-bubble::after {
  content: '';
  position: absolute; bottom: -10px; left: 30px;
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #fff;
}
.lp-egg-hover-bubble::before {
  content: '';
  position: absolute; bottom: -13px; left: 29px;
  width: 0; height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 13px solid #F0E6D0;
}
.lp-ai-agent-visual:hover .lp-egg-hover-bubble {
  opacity: 1; transform: translateY(0) scale(1);
}
/* Chat box UI — comic speech bubble */
.lp-ai-chatbox {
  flex: 1; background: #fff;
  border-radius: 28px; border: 1.5px solid #E0E0E0;
  box-shadow: 0 8px 40px rgba(0,0,0,.08);
  overflow: visible; position: relative;
}
.lp-ai-chatbox-inner {
  overflow: hidden; border-radius: 25px;
}
.lp-ai-chatbox-tail {
  position: absolute; left: -44px; top: 45%;
  width: 50px; height: 60px; z-index: 3;
}
.lp-ai-chatbox-tail svg {
  width: 50px; height: 60px; display: block;
}
.lp-ai-chatbox-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid #F0E6D0;
  background: #FFFDF5;
}
.lp-ai-chatbox-header-egg { width: 28px; height: auto; }
.lp-ai-chatbox-header-name {
  font-size: 16px; font-weight: 800; color: #1A1A2E;
  font-family: 'Quicksand', sans-serif;
}
.lp-ai-chatbox-header-badge {
  padding: 3px 10px; border-radius: 20px;
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  font-size: 10px; font-weight: 800; color: #1A1410;
  font-family: 'Quicksand', sans-serif;
  letter-spacing: 0.5px;
}
.lp-ai-chatbox-body { padding: 28px 24px; }
.lp-ai-chatbox-greeting {
  text-align: center; margin-bottom: 24px;
}
.lp-ai-chatbox-greeting h3 {
  font-size: 22px; font-weight: 900; color: #1A1A2E;
  font-family: 'Instrument Serif', serif; margin-bottom: 4px;
}
.lp-ai-chatbox-greeting p {
  font-size: 13px; color: #8A7040; font-weight: 600;
}
.lp-ai-chatbox-modes {
  display: flex; flex-direction: column; gap: 12px;
}
.lp-ai-chatbox-mode {
  padding: 16px 18px; border-radius: 16px;
  border: 1.5px solid transparent;
  transition: all .2s ease; cursor: default;
}
.lp-ai-chatbox-mode:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,.06);
}
.lp-ai-chatbox-mode-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}
.lp-ai-chatbox-mode-icon {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lp-ai-chatbox-mode-title {
  font-size: 15px; font-weight: 800;
  font-family: 'Quicksand', sans-serif;
}
.lp-ai-chatbox-mode-desc {
  font-size: 12px; color: #6B5A2E; font-weight: 600;
  line-height: 1.5; margin-bottom: 10px; padding-left: 42px;
}
.lp-ai-chatbox-mode-chips {
  display: flex; flex-wrap: wrap; gap: 6px; padding-left: 42px;
}
.lp-ai-chatbox-chip {
  padding: 4px 12px; border-radius: 10px;
  font-size: 11px; font-weight: 700;
  font-family: 'Quicksand', sans-serif;
  white-space: nowrap;
}
/* Agent mode — orange */
.lp-ai-mode-agent { background: #FFFBF0; border-color: #F0E6D0; }
.lp-ai-mode-agent .lp-ai-chatbox-mode-icon { background: linear-gradient(135deg, #F0A830, #D4A03C); }
.lp-ai-mode-agent .lp-ai-chatbox-mode-title { color: #C48830; }
.lp-ai-mode-agent .lp-ai-chatbox-chip { background: #FFF3E0; color: #C48830; }
/* Plan mode — pink */
.lp-ai-mode-plan { background: #FFF5F8; border-color: #F0D0DE; }
.lp-ai-mode-plan .lp-ai-chatbox-mode-icon { background: linear-gradient(135deg, #E04080, #C0306A); }
.lp-ai-mode-plan .lp-ai-chatbox-mode-title { color: #C0306A; }
.lp-ai-mode-plan .lp-ai-chatbox-chip { background: #FCE4EC; color: #C0306A; }
/* Ask mode — purple */
.lp-ai-mode-ask { background: #F8F5FF; border-color: #DDD0F0; }
.lp-ai-mode-ask .lp-ai-chatbox-mode-icon { background: linear-gradient(135deg, #7C4DFF, #5C38A0); }
.lp-ai-mode-ask .lp-ai-chatbox-mode-title { color: #5C38A0; }
.lp-ai-mode-ask .lp-ai-chatbox-chip { background: #EDE7F6; color: #5C38A0; }
/* Chat input bar */
.lp-ai-chatbox-input {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid #F0E6D0; background: #FFFDF5;
}
.lp-ai-chatbox-input-field {
  flex: 1; padding: 10px 16px; border-radius: 12px;
  border: 1.5px solid #F0E6D0; background: #fff;
  font-size: 13px; font-weight: 600; color: #8A7040;
  font-family: 'Quicksand', sans-serif;
  outline: none;
}
.lp-ai-chatbox-input-send {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #FFE082, #D4A03C);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s;
}
.lp-ai-chatbox-input-send:hover { transform: scale(1.05); }
/* Section label */
.lp-ai-agent-section-tag {
  text-align: center; margin-bottom: 48px;
}
.lp-ai-agent-glow {
  position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%);
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(196,136,48,.06) 0%, transparent 70%);
  pointer-events: none;
}
@media (max-width: 900px) {
  .lp-ai-agent-title h2 { font-size: 48px; }
  .lp-ai-agent-inner { flex-direction: column; }
  .lp-ai-agent-visual img { width: 220px; }
  .lp-ai-chatbox { max-width: 500px; margin: 0 auto; }
  .lp-ai-chatbox-tail { display: none; }
}
@media (max-width: 600px) {
  .lp-ai-agent { padding: 80px 24px; }
  .lp-ai-agent-title h2 { font-size: 36px; }
  .lp-ai-agent-visual img { width: 180px; }
  .lp-ai-chatbox-body { padding: 20px 16px; }
  .lp-ai-chatbox-greeting h3 { font-size: 18px; }
  .lp-ai-chatbox-mode { padding: 12px 14px; }
  .lp-ai-chatbox-mode-desc { padding-left: 0; }
  .lp-ai-chatbox-mode-chips { padding-left: 0; }
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

/* Responsive */
@media (max-width: 900px) {
  .lp-hero-h1 { font-size: 72px; }
  .lp-hero-sub { max-width: 100%; }
  .lp-features-grid { grid-template-columns: 1fr; }
  .lp-features-header { flex-direction: column; }
  .lp-features-header-illustration { display: none; }
  .lp-app-mockup-inner { flex-direction: column; text-align: center; gap: 48px; }
  .lp-app-mockup-desc { margin-left: auto; margin-right: auto; }
  .lp-app-store-btns { justify-content: center; }
  .lp-steps { flex-direction: column; align-items: center; }
  .lp-step-connector { display: none; }
  .lp-stats-inner { flex-wrap: wrap; gap: 32px; }
  .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-nav { padding: 0 20px; }
  .lp-nav-links .lp-nav-link { display: none; }
}
@media (max-width: 600px) {
  .lp-hero { padding: 90px 24px 60px; }
  .lp-hero-h1 { font-size: 52px; }
  .lp-emblem-slide { padding: 0 24px 60px; }
  .lp-emblem-slide img { max-height: 420px; }
  .lp-hero-ctas { flex-direction: column; width: 100%; }
  .lp-hero-btn-primary, .lp-hero-btn-secondary { width: 100%; text-align: center; }
  .lp-section-h2 { font-size: 32px; }
  .lp-cta-h2 { font-size: 32px; }
  .lp-trust-grid { grid-template-columns: 1fr; }
  .lp-app-mockup-phone { width: 300px; height: 380px; }
  .lp-app-store-btns { flex-direction: column; }
  .lp-app-mockup-h2 { font-size: 36px; }
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
  { num: '1', icon: <GoldenEgg size={36} />, title: 'Hatch Your Account', desc: 'Sign up in seconds. Your golden goose journey begins with a single step.' },
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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-root" ref={rootRef}>
      <style>{LANDING_STYLES}</style>

      {/* ── Navbar ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-logo">
          <GoldenEgg size={28} />
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
              <GoldenEgg size={12} /> Golden Features
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

      {/* ── AI Agent ── */}
      <section className="lp-ai-agent">
        <div className="lp-ai-agent-glow" />
        <div className="lp-ai-agent-title">
          <h2>Your <span>AI Trading Agent</span></h2>
          <p>Let your golden goose think for you. Hatch AI analyzes markets, builds strategies, and executes trades — so you don't have to.</p>
        </div>
        <div className="lp-ai-agent-inner">
          <div className="lp-ai-agent-visual">
            <div className="lp-egg-hover-bubble">Let's hatch a plan together!</div>
            <img src="/golden-egg-ai.png?v=2" alt="Hatch AI Golden Egg" />
          </div>

          <div className="lp-ai-chatbox">
            <div className="lp-ai-chatbox-tail">
              <svg viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20 C40 20, 20 18, 2 35 C18 30, 38 34, 50 40" fill="#fff" stroke="#E0E0E0" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M49 21 C40 21, 22 19, 6 34 C20 30, 38 34, 49 39" fill="#fff" stroke="none" />
              </svg>
            </div>
            <div className="lp-ai-chatbox-inner">
            {/* Chat header */}
            <div className="lp-ai-chatbox-header">
              <span className="lp-ai-chatbox-header-name">Hatch AI</span>
              <span className="lp-ai-chatbox-header-badge">Agent</span>
            </div>

            {/* Chat body */}
            <div className="lp-ai-chatbox-body">
              <div className="lp-ai-chatbox-greeting">
                <h3>What can I help with?</h3>
                <p>Choose a mode to get started</p>
              </div>

              <div className="lp-ai-chatbox-modes">
                {/* Agent Mode */}
                <div className="lp-ai-chatbox-mode lp-ai-mode-agent">
                  <div className="lp-ai-chatbox-mode-head">
                    <div className="lp-ai-chatbox-mode-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.8 5.8L14.5 6.5L11.2 9.7L12 14.3L8 12.1L4 14.3L4.8 9.7L1.5 6.5L6.2 5.8L8 1.5Z" fill="#fff"/></svg>
                    </div>
                    <span className="lp-ai-chatbox-mode-title">Agent Mode</span>
                  </div>
                  <div className="lp-ai-chatbox-mode-desc">
                    I'll analyze your portfolio and take actions autonomously. Execute trades, rebalance, hedge — I handle it.
                  </div>
                  <div className="lp-ai-chatbox-mode-chips">
                    <span className="lp-ai-chatbox-chip">Rebalance for current macro</span>
                    <span className="lp-ai-chatbox-chip">Execute best trades now</span>
                    <span className="lp-ai-chatbox-chip">Hedge my downside risk</span>
                  </div>
                </div>

                {/* Plan Mode */}
                <div className="lp-ai-chatbox-mode lp-ai-mode-plan">
                  <div className="lp-ai-chatbox-mode-head">
                    <div className="lp-ai-chatbox-mode-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5" fill="none"/><path d="M8 4.5V8L10.5 10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <span className="lp-ai-chatbox-mode-title">Plan Mode</span>
                  </div>
                  <div className="lp-ai-chatbox-mode-desc">
                    I'll create a detailed step-by-step strategy for your review. No execution until you approve.
                  </div>
                  <div className="lp-ai-chatbox-mode-chips">
                    <span className="lp-ai-chatbox-chip">Build a Q1 strategy</span>
                    <span className="lp-ai-chatbox-chip">Plan sector rotation</span>
                    <span className="lp-ai-chatbox-chip">Design a hedging plan</span>
                  </div>
                </div>

                {/* Ask Mode */}
                <div className="lp-ai-chatbox-mode lp-ai-mode-ask">
                  <div className="lp-ai-chatbox-mode-head">
                    <div className="lp-ai-chatbox-mode-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5" fill="none"/><path d="M6 6C6 4.8 6.9 4 8 4S10 4.8 10 6C10 7.2 8 7.5 8 8.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11" r=".7" fill="#fff"/></svg>
                    </div>
                    <span className="lp-ai-chatbox-mode-title">Ask Mode</span>
                  </div>
                  <div className="lp-ai-chatbox-mode-desc">
                    I'll research and explain. Market insights, portfolio analysis, education — no trades, just answers.
                  </div>
                  <div className="lp-ai-chatbox-mode-chips">
                    <span className="lp-ai-chatbox-chip">Why is my Sharpe low?</span>
                    <span className="lp-ai-chatbox-chip">Explain macro regime</span>
                    <span className="lp-ai-chatbox-chip">What drives gold prices?</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="lp-ai-chatbox-input">
              <div className="lp-ai-chatbox-input-field">Tell Hatch what to do...</div>
              <button className="lp-ai-chatbox-input-send">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="#1A1410" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            </div>{/* end lp-ai-chatbox-inner */}
          </div>
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

      {/* ── App Mockup ── */}
      <section className="lp-app-mockup">
        <div className="lp-app-mockup-inner">
          <div className="lp-app-mockup-text">
            <div className="lp-app-mockup-tag">
              <GoldenEgg size={12} /> Available Now
            </div>
            <h2 className="lp-app-mockup-h2">
              Your nest egg,<br />right in your <span>pocket.</span>
            </h2>
            <p className="lp-app-mockup-desc">
              Track macro regimes, monitor key indicators, and manage your
              baskets on the go. Download Hatch and never miss a golden opportunity.
            </p>
            <div className="lp-app-store-btns">
              <a className="lp-store-btn" href="#" onClick={e => e.preventDefault()}>
                <span className="lp-store-btn-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M19.8 14.5c0-3.2 2.6-4.7 2.7-4.8-1.5-2.2-3.8-2.5-4.6-2.5-2-.2-3.8 1.2-4.8 1.2s-2.5-1.1-4.1-1.1c-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.4 1.5 12.5 1 1.5 2.3 3.2 3.9 3.1 1.6-.1 2.2-1 4.1-1s2.4 1 4.1 1 2.7-1.5 3.7-3c1.2-1.7 1.6-3.3 1.7-3.4-.1 0-3.1-1.3-3.1-4.9zM17 5.3c.9-1 1.4-2.5 1.3-3.9-1.2 0-2.7.8-3.6 1.9-.8.9-1.5 2.4-1.3 3.8 1.3.1 2.7-.7 3.6-1.8z" fill="#FFFEF5"/>
                  </svg>
                </span>
                <span className="lp-store-btn-text">
                  <span className="lp-store-btn-label">Download on the</span>
                  <span className="lp-store-btn-name">App Store</span>
                </span>
              </a>
              <a className="lp-store-btn" href="#" onClick={e => e.preventDefault()}>
                <span className="lp-store-btn-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4.3 2.5L15.6 14 4.3 25.5c-.2-.3-.3-.7-.3-1.1V3.6c0-.4.1-.8.3-1.1zm1.4-1.4L18 10.8l-2.9 2.9L5.7 1.1zM19.2 12l3.2 1.8c.8.5.8 1.2 0 1.6l-3.2 1.8-3.2-3.2 3.2-3zM5.7 26.9l9.4-12.6 2.9 2.9-12.3 9.7z" fill="#FFFEF5"/>
                  </svg>
                </span>
                <span className="lp-store-btn-text">
                  <span className="lp-store-btn-label">Get it on</span>
                  <span className="lp-store-btn-name">Google Play</span>
                </span>
              </a>
            </div>
          </div>
          <div className="lp-app-mockup-phone">
            <img src="/app-screenshot.png" alt="Hatch App - Macro Dashboard" />
          </div>
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
              <GoldenEgg size={22} />
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
