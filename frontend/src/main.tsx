import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.scss";
import "./App.scss";
import App from './App.tsx'
import PublicBudgetPage from './PublicBudgetPage.tsx'
import AppProviders from './app/providers/AppProviders.tsx'

const path = window.location.pathname
const match = path.match(/^\/presupuesto\/([^/]+)$/) || path.match(/^\/budget\/([^/]+)$/)
const budgetId = match ? match[1] : null
const isWidgetMode = import.meta.env.VITE_BUILD_TARGET === 'widget'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders mode={isWidgetMode ? 'widget' : 'app'}>
      {isWidgetMode ? <App /> : budgetId ? <PublicBudgetPage budgetId={budgetId} /> : <App />}
    </AppProviders>
  </StrictMode>,
)
