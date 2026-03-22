import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Register PWA service worker when available
if ('serviceWorker' in navigator) {
  try {
    // @ts-expect-error — virtual:pwa-register is injected by vite-plugin-pwa at build time
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ immediate: true })
    }).catch(() => {
      // Not available in dev mode — safe to ignore
    })
  } catch {
    // Not available in dev mode — safe to ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
