import { useState, useEffect } from 'react'
import { setToken, getToken, login as apiLogin, getJwtPayload, getSede, Sede, Servicio, Turno, crearTurno } from './services/api'
import Login from './pages/Login'
import SelectService from './pages/SelectService'
import EnterName from './pages/EnterName'
import EnterCedula from './pages/EnterCedula'
import Ticket from './pages/Ticket'

type Step = 'login' | 'select-service' | 'enter-name' | 'enter-cedula' | 'ticket'

export default function App() {
  const [step, setStep] = useState<Step>('login')
  const [sede, setSede] = useState<Sede | null>(null)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [nombre, setNombre] = useState('')
  const [turno, setTurno] = useState<Turno | null>(null)

  // Restaurar sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem('dispensador_token')
    if (stored) {
      setToken(stored)
      const payload = getJwtPayload(stored)
      if (payload?.sedeId) {
        getSede(payload.sedeId)
          .then(s => { setSede(s); setStep('select-service') })
          .catch(() => { localStorage.removeItem('dispensador_token') })
      }
    }
  }, [])

  const handleLogin = async (accessToken: string) => {
    setToken(accessToken)
    localStorage.setItem('dispensador_token', accessToken)
    const payload = getJwtPayload(accessToken)
    if (!payload?.sedeId) {
      alert('Este usuario no tiene sede asignada. Contacta al administrador.')
      setToken(null)
      localStorage.removeItem('dispensador_token')
      return
    }
    const s = await getSede(payload.sedeId)
    setSede(s)
    setStep('select-service')
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('dispensador_token')
    setSede(null)
    setServicio(null)
    setNombre('')
    setTurno(null)
    setStep('login')
  }

  const handleServiceSelected = (s: Servicio) => {
    setServicio(s)
    setStep('enter-name')
  }

  const handleNameConfirmed = (name: string) => {
    setNombre(name)
    setStep('enter-cedula')
  }

  const handleCedulaConfirmed = async (cedula: string) => {
    if (!servicio) return
    const t = await crearTurno(servicio.id, cedula, nombre)
    setTurno(t)
    setStep('ticket')
  }

  const handleReset = () => {
    setServicio(null)
    setNombre('')
    setTurno(null)
    setStep('select-service')
  }

  switch (step) {
    case 'login':
      return <Login onLogin={handleLogin} />
    case 'select-service':
      return (
        <SelectService
          sedeId={sede!.id}
          sedeName={sede!.nombre}
          onSelect={handleServiceSelected}
          onLogout={handleLogout}
        />
      )
    case 'enter-name':
      return (
        <EnterName
          servicio={servicio!}
          onBack={() => setStep('select-service')}
          onConfirm={handleNameConfirmed}
        />
      )
    case 'enter-cedula':
      return (
        <EnterCedula
          servicio={servicio!}
          nombre={nombre}
          onBack={() => setStep('enter-name')}
          onConfirm={handleCedulaConfirmed}
        />
      )
    case 'ticket':
      return <Ticket turno={turno!} onReset={handleReset} />
  }
}
