import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { MembersProvider } from './context/MembersContext'
import { ReservasProvider } from './context/ReservasContext'
import { AcademicProvider } from './context/AcademicContext'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AcademicProvider>
        <MembersProvider>
          <ReservasProvider>
            {children}
          </ReservasProvider>
        </MembersProvider>
      </AcademicProvider>
    </AuthProvider>
  )
}

// Always mount into a fresh element so createRoot never sees a previously-used container,
// regardless of how many times this module is re-executed by HMR or the proxy.
const shell = document.getElementById('root')!
shell.innerHTML = ''
const mount = document.createElement('div')
shell.appendChild(mount)

ReactDOM.createRoot(mount).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
)
