/**
 * @file RegisterPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Register
 * @description Formulir pendaftaran akun pengguna sistem TERA dengan validasi client-side,
 * pengiriman email notifikasi via REST API, dan integrasi sesi dengan tema Tailwind Blue & Dark Mode.
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
      next.email = 'Format email tidak valid (contoh: nama@email.com).';
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
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 p-4">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-md bg-blue-700 text-white flex items-center justify-center font-black">
            <Icon name="radio" size={18} />
          </span>
          <div>
            <span className="block text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              TERA <span className="text-blue-600 dark:text-blue-400">SYSTEM</span>
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">PT Utama Telekomindo</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-6">
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-6 sm:p-8 transition-colors">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Pendaftaran Administrator Baru
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lengkapi formulir untuk membuat akun administrator sistem TERA
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Ir. Budi Santoso"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="budi.santoso"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
              {errors.username && <p className="text-[11px] text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 karakter"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                />
                {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Konfirmasi Sandi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Ulangi sandi"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
            >
              {submitting ? 'Memproses Pendaftaran...' : 'Daftar Akun Administrator'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
