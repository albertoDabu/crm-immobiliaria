import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

// Componente que maneja el routing autenticado
function AppWithAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return user ? <App /> : <Login />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  </StrictMode>,
)
