import { useState, useEffect } from 'react';
import { setToken, getToken, login as apiLogin } from './services/api';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

type Step = 'login' | 'dashboard';

const SEDE_ID = 1;

export default function App() {
  const [step, setStep] = useState<Step>('login');

  useEffect(() => {
    const stored = localStorage.getItem('atencion_token');
    if (stored) {
      setToken(stored);
      setStep('dashboard');
    }
  }, []);

  const handleLogin = async (accessToken: string) => {
    setToken(accessToken);
    localStorage.setItem('atencion_token', accessToken);
    setStep('dashboard');
  };

  const handleLogout = () => {
    disconnectSocket();
    setToken(null);
    localStorage.removeItem('atencion_token');
    setStep('login');
  };

  const socket = step === 'dashboard' && getToken()
    ? (getSocket() ?? connectSocket(getToken()!, 1))
    : null;

  if (step === 'login') return <Login onLogin={handleLogin} />;
  return <Dashboard socket={socket} sedeId={SEDE_ID} onLogout={handleLogout} />;
}
