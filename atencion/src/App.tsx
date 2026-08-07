import { useState, useEffect } from 'react';
import { setToken, getToken, login as apiLogin, getJwtPayload } from './services/api';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';
import { Socket } from 'socket.io-client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

type Step = 'login' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('login');
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Recuperar sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem('atencion_token');
    if (stored) {
      setToken(stored);
      const payload = getJwtPayload(stored);
      if (payload?.sedeId) setSedeId(payload.sedeId);
      setStep('dashboard');
    }
  }, []);

  // Conectar socket cuando estemos en el dashboard
  useEffect(() => {
    if (step !== 'dashboard' || !sedeId) return;
    const token = getToken();
    if (!token) return;

    disconnectSocket();
    const newSocket = connectSocket(token);
    setSocket(newSocket);
    
    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, [step, sedeId]);

  const handleLogin = async (accessToken: string) => {
    setToken(accessToken);
    localStorage.setItem('atencion_token', accessToken);
    const payload = getJwtPayload(accessToken);
    if (payload?.sedeId) setSedeId(payload.sedeId);
    setStep('dashboard');
  };

  const handleLogout = () => {
    disconnectSocket();
    setSocket(null);
    setToken(null);
    setSedeId(null);
    localStorage.removeItem('atencion_token');
    localStorage.removeItem('atencion_moduloId'); // Limpiar caché de módulo
    setStep('login');
  };

  if (step === 'login') return <Login onLogin={handleLogin} />;

  if (!sedeId) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
       <div className="bg-red-900/20 p-8 rounded-2xl text-center max-w-md">
         <div className="text-4xl mb-4">⚠️</div>
         <h2 className="text-xl font-bold text-red-400 mb-2">Usuario sin Sede asignada</h2>
         <p className="text-slate-400 mb-6">Tu usuario no tiene una sede configurada. Contacta al administrador para que te asigne una sede en el CMS.</p>
         <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg">Cerrar Sesión</button>
       </div>
    </div>
  );

  return (
    <Dashboard
      socket={socket}
      sedeId={sedeId}
      onLogout={handleLogout}
    />
  );
}
