import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/sedes', label: 'Sedes', icon: '🏢' },
  { to: '/salas', label: 'Salas', icon: '🚪' },
  { to: '/visores', label: 'Visores', icon: '🖥️' },
  { to: '/servicios', label: 'Servicios', icon: '⚕️' },
  { to: '/modulos', label: 'Módulos', icon: '📦' },
  { to: '/usuarios', label: 'Usuarios', icon: '👤' },
  { to: '/multimedia', label: 'Multimedia', icon: '🎬' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 font-bold text-blue-300 text-lg">Digiturno CMS</div>
        <nav className="flex-1 overflow-auto px-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`
              }>
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700 text-xs text-slate-400">
          <div>{user?.email}</div>
          <button onClick={logout} className="text-red-400 hover:text-red-300 mt-1">Cerrar sesión</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}
