import { useState } from 'react'
import { login as apiLogin } from '../services/api'

interface Props {
  onLogin: (accessToken: string) => void
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Complete todos los campos'); return }
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      onLogin(res.accessToken)
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0D2E5A 0%, #1B5FAE 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur mb-4">
            <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="20" r="10" stroke="#29ABE2" strokeWidth="3" fill="none"/>
              <path d="M22 30 Q10 36 10 52" stroke="#29ABE2" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M42 30 Q54 36 54 52" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="54" cy="54" r="4" fill="#29ABE2"/>
              <line x1="29" y1="16" x2="35" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="13" x2="32" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">IPS Clinical House</h1>
          <p className="text-sm mt-1" style={{ color: '#29ABE2' }}>Módulo Dispensador de Turnos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-center mb-1" style={{ color: '#0D2E5A' }}>Acceso al Sistema</h2>
          <p className="text-sm text-center text-gray-400 mb-6">Ingresa con tu cuenta de dispensador</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-1" style={{ color: '#0D2E5A' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dispensador@clinicalhouse.com"
              autoComplete="email"
              className="w-full border rounded-xl px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: '#D1D9E0', color: '#0D2E5A' }}
              onFocus={e => e.currentTarget.style.borderColor = '#1B5FAE'}
              onBlur={e => e.currentTarget.style.borderColor = '#D1D9E0'}
            />

            <label className="block text-sm font-medium mb-1" style={{ color: '#0D2E5A' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full border rounded-xl px-4 py-3 mb-6 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: '#D1D9E0', color: '#0D2E5A' }}
              onFocus={e => e.currentTarget.style.borderColor = '#1B5FAE'}
              onBlur={e => e.currentTarget.style.borderColor = '#D1D9E0'}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#1B5FAE' }}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Una Experiencia de Atención
        </p>
      </div>
    </div>
  )
}
