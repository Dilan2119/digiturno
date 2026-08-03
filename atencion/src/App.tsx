import { useState, useEffect, useRef } from 'react';
import { setToken, getToken, login as apiLogin, getSalas, getJwtPayload } from './services/api';
import { connectSocket, disconnectSocket } from './services/socket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

type Step = 'login' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('login');
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [salaId, setSalaId] = useState<number | null>(() => {
    const s = localStorage.getItem('atencion_salaId');
    return s ? parseInt(s, 10) : null;
  });
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);

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

  // Cargar primera sala disponible si no hay una seleccionada
  useEffect(() => {
    if (step !== 'dashboard' || !sedeId) return;
    const token = getToken();
    if (!token) return;

    getSalas(sedeId).then((salas) => {
      if (!salas.length) return;
      
      let targetSalaId = salaId;
      // Si la sala guardada no existe en esta sede, tomamos la primera
      if (!targetSalaId || !salas.find(s => s.id === targetSalaId)) {
        targetSalaId = salas[0].id;
        setSalaId(targetSalaId);
        localStorage.setItem('atencion_salaId', targetSalaId.toString());
      }
      
      if (socketRef.current) disconnectSocket();
      socketRef.current = connectSocket(token, targetSalaId);
    }).catch(() => {});
  }, [step, sedeId]); // Depende de sedeId, no corremos esto al cambiar salaId manualmente aquí

  // Reconectar socket cuando el usuario cambia la sala manualmente
  const handleSalaChange = (newSalaId: number) => {
    setSalaId(newSalaId);
    localStorage.setItem('atencion_salaId', newSalaId.toString());
    const token = getToken();
    if (!token) return;
    disconnectSocket();
    socketRef.current = connectSocket(token, newSalaId);
  };

  const handleLogin = async (accessToken: string) => {
    setToken(accessToken);
    localStorage.setItem('atencion_token', accessToken);
    const payload = getJwtPayload(accessToken);
    if (payload?.sedeId) setSedeId(payload.sedeId);
    setStep('dashboard');
  };

  const handleLogout = () => {
    disconnectSocket();
    socketRef.current = null;
    setToken(null);
    setSalaId(null);
    setSedeId(null);
    localStorage.removeItem('atencion_token');
    localStorage.removeItem('atencion_salaId');
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
      socket={socketRef.current}
      sedeId={sedeId}
      salaId={salaId}
      onSalaChange={handleSalaChange}
      onLogout={handleLogout}
    />
  );
}
