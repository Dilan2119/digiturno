import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToken, getToken, login as apiLogin } from '../services/api';

interface AuthState { token: string | null; user: { email: string; rol: string } | null; }
interface AuthCtx extends AuthState { login: (email: string, password: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem('cms_token');
      if (!stored) return { token: null, user: null };
      const user = JSON.parse(localStorage.getItem('cms_user') || 'null');
      if (!user || !user.email) throw new Error('invalid');
      return { token: stored, user };
    } catch {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      return { token: null, user: null };
    }
  });

  useEffect(() => { if (state.token) { setToken(state.token); } }, [state.token]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.accessToken);
    const decoded = JSON.parse(atob(res.accessToken.split('.')[1]));
    const user = { email: decoded.email, rol: decoded.rol };
    localStorage.setItem('cms_token', res.accessToken);
    localStorage.setItem('cms_user', JSON.stringify(user));
    setState({ token: res.accessToken, user });
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setState({ token: null, user: null });
  };

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
