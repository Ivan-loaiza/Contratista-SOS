import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'                 // alias @ → src
import '@/styles/global.css'            // carga Tailwind v4

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
