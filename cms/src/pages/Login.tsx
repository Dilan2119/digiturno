import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Complete todos los campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="text-2xl font-bold text-center text-blue-300 mb-2">Digiturno CMS</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Administración</p>
        {error && <div className="bg-red-900/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>}
        <label className="text-slate-300 text-sm mb-1 block">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-700 rounded-xl px-4 py-3 mb-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@ejemplo.com" autoComplete="email" />
        <label className="text-slate-300 text-sm mb-1 block">Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-700 rounded-xl px-4 py-3 mb-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" autoComplete="current-password" />
        <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded-xl py-3 text-lg font-semibold transition-colors">{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </div>
  );
}
