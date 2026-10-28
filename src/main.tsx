import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TaskFlow } from './prototype/TaskFlow'
import { ConceptPanel } from './prototype/ConceptPanel'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <TaskFlow />
    <ConceptPanel />
  </StrictMode>,
)
