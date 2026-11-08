import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

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
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 transition-colors">
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center space-y-4 shadow-xl rounded-lg">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Icon name="radio" size={28} />
        </div>
        <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Halaman Tidak Ditemukan</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Alamat URL yang Anda tuju tidak tersedia pada sistem PT Utama Telekomindo (TERA).
        </p>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </section>
    </main>
  );
}

