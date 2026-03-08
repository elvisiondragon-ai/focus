import { Suspense, lazy } from 'react';

// --- 1. THE NUKE SNIPPET (Cache Busting) ---
const APP_VERSION = '2026.03.08.18'; // Force update version

if (localStorage.getItem('v_cache') !== APP_VERSION) {
  // 1. Clear Service Workers (Safe Check)
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      if (regs && regs.forEach) regs.forEach(r => r.unregister());
    }).catch(() => {});
  }

  // 2. Clear all Browser Caches (Safe Check)
  if (typeof window !== 'undefined' && window.caches) {
    window.caches.keys().then(names => {
      if (names && names.forEach) names.forEach(n => window.caches.delete(n));
    }).catch(() => {});
  }

  // 3. Update version and Hard Reload
  localStorage.setItem('v_cache', APP_VERSION);
  window.location.reload();
}

// --- 2. ROUTE-BASED CODE SPLITTING (Lazy Loading) ---
const TheBump = lazy(() => import('./TheBump.tsx'));

const LoadingFallback = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: '#020617', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#7dd3fc',
    fontFamily: 'Georgia, serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>◎</div>
      <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase' }}>Loading eL Vision</div>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TheBump />
    </Suspense>
  );
}

export default App;
