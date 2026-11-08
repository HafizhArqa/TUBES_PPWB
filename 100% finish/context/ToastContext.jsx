import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 no-print"
      >
        {toasts.map((t) => {
          const palette =
            t.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : t.type === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : t.type === 'info'
              ? 'bg-sky-600 text-white border-sky-700'
              : 'bg-emerald-600 text-white border-emerald-700';

          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${palette}`}
            >
              <span>{t.message}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Tutup notifikasi"
                className="opacity-80 hover:opacity-100 font-bold leading-none text-base"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider');
  return ctx;
};

