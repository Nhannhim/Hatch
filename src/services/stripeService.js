const FUNCTIONS_BASE = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE || '';

export class StripeService {
  static async createCheckoutSession(uid, email) {
    if (!FUNCTIONS_BASE) {
      console.warn('[Stripe] No Cloud Functions base URL configured. Using dev/demo mode.');
      return null;
    }
    const res = await fetch(`${FUNCTIONS_BASE}/createCheckoutSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        email,
        successUrl: window.location.origin + '/?checkout=success',
        cancelUrl: window.location.origin + '/?checkout=canceled',
      }),
    });
    if (!res.ok) throw new Error('Failed to create checkout session');
    const data = await res.json();
    return data.url;
  }

  static async createPortalSession(uid) {
    if (!FUNCTIONS_BASE) return null;
    const res = await fetch(`${FUNCTIONS_BASE}/createPortalSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    if (!res.ok) throw new Error('Failed to create portal session');
    const data = await res.json();
    return data.url;
  }
}
