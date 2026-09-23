import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('support_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('support_user')) || null;
    } catch {
      return null;
    }
  });

  function persist(data) {
    localStorage.setItem('support_token', data.token);
    localStorage.setItem('support_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
    return data;
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data);
    return data;
  }

  function logout() {
    localStorage.removeItem('support_token');
    localStorage.removeItem('support_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
