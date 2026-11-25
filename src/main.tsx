import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline PWA execution & foreground update checks
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

createRoot(document.getElementById('root')!).render(<App />);
