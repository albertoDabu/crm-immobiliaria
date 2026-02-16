import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LucideLogIn, LucideEye, LucideEyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        alert('¡Cuenta creada! Revisa tu email para confirmar.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LucideLogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Inmobiliaria</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Crear nueva cuenta' : 'Accede a tu cuenta'}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <LucideEyeOff size={20} /> : <LucideEye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Cargando...</>
              ) : (
                <>
                  <LucideLogIn size={20} />
                  {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </>
              )}
            </button>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Plataforma segura protegida con Supabase Auth
        </p>
      </div>
    </div>
  )
}
