import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

/**
 * @file NotFoundPage.jsx
 * @description Halaman 404 bertema Putih, Grey, dan Hover Biru (BankFlash style).
 */
export default function NotFoundPage() {
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const homePath = user ? '/admin/dashboard' : '/login';

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] px-4 font-sans transition-colors">
      <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-sm hover:border-blue-400 hover:shadow-md rounded-[22px] transition-all">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
          <Icon name="creditCards" size={30} />
        </div>
        <div>
          <h1 className="text-5xl font-black text-blue-600 tracking-tight">404</h1>
          <p className="text-base font-bold text-[#1E293B] dark:text-white mt-2">Halaman Tidak Ditemukan</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Alamat URL yang Anda tuju tidak tersedia pada sistem manajemen BankFlash TERA.
          </p>
        </div>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </section>
    </main>
  );
}
