import { useState } from 'react'
import { Sede, Servicio, Turno, crearTurno } from './services/api'
import SelectSede from './pages/SelectSede'
import SelectService from './pages/SelectService'
import EnterName from './pages/EnterName'
import EnterCedula from './pages/EnterCedula'
import Ticket from './pages/Ticket'

type Step = 'select-sede' | 'select-service' | 'enter-name' | 'enter-cedula' | 'ticket'

export default function App() {
  const [step, setStep] = useState<Step>('select-sede')
  const [sede, setSede] = useState<Sede | null>(null)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [nombre, setNombre] = useState('')
  const [turno, setTurno] = useState<Turno | null>(null)

  const handleSedeSelected = (s: Sede) => {
    setSede(s)
    setStep('select-service')
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
    case 'select-sede':
      return <SelectSede onSelect={handleSedeSelected} />
    case 'select-service':
      return <SelectService sedeId={sede!.id} onSelect={handleServiceSelected} onBack={() => setStep('select-sede')} />
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
