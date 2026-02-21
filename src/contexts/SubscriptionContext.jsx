import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionService } from '../services/subscriptionService';
import { isFirebaseConfigured } from '../firebase';

const SubscriptionContext = createContext(null);

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [tier, setTier] = useState('free');
  const [activeTier, setActiveTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('loading');
  const [needsTierSelection, setNeedsTierSelection] = useState(false);

  // Fetch subscription on user change
  useEffect(() => {
    if (!user?.uid) {
      setTier('free');
      setActiveTier('free');
      setSubscriptionStatus('none');
      setNeedsTierSelection(false);
      return;
    }

    let cancelled = false;
    SubscriptionService.getSubscription(user.uid).then(sub => {
      if (cancelled) return;
      if (sub) {
        setTier(sub.tier || 'free');
        setSubscriptionStatus(sub.status || 'none');
        setActiveTier(sub.tier || 'free');
        setNeedsTierSelection(false);
      } else {
        // No subscription doc = new user, show tier selection
        setTier('free');
        setSubscriptionStatus('none');
        setNeedsTierSelection(true);
      }
    });

    return () => { cancelled = true; };
  }, [user?.uid]);

  // Real-time Firestore listener for webhook updates
  useEffect(() => {
    if (!user?.uid) return;
    return SubscriptionService.onSubscriptionChange(user.uid, (sub) => {
      if (sub) {
        setTier(sub.tier || 'free');
        setSubscriptionStatus(sub.status || 'none');
        if (sub.tier === 'options_pro' && sub.status === 'active') {
          setNeedsTierSelection(false);
        }
      }
    });
  }, [user?.uid]);

  // Check URL params for checkout success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const openCheckout = useCallback(async () => {
    if (!user?.uid) return;

    // Dev/demo mode: simulate subscription if no Cloud Functions configured
    if (!import.meta.env.VITE_CLOUD_FUNCTIONS_BASE) {
      await SubscriptionService.simulateSubscription(user.uid, 'options_pro');
      setTier('options_pro');
      setSubscriptionStatus('active');
      setActiveTier('options_pro');
      setNeedsTierSelection(false);
      return;
    }

    const url = await SubscriptionService.createCheckoutSession(user.uid, user.email);
    if (url) window.open(url, '_blank');
  }, [user?.uid, user?.email]);

  const manageBilling = useCallback(async () => {
    if (!user?.uid) return;
    const url = await SubscriptionService.createPortalSession(user.uid);
    if (url) window.open(url, '_blank');
  }, [user?.uid]);

  const switchTier = useCallback((targetTier) => {
    if (targetTier === 'options_pro' && tier !== 'options_pro') return;
    setActiveTier(targetTier);
  }, [tier]);

  const dismissTierSelection = useCallback(() => {
    setNeedsTierSelection(false);
    // Mark that user has seen tier selection (persist in localStorage)
    if (user?.uid) {
      localStorage.setItem(`tierSelSeen_${user.uid}`, 'true');
    }
  }, [user?.uid]);

  const isPro = tier === 'options_pro' && subscriptionStatus === 'active';
  const isLoading = subscriptionStatus === 'loading';

  const value = {
    tier,
    activeTier,
    subscriptionStatus,
    isPro,
    isLoading,
    needsTierSelection,
    openCheckout,
    manageBilling,
    switchTier,
    setActiveTier,
    dismissTierSelection,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
