import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!isFirebaseConfigured) {
      try { return JSON.parse(localStorage.getItem('localUser')); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup(email, password) {
    if (!isFirebaseConfigured) {
      const localUser = { email, displayName: email.split('@')[0], uid: 'local-' + Date.now() };
      setUser(localUser);
      localStorage.setItem('localUser', JSON.stringify(localUser));
      return { user: localUser };
    }
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email, password) {
    if (!isFirebaseConfigured) {
      const localUser = { email, displayName: email.split('@')[0], uid: 'local-' + Date.now() };
      setUser(localUser);
      localStorage.setItem('localUser', JSON.stringify(localUser));
      return { user: localUser };
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!isFirebaseConfigured) {
      setUser(null);
      localStorage.removeItem('localUser');
      return;
    }
    return signOut(auth);
  }

  const value = { user, loading, signup, login, logout, isFirebaseConfigured };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
