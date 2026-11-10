import React from 'react';

const STATUS_STYLES = {
  // Unit & Pelanggan & Kontrak
  Tersedia: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lunas: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Terverifikasi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Menang: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  Disewa: 'bg-blue-50 text-blue-700 border-blue-200',
  Penawaran: 'bg-blue-50 text-blue-700 border-blue-200',
  Ditinjau: 'bg-sky-50 text-sky-700 border-sky-200',
  Baru: 'bg-indigo-50 text-indigo-700 border-indigo-200',

  Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  Menunggu: 'bg-amber-50 text-amber-700 border-amber-200',
  'Menunggu Pembayaran': 'bg-amber-50 text-amber-700 border-amber-200',
  'Menunggu Verifikasi': 'bg-sky-50 text-sky-700 border-sky-200',
  'Sedang Berlangsung': 'bg-amber-50 text-amber-700 border-amber-200',
  Instalasi: 'bg-amber-50 text-amber-700 border-amber-200',

  Rusak: 'bg-red-50 text-red-700 border-red-200',
  Dibatalkan: 'bg-red-50 text-red-700 border-red-200',
  Ditolak: 'bg-red-50 text-red-700 border-red-200',
  Kalah: 'bg-red-50 text-red-700 border-red-200',
  'Jatuh Tempo': 'bg-red-50 text-red-700 border-red-200',

  Berakhir: 'bg-slate-100 text-slate-600 border-slate-200',
  'Tidak Aktif': 'bg-slate-100 text-slate-600 border-slate-200',
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  'Belum Dimulai': 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style} ${className}`}
    >
      {status || '—'}
    </span>
  );
}

