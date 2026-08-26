import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BRAND } from './config/brand'
import './index.css'

// The tab title is part of the branding surface, so it comes from config too.
document.title = `${BRAND.displayName} — Confidential support`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
