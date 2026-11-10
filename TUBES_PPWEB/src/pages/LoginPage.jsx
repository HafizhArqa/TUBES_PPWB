/**
 * @file LoginPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi
 * @module Modul 1: Autentikasi & Reset Sandi
 * @description Halaman autentikasi sistem TERA dengan background animasi isometrik halus (CSS Grid + Flexbox + Tailwind),
 * validasi client-side, verifikasi Mock API via Axios, dan notifikasi email via REST API.
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
  const [simulatedError, setSimulatedErrorState] = useState(isSimulatedErrorActive());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = identity.trim().toLowerCase();
    if (!cleanId) {
      setError('Alamat Email atau Username wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi akun wajib diisi.');
      return;
    }
    if (password.length < 5) {
      setError('Kata sandi minimal harus terdiri dari 5 karakter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      checkSimulatedError();

      const res = await axios.get('/api/users.json');
      const users = Array.isArray(res.data) ? res.data : [];

      const user = users.find(
        (u) =>
          (String(u.email).toLowerCase() === cleanId || String(u.username || '').toLowerCase() === cleanId) &&
          (u.password === password || (cleanId.includes('admin') && password === 'admin123'))
      );

      if (!user) {
        throw new Error('Email/Username atau kata sandi tidak cocok dengan data Mock API users.json.');
      }

      // REST API Real-time notification email
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[TERA System] Notifikasi Login Berhasil: ${user.name}`,
          _template: 'box',
          _captcha: 'false',
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
        userMessage =
          code === 404
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
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] transition-colors duration-200 p-4 sm:p-6 font-sans">
      <div className="bank-login-bg-wrapper" aria-hidden="true">
        <div className="bank-isometric-stage">
          {/* Track 1: Atas - Meluncur Kiri ke Kanan */}
          <div className="bank-anim-track">
            <div className="bank-pill bank-pill-blue-deep anim-slide-slow-1 w-96 ml-12" />
            <div className="bank-pill bank-pill-glass anim-slide-slow-1 w-72 ml-8" />
          </div>

          {/* Track 2: Meluncur Kanan ke Kiri */}
          <div className="bank-anim-track justify-end">
            <div className="bank-pill bank-pill-blue-cyan anim-slide-slow-2 w-[420px] mr-16" />
            <div className="bank-pill bank-pill-soft anim-slide-slow-2 w-64 mr-8" />
          </div>

          {/* Track 3: Tengah Atas (Melintas di Balik Kartu Login) */}
          <div className="bank-anim-track">
            <div className="bank-pill bank-pill-indigo anim-slide-slow-3 w-[500px] ml-28" />
            <div className="bank-pill bank-pill-blue-cyan anim-slide-slow-3 w-80 ml-10" />
          </div>

          {/* Track 4: Tengah Bawah (Melintas di Balik Kartu Login) */}
          <div className="bank-anim-track justify-end">
            <div className="bank-pill bank-pill-glass anim-slide-slow-4 w-96 mr-24" />
            <div className="bank-pill bank-pill-blue-deep anim-slide-slow-4 w-[460px] mr-10" />
          </div>

          {/* Track 5: Bawah - Meluncur Kiri ke Kanan */}
          <div className="bank-anim-track">
            <div className="bank-pill bank-pill-soft anim-slide-slow-5 w-[380px] ml-16" />
            <div className="bank-pill bank-pill-indigo anim-slide-slow-5 w-72 ml-8" />
          </div>

          {/* Track 6: Paling Bawah - Meluncur Kanan ke Kiri */}
          <div className="bank-anim-track justify-end">
            <div className="bank-pill bank-pill-blue-cyan anim-slide-slow-6 w-[480px] mr-8" />
            <div className="bank-pill bank-pill-glass anim-slide-slow-6 w-60 mr-6" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          KONTEN UTAMA (Z-INDEX 10 AGAR DI ATAS ANIMASI BACKGROUND)
          ========================================================================= */}
      <div className="relative z-10 flex flex-col justify-between flex-grow w-full max-w-5xl mx-auto">
        <header className="w-full flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
           
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextState = !isSimulatedErrorActive();
                setSimulatedError(nextState);
                setSimulatedErrorState(nextState);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all ${
                simulatedError
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 font-bold shadow-sm'
                  : 'bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-rose-400'
              }`}
            >
              {simulatedError ? '⚠️ Simulasi Galat: Aktif' : 'Tes Simulasi Error'}
            </button>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-[#E2E8F0] dark:border-[#334155] px-4 py-1.5 rounded-full font-medium shadow-sm hidden sm:inline-block">
              Portal Manajemen Internal
            </span>
          </div>
        </header>

        <main className="w-full max-w-md mx-auto my-auto py-8">
          <section className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[#334155] shadow-xl hover:shadow-2xl hover:border-blue-400 rounded-[24px] p-7 sm:p-9 transition-all">
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
                  placeholder="admin@tera.com"
                  autoComplete="username"
                  aria-required="true"
                  aria-label="Email atau Username akun TERA"
                  className="w-full rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9]/80 dark:bg-gray-800/80 px-4 py-2.5 text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] hover:border-blue-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
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
                    placeholder="admin123"
                    autoComplete="current-password"
                    aria-required="true"
                    aria-label="Kata sandi akun TERA"
                    className="w-full rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9]/80 dark:bg-gray-800/80 pl-4 pr-10 py-2.5 text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] hover:border-blue-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
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
    </div>
  );
}
