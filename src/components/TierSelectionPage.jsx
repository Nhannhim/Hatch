import React, { useState } from 'react';
import { Icon } from './Icons';
import { useSubscription } from '../contexts/SubscriptionContext';

const TIERS = [
  {
    id: 'free',
    name: 'Hatch Free',
    icon: '🥚',
    price: '$0',
    period: 'forever',
    color: '#C48830',
    features: [
      { icon: 'basket', text: 'Portfolio tracking & baskets' },
      { icon: 'chart-up', text: 'Live stock prices' },
      { icon: 'flask', text: 'Risk Lab & macro analysis' },
      { icon: 'sparkle', text: 'AI-powered signals' },
      { icon: 'newspaper', text: 'Market news feed' },
    ],
  },
  {
    id: 'options_pro',
    name: 'Options Pro',
    icon: '🪙',
    price: '$9.99',
    period: '/month',
    color: '#7B8FA0',
    badge: 'PLATINUM',
    features: [
      { icon: 'check', text: 'Everything in Free, plus:' },
      { icon: 'list', text: 'Real-time options chains' },
      { icon: 'chart-bar', text: 'Greeks & IV analysis' },
      { icon: 'target', text: 'Options position tracker' },
      { icon: 'money', text: 'Options P&L analytics' },
    ],
  },
];

export default function TierSelectionPage({ onSelectFree, showBack, onBack }) {
  const { openCheckout } = useSubscription();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    if (selected === 'free') {
      onSelectFree?.();
      return;
    }
    setLoading(true);
    try {
      await openCheckout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Quicksand',sans-serif",
      background: "linear-gradient(180deg, #FFF9E6 0%, #FFFDF5 50%, #FFF8EE 100%)",
      height: "100%",
      width: "100%",
      maxWidth: 430,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <div style={{ padding: "0 20px 40px", flex: 1 }}>
        {/* Back button */}
        {showBack && (
          <button onClick={onBack} style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "12px 0 0", background: "none", border: "none",
            fontSize: 15, fontWeight: 700, color: "#8A7040", cursor: "pointer",
          }}>
            <span style={{ fontSize: 18 }}>←</span> Back
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 8, animation: "popIn .5s ease both" }}>🐣</div>
          <h1 style={{
            fontSize: 28, fontWeight: 900, margin: 0,
            fontFamily: "'Instrument Serif', serif",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Choose Your Plan</h1>
          <p style={{
            fontSize: 14, color: "#8A7040", fontWeight: 600,
            margin: "6px 0 0", lineHeight: 1.4,
          }}>
            Start free or unlock advanced options trading
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TIERS.map((tier, i) => {
            const isSelected = selected === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelected(tier.id)}
                style={{
                  position: "relative",
                  background: "#fff",
                  borderRadius: 18,
                  padding: "18px 16px",
                  cursor: "pointer",
                  border: isSelected
                    ? `2.5px solid ${tier.color}`
                    : "2px solid #F0E6D0",
                  boxShadow: isSelected
                    ? `0 4px 20px ${tier.color}25`
                    : "0 2px 8px rgba(0,0,0,.04)",
                  transition: "all .2s ease",
                  animation: `fadeUp .4s ease ${i * 0.1}s both`,
                }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div style={{
                    position: "absolute", top: -10, right: 16,
                    background: "linear-gradient(135deg, #7B8FA0, #556B7A)",
                    color: "#fff", fontSize: 10, fontWeight: 900,
                    padding: "4px 10px", borderRadius: 8,
                    letterSpacing: 1,
                  }}>
                    {tier.badge}
                  </div>
                )}

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: tier.color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>
                    {tier.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 18, fontWeight: 900,
                      fontFamily: "'Instrument Serif', serif",
                      color: "#333334",
                    }}>
                      {tier.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: 26, fontWeight: 900,
                      fontFamily: "'Instrument Serif', serif",
                      color: tier.color,
                    }}>
                      {tier.price}
                    </span>
                    <div style={{ fontSize: 11, color: "#8A7040", fontWeight: 600 }}>
                      {tier.period}
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 8,
                        background: tier.color + "12",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon name={f.icon} size={13} color={tier.color} />
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: "#5C4A1E",
                        lineHeight: 1.3,
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Selection indicator */}
                <div style={{
                  position: "absolute", top: 18, right: 16,
                  width: 22, height: 22, borderRadius: "50%",
                  border: isSelected ? `2px solid ${tier.color}` : "2px solid #E8DCC8",
                  background: isSelected ? tier.color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .2s ease",
                }}>
                  {isSelected && (
                    <Icon name="check" size={12} color="#fff" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <button
          disabled={!selected || loading}
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 16,
            border: "none",
            background: selected
              ? selected === 'options_pro'
                ? "linear-gradient(135deg, #7B8FA0, #556B7A)"
                : "linear-gradient(135deg, #C48830, #8B6914)"
              : "#E8DCC8",
            color: selected ? "#fff" : "#A09080",
            fontSize: 17,
            fontWeight: 900,
            fontFamily: "'Instrument Serif', serif",
            cursor: selected ? "pointer" : "not-allowed",
            marginTop: 20,
            opacity: loading ? 0.7 : 1,
            letterSpacing: 0.5,
          }}
        >
          {loading
            ? "Processing..."
            : selected === "options_pro"
              ? "Subscribe & Start Trading"
              : selected === "free"
                ? "Continue with Free"
                : "Select a Plan"}
        </button>

        {/* Fine print */}
        {selected === "options_pro" && (
          <p style={{
            fontSize: 11, color: "#A09080", textAlign: "center",
            marginTop: 10, lineHeight: 1.4, fontWeight: 500,
          }}>
            Cancel anytime. You'll be redirected to secure checkout.
          </p>
        )}
      </div>
    </div>
  );
}
