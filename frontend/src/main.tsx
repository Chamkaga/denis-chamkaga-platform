import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Initialize i18n BEFORE React renders so all components get the correct language
import './i18n/config'
import App from './App.tsx'

// Apply saved language preference before first paint
const savedLang = localStorage.getItem('language-preference');
if (savedLang === 'sw' || savedLang === 'en') {
  import('i18next').then(({ default: i18n }) => {
    i18n.changeLanguage(savedLang);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
