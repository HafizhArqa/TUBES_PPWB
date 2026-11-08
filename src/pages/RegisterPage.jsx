/**
 * @file RegisterPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Register
 * @description Formulir pendaftaran akun pengguna sistem TERA dengan validasi client-side,
 * pengiriman email notifikasi via REST API, dan integrasi sesi.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Nama lengkap wajib diisi.';
    if (!form.username.trim()) next.username = 'Username wajib diisi.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      next.email = 'Format email tidak valid.';
    }
    if (!form.password || form.password.length < 6) {
      next.password = 'Kata sandi minimal 6 karakter.';
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Kirim konfirmasi pendaftaran ke email via REST API FormSubmit
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(form.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[TERA System] Pendaftaran Akun Berhasil: ${form.name}`,
          _template: 'box',
          nama_pengguna: form.name,
          username: form.username,
          email_tujuan: form.email,
          status: 'Registrasi Berhasil',
          pesan: `Halo ${form.name},\n\nAkun Anda telah berhasil didaftarkan ke Sistem Manajemen Perangkat TERA.\n\nPT Utama Telekomindo`,
        }),
      }).catch(() => {});

      // Simpan sesi login aktif
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          role: 'admin',
        })
      );

      navigate('/admin/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
            <Icon name="radio" size={20} />
          </span>
          <div>
            <span className="block text-base font-extrabold text-slate-900 leading-tight">
              TERA <span className="text-blue-600">SYSTEM</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">PT Utama Telekomindo</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto p-4">
        <section className="tera-card p-6 sm:p-8 bg-white/95 backdrop-blur shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Baru</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Lengkapi formulir berikut untuk membuat akun akses sistem TERA
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 mb-1">
                Username <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="budi.santoso"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-pass"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Kata Sandi <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Ulangi kata sandi"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
