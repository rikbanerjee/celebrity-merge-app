import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../App.jsx'
import AuthWrapper from './AuthWrapper.jsx'
import './index.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </React.StrictMode>
  )
}
