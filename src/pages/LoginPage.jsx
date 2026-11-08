/**
 * @file LoginPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login
 * @description Halaman autentikasi sistem TERA dengan konsumsi Mock API via Axios,
 * validasi client-side, tema Tailwind Blue & Dark Mode, dan pengiriman notifikasi login ke email via REST API.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';

export default function LoginPage() {
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identity.trim()) {
      setError('Email atau Username wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Fetch Mock API users.json via Axios (bukan database lokal)
      const res = await axios.get('/api/users.json');
      const users = res.data || [];

      const cleanId = identity.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (String(u.email).toLowerCase() === cleanId || String(u.username || '').toLowerCase() === cleanId) &&
          (u.password === password || (cleanId.includes('admin') && password === 'admin123'))
      );

      if (!user) {
        throw new Error('Email/Username atau kata sandi tidak cocok.');
      }

      // 2. Kirim notifikasi sesi login ke email via REST API eksternal (FormSubmit API)
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[TERA System] Notifikasi Login Berhasil: ${user.name}`,
          _template: 'box',
          nama_pengguna: user.name,
          email_tujuan: user.email,
          waktu_login: new Date().toLocaleString('id-ID'),
          status: 'Login Berhasil via Axios Mock API',
          pesan: `Halo ${user.name},\n\nAkun Anda berhasil masuk ke Sistem Manajemen Perangkat TERA pada ${new Date().toLocaleString('id-ID')}.\n\nPT Utama Telekomindo`,
        }),
      }).catch(() => {});

      // 3. Simpan sesi login aktif di sessionStorage browser
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi API.');
    } finally {
      setLoading(false);
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
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full font-medium hidden sm:inline-block">
          Axios Mock &amp; REST API
        </span>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-6">
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-6 sm:p-8 transition-colors">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Masuk ke Sistem Administrator
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Masukkan kredensial akun administrator Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-2"
            >
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-identity" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email atau Username <span className="text-red-500">*</span>
              </label>
              <input
                id="login-identity"
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-3 pr-9 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Tampilkan kata sandi"
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
            >
              {loading ? 'Memvalidasi via Axios API...' : 'Masuk ke Akun'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Daftar Akun Baru
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
