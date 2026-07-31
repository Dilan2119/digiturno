import { useState } from 'react';
import { login as apiLogin } from '../services/api';

interface Props {
  onLogin: (token: string) => Promise<void>;
}

export default function Login({ onLogin }: Props) {
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
      const res = await apiLogin(email, password);
      await onLogin(res.accessToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center text-blue-300 mb-2">Digiturno</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Módulo de Atención</p>

        {error && (
          <div className="bg-red-900/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 text-center">{error}</div>
        )}

        <label className="text-slate-300 text-sm mb-1 block">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-700 rounded-xl px-4 py-3 mb-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="correo@ejemplo.com" autoComplete="email"
        />

        <label className="text-slate-300 text-sm mb-1 block">Contraseña</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-700 rounded-xl px-4 py-3 mb-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••" autoComplete="current-password"
        />

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded-xl py-3 text-lg font-semibold transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
