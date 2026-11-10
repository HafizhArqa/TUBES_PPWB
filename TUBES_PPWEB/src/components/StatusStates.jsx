/**
 * @file StatusStates.jsx
 * @description Komponen status UI bertema Putih, Grey, dan Hover Biru:
 * 1. Loading State (Shimmer Skeleton Cards & Tables)
 * 2. Error State (Pesan error komprehensif, tombol Retry, dan helper simulasi)
 * 3. Empty State (Tampilan data kosong)
 */

import React from 'react';
import Icon from './Icon';

export const isSimulatedErrorActive = () => {
  try {
    return sessionStorage.getItem('simulate_api_error') === 'true';
  } catch {
    return false;
  }
};

export const setSimulatedError = (active) => {
  try {
    if (active) {
      sessionStorage.setItem('simulate_api_error', 'true');
    } else {
      sessionStorage.removeItem('simulate_api_error');
    }
  } catch {}
};

export const checkSimulatedError = () => {
  if (isSimulatedErrorActive()) {
    const error = new Error('SIMULASI ERROR: Terjadi kegagalan komunikasi ke server Mock API (HTTP 503 Service Unavailable / Network Timeout).');
    error.status = 503;
    error.isSimulated = true;
    throw error;
  }
};

export function LoadingState({ message = 'Memuat data dinamis dari Mock API...', rows = 4 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-6 py-4 w-full">
      <span className="sr-only">{message}</span>

      {/* 2 Top Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 rounded-[18px] bank-shimmer border border-[#E2E8F0] dark:border-gray-800" />
        <div className="h-48 rounded-[18px] bank-shimmer border border-[#E2E8F0] dark:border-gray-800" />
      </div>

      {/* Main Table / Chart Skeleton */}
      <div className="p-6 rounded-[18px] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-gray-800 space-y-4">
        <div className="h-6 w-44 rounded-full bank-shimmer" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bank-shimmer w-full" />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-semibold">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Gagal Mengambil Data dari Mock API',
  message = 'Terjadi kendala saat menghubungi server data atau format respon tidak sesuai.',
  onRetry,
}) {
  const isSimulated = isSimulatedErrorActive();

  const handleDisableSimAndRetry = () => {
    setSimulatedError(false);
    if (onRetry) onRetry();
  };

  return (
    <div
      role="alert"
      className="p-6 rounded-[18px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[#1E293B] dark:text-gray-100 shadow-sm space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center flex-shrink-0">
          <Icon name="alert" size={24} />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="font-bold text-base text-rose-800 dark:text-rose-300">{title}</h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Icon name="refresh" size={14} />
            <span>Coba Lagi (Retry)</span>
          </button>
        )}

        {isSimulated && (
          <button
            type="button"
            onClick={handleDisableSimAndRetry}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-all"
          >
            Matikan Simulasi Error
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Tidak ada data yang sesuai dengan pencarian atau filter saat ini.',
  actionText,
  onAction,
  onReset,
}) {
  const handleAction = onAction || onReset;
  return (
    <div className="p-8 text-center rounded-[18px] bg-white dark:bg-gray-800/50 border border-[#E2E8F0] dark:border-gray-700 space-y-3">
      <div className="w-12 h-12 rounded-full bg-[#F1F5F9] dark:bg-gray-700 text-[#64748B] mx-auto flex items-center justify-center">
        <Icon name="search" size={22} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#1E293B] dark:text-white">{title}</h4>
        <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
          {description}
        </p>
      </div>
      {handleAction && (
        <button
          type="button"
          onClick={handleAction}
          className="px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all"
        >
          {actionText || 'Reset Filter'}
        </button>
      )}
    </div>
  );
}
