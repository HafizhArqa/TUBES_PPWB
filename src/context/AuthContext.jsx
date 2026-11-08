import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredSessionUser,
  loginUser,
  logoutUser,
  saveSessionUser,
} from '../services/authService';
import { ensureDbLoaded } from '../services/mockDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredSessionUser());
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    ensureDbLoaded({ skipLatency: true })
      .catch(() => {})
      .finally(() => {
        if (mounted) setBootstrapping(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async ({ identity, password }) => {
    const loggedIn = await loginUser({ identity, password });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const syncUser = useCallback((updatedUser) => {
    const saved = saveSessionUser(updatedUser);
    setUser(saved);
  }, []);

  return (
    <AuthContext.Provider value={{ user, bootstrapping, login, logout, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};

