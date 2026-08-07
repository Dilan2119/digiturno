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
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#0D2E5A] to-[#1B5FAE] font-sans">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col items-center mb-6">
          <svg className="w-12 h-12 text-[#1B5FAE] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
          <h2 className="text-xl font-bold text-[#0D2E5A]">IPS Clinical House</h2>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#1B5FAE] mb-2">Módulo de Atención</h1>
        <p className="text-[#6B7A8D] text-center text-sm mb-8">Acceso para Profesionales de Salud</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center border border-red-200">{error}</div>
        )}

        <label className="text-[#0D2E5A] font-medium text-sm mb-1 block">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#E8F6FD] border border-[#29ABE2]/30 rounded-xl px-4 py-3 mb-4 text-[#0D2E5A] placeholder-[#6B7A8D] focus:outline-none focus:ring-2 focus:ring-[#1B5FAE] focus:border-transparent transition-all"
          placeholder="correo@ejemplo.com" autoComplete="email"
        />

        <label className="text-[#0D2E5A] font-medium text-sm mb-1 block">Contraseña</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#E8F6FD] border border-[#29ABE2]/30 rounded-xl px-4 py-3 mb-6 text-[#0D2E5A] placeholder-[#6B7A8D] focus:outline-none focus:ring-2 focus:ring-[#1B5FAE] focus:border-transparent transition-all"
          placeholder="••••••••" autoComplete="current-password"
        />

        <button
          type="submit" disabled={loading}
          className="w-full bg-[#1B5FAE] hover:bg-[#0D2E5A] text-white disabled:opacity-50 rounded-xl py-3 text-lg font-semibold transition-colors shadow-md"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
