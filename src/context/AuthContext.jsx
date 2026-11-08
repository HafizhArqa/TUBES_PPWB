/**
 * @file AuthContext.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Context autentikasi sesi pengguna dan feedback notifikasi sistem.
 */

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
  const [toasts, setToasts] = useState([]);

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

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

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
    <AuthContext.Provider value={{ user, bootstrapping, login, logout, syncUser, showToast }}>
      {children}
      {/* Toast notifications container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl text-xs font-semibold shadow-xl border flex items-center justify-between gap-3 transform transition-all duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-900/10'
                : t.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-900/10'
                : t.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200 shadow-amber-900/10'
                : 'bg-blue-50 text-blue-900 border-blue-200 shadow-blue-900/10'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-1"
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};

export const useToast = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useToast harus digunakan di dalam AuthProvider');
  return { showToast: ctx.showToast };
};
