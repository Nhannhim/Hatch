import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { Capacitor } from '@capacitor/core'

// Native platform setup
if (Capacitor.isNativePlatform()) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: '#FFFEF9' });
  }).catch(() => {});
  import('@capacitor/keyboard').then(({ Keyboard }) => {
    Keyboard.setAccessoryBarVisible({ isVisible: false });
  }).catch(() => {});
  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    SplashScreen.hide();
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <App />
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>,
)
