import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
}

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  loading: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    const t = localStorage.getItem('token');
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get<CurrentUser>('/me/');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/token/', { email, password });
    localStorage.setItem('token', res.data.access);
    setToken(res.data.access);
    const me = await apiClient.get<CurrentUser>('/me/');
    setUser(me.data);
    localStorage.setItem('user', JSON.stringify(me.data));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isSuperAdmin: user?.role === 'super_admin',
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
