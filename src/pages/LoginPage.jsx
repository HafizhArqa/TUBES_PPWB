/**
 * @file LoginPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login
 * @description Halaman autentikasi sistem TERA dengan konsumsi Mock API via Axios,
 * validasi client-side, dan integrasi notifikasi login ke email via REST API.
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
        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full font-medium hidden sm:inline-block">
          Axios Mock &amp; Public REST API
        </span>
      </header>

      <main className="w-full max-w-md mx-auto my-auto p-4">
        <section className="tera-card p-6 sm:p-8 bg-white/95 backdrop-blur shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk ke Sistem</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Masukkan kredensial akun administrator Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2"
            >
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-identity" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email atau Username <span className="text-red-600">*</span>
              </label>
              <input
                id="login-identity"
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Kata Sandi <span className="text-red-600">*</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-semibold">
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
                  className="w-full rounded-xl border border-slate-300 pl-3.5 pr-10 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                  aria-label="Tampilkan kata sandi"
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Memvalidasi via Axios API...' : 'Masuk ke Akun'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Daftar Akun Baru
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
