import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Initializing application...')
const rootElement = document.getElementById('root')
console.log('Root element found:', rootElement)

if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <>
    <App />
  </>
)