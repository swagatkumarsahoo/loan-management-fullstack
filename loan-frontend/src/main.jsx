import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#222840',
            color: '#E8EAF0',
            border: '1px solid #333B55',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00C37A', secondary: '#0D0F14' } },
          error:   { iconTheme: { primary: '#FF4D6D', secondary: '#0D0F14' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
