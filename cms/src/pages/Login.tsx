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
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Brand Area */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden bg-[#0D2E5A] bg-gradient-to-br from-[#0D2E5A] to-[#1B5FAE]">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
        
        <div className="z-10 text-center px-10">
          <div className="flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mr-4">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
              <circle cx="20" cy="10" r="2"/>
            </svg>
            <h1 className="text-4xl font-bold text-white tracking-wide">IPS Clinical House</h1>
          </div>
          <p className="text-xl font-light text-[#29ABE2] tracking-wider uppercase">Una Experiencia de Atención</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#E8F6FD] lg:bg-white p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl lg:shadow-none lg:p-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0D2E5A] mb-2">Digiturno CMS</h2>
            <p className="text-[#6B7A8D]">Sistema de Administración</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-sm rounded-lg px-4 py-3 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="text-[#6B7A8D] font-medium text-sm mb-2 block">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#0D2E5A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B5FAE] focus:border-transparent transition-shadow" 
                placeholder="admin@clinicalhouse.com" 
                autoComplete="email" 
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="text-[#6B7A8D] font-medium text-sm mb-2 block">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[#0D2E5A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B5FAE] focus:border-transparent transition-shadow" 
                placeholder="••••••••" 
                autoComplete="current-password" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1B5FAE] hover:bg-[#0D2E5A] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg py-3.5 text-white font-semibold text-lg transition-colors shadow-md hover:shadow-lg flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ingresando...
              </>
            ) : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
