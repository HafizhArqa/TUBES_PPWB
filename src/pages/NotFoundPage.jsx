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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <section className="tera-card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Icon name="radio" size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <p className="text-sm font-bold text-slate-800">Halaman Tidak Ditemukan</p>
        <p className="text-xs text-slate-500">
          Alamat URL yang Anda tuju tidak tersedia pada sistem PT Utama Telekomindo (TERA).
        </p>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </section>
    </main>
  );
}

