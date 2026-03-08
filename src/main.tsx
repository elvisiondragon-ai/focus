import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Clean up cache-busting URL parameter if it exists to keep address bar clean
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  if (url.searchParams.has('v') || url.searchParams.has('ios_cache_bust')) {
    url.searchParams.delete('v');
    url.searchParams.delete('ios_cache_bust');
    const cleanUrl = url.pathname + url.search + url.hash;
    window.history.replaceState({}, '', cleanUrl === '' ? '/' : cleanUrl);
  }
}

const APP_VERSION = '2026.03.08.04'; // UI adjustments, URL cleanup, Guest Login button

// Execute aggressive cache clearing before React mounts if versions mismatch
if (localStorage.getItem('v_cache') !== APP_VERSION) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 1. Clear all Service Workers
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            if (regs) regs.forEach(r => r.unregister());
        }).catch(e => console.warn("SW Clear Error:", e));
    }

    // 2. Clear all Browser Caches
    if ('caches' in window && window.caches) {
        caches.keys().then(names => {
            if (names) names.forEach(name => caches.delete(name));
        }).catch(e => console.warn("Caches Clear Error:", e));
    }

    // 3. Update version and force nuclear reload
    localStorage.setItem('v_cache', APP_VERSION);

    const currentUrl = window.location.href.split('?')[0];

    if (isIOS) {
        setTimeout(() => {
            (window.location as any).reload(true);
        }, 500);
    } else {
        window.location.replace(`${currentUrl}?v=${new Date().getTime()}`);
    }
}

document.title = "eL Focus";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
