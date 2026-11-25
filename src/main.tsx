import {Capacitor} from '@capacitor/core';
import {StatusBar, Style} from '@capacitor/status-bar';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (Capacitor.isNativePlatform()) {
  // Configure Android native status bar so it never collides with app chrome
  void (async () => {
    try {
      await StatusBar.setOverlaysWebView({overlay: false});
      await StatusBar.setStyle({style: Style.Dark});
      await StatusBar.setBackgroundColor({color: '#0A0E17'});
    } catch {
      // Safe no-op on Android 15+ where SystemBars insetsHandling='css' applies automatically
    }
  })();
} else {
  // Register Service Worker for offline PWA execution & foreground update checks on browsers
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration || typeof document === 'undefined') return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update().catch(() => {});
        }
      });
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
