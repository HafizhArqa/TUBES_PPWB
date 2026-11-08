import React from 'react';
import Icon from './Icon';
import { isSimulatedApiErrorEnabled, setSimulatedApiError } from '../services/apiClient';

export function LoadingState({ message = 'Memuat data dari server API...', rows = 4 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4 py-2">
      <span className="sr-only">{message}</span>
      <div className="kpi-grid-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="tera-card p-5 space-y-3">
            <div className="skeleton-box h-3.5 w-24" />
            <div className="skeleton-box h-7 w-32" />
            <div className="skeleton-box h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="tera-card p-5 space-y-3">
        <div className="skeleton-box h-5 w-48 mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-box h-11 w-full" />
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Gagal Memuat Data API',
  message = 'Terjadi kendala saat menghubungi layanan data.',
  onRetry,
}) {
  const simActive = isSimulatedApiErrorEnabled();

  const handleDisableSimAndRetry = () => {
    setSimulatedApiError(false);
    onRetry?.();
  };

  return (
    <section
      role="alert"
      className="tera-card p-8 max-w-xl mx-auto my-6 text-center border-red-200 bg-red-50/40"
    >
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
        <Icon name="alert" size={24} />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-600 mb-5">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Icon name="refresh" size={16} />
            <span>Coba Lagi</span>
          </button>
        )}
        {simActive && (
          <button
            type="button"
            onClick={handleDisableSimAndRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
          >
            <span>Matikan Simulasi Error & Muat Ulang</span>
          </button>
        )}
      </div>
    </section>
  );
}

export function EmptyState({
  icon = 'box',
  title = 'Belum Ada Data',
  description = 'Tidak ada data yang cocok dengan filter pencarian saat ini.',
  action,
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon name={icon} size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">{description}</p>
      {action}
    </div>
  );
}

