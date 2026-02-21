import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const FUNCTIONS_BASE = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE || '';

export class SubscriptionService {
  static async getSubscription(uid) {
    if (!isFirebaseConfigured || !db) {
      try {
        return JSON.parse(localStorage.getItem(`sub_${uid}`));
      } catch { return null; }
    }
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().subscription || null : null;
    } catch (e) {
      console.warn('[Subscription] Fetch failed:', e.message);
      try {
        return JSON.parse(localStorage.getItem(`sub_${uid}`));
      } catch { return null; }
    }
  }

  static onSubscriptionChange(uid, callback) {
    if (!isFirebaseConfigured || !db) return () => {};
    try {
      const docRef = doc(db, 'users', uid);
      return onSnapshot(docRef, (snap) => {
        callback(snap.exists() ? snap.data().subscription || null : null);
      });
    } catch {
      return () => {};
    }
  }

  static async createCheckoutSession(uid, email) {
    if (!FUNCTIONS_BASE) {
      console.warn('[Subscription] No Cloud Functions base URL configured');
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
    const data = await res.json();
    return data.url;
  }

  // localStorage fallback for dev/demo mode
  static async simulateSubscription(uid, tier) {
    const sub = { tier, status: 'active', createdAt: new Date().toISOString() };
    localStorage.setItem(`sub_${uid}`, JSON.stringify(sub));
    return sub;
  }

  static async clearSimulatedSubscription(uid) {
    localStorage.removeItem(`sub_${uid}`);
  }
}
