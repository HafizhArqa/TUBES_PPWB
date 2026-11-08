import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function AuthLayout({ title, subtitle, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="auth-shell">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-2 py-1">
        <Link to="/login" className="inline-flex items-center gap-2.5 group">
          <span className="w-10 h-10 rounded-xl bg-tera-navy text-white flex items-center justify-center shadow-md">
            <Icon name="radio" size={20} className="text-sky-400" />
          </span>
          <div>
            <span className="block text-base font-extrabold tracking-tight text-slate-900">
              TERA <span className="text-blue-600">B2B</span>
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              PT Utama Telekomindo
            </span>
          </div>
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full">
          <Icon name="shield" size={14} className="text-blue-600" />
          Enterprise Telecom Rental Portal
        </span>
      </header>

      <main id="main-content" className={`w-full ${maxWidth} mx-auto my-6`}>
        <section className="tera-card p-6 sm:p-8 bg-white/95 backdrop-blur">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>}
          </div>
          {children}
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Penyewaan &amp; Pengadaan Radio Telekomunikasi.
      </footer>
    </div>
  );
}

