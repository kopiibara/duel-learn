import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserContextProvider } from '../context/userContext.jsx'; // Import UserContextProvider
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider> {/* Wrap App with UserContextProvider */}
      <App />
    </UserContextProvider>
  </StrictMode>,
);