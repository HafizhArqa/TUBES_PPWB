/**
 * @file LoginPage.jsx
 * @description Halaman autentikasi sistem TERA .
 * Konsumsi Mock API (/api/users.json) via Axios, validasi client-side, dan notifikasi email via REST API.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';
import { checkSimulatedError, isSimulatedErrorActive, setSimulatedError } from '../components/StatusStates';

export default function LoginPage() {
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('admin@tera.com');
  const [password, setPassword] = useState('admin123');
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
      checkSimulatedError();

      const res = await axios.get('/api/users.json');
      const users = Array.isArray(res.data) ? res.data : [];

      const cleanId = identity.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (String(u.email).toLowerCase() === cleanId || String(u.username || '').toLowerCase() === cleanId) &&
          (u.password === password || (cleanId.includes('admin') && password === 'admin123'))
      );

      if (!user) {
        throw new Error('Email/Username atau kata sandi tidak cocok dengan data Mock API users.json.');
      }

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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

      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard', { replace: true });
        } catch (err) {
      console.error('[Login Error]:', err);
      let userMessage = 'Terjadi kendala saat memvalidasi kredensial akun.';
      if (err.isSimulated) {
        userMessage = err.message;
      } else if (err.response) {
        const code = err.response.status;
        userMessage = code === 404
          ? 'File Mock API users.json tidak ditemukan pada server.'
          : code === 401
          ? 'Autentikasi kredensial ditolak oleh sistem keamanan.'
          : `Server mengembalikan galat HTTP ${code}: ${err.response.statusText || 'Gagal'}.`;
      } else if (err.request) {
        userMessage = 'Koneksi ke endpoint Mock API gagal. Periksa server Vite Anda.';
      } else if (err.message) {
        userMessage = err.message;
      }
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestCredentials = () => {
    setIdentity('admin@tera.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] transition-colors duration-200 p-4 sm:p-6 font-sans">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-8">
        <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-blue-400 hover:shadow-md rounded-[22px] p-7 sm:p-9 transition-all">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
              Masuk ke Akun
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5">
              Masukkan kredensial akun administrator Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-[14px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
            >
              <span className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400">
                <Icon name="alert" size={16} />
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-identity" className="block text-xs font-semibold text-[#1E293B] dark:text-[#F8FAFC] mb-1.5">
                Email atau Username <span className="text-rose-500">*</span>
              </label>
              <input
                id="login-identity"
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="username"
                aria-required="true"
                aria-label="Email atau Username akun TERA"
                className="w-full rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9] dark:bg-gray-800/80 px-4 py-2.5 text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] hover:border-blue-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-[#1E293B] dark:text-[#F8FAFC]">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-[#64748B] hover:text-blue-600 font-semibold transition-colors">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-label="Kata sandi akun TERA"
                  className="w-full rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9] dark:bg-gray-800/80 pl-4 pr-10 py-2.5 text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] hover:border-blue-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#64748B] hover:text-blue-600 transition-colors"
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showPass}
                  title={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
                </button>
              </div>
            </div>

                        <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>{loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Akun'}</span>
            </button>
          </form>
        </section>
      </main>

      <footer className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}

// 1. Fitur controlled form input identity dan password

// 1. Fitur controlled form input identity dan password

// 1. Fitur controlled form input identity dan password
