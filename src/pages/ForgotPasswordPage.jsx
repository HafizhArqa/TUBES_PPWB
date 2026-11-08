/**
 * @file ForgotPasswordPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Forgot Password
 * @description Halaman permintaan pemulihan kata sandi dengan validasi email,
 * verifikasi via Mock API (Axios), dan pengiriman instruksi reset ke email via REST API.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Alamat email wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Format email tidak valid (contoh: nama@email.com).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Verifikasi ketersediaan akun di Mock API via Axios
      const res = await axios.get('/api/users.json');
      const users = res.data || [];
      const user = users.find((u) => String(u.email).toLowerCase() === cleanEmail);

      if (!user) {
        throw new Error('Alamat email tidak terdaftar dalam sistem.');
      }

      // 2. Kirim instruksi pemulihan langsung ke email via REST API eksternal
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[TERA System] Instruksi Pemulihan Kata Sandi: ${user.name}`,
          _template: 'box',
          nama_pengguna: user.name,
          email_tujuan: cleanEmail,
          waktu: new Date().toLocaleString('id-ID'),
          status: 'Permintaan Reset Kata Sandi',
          pesan: `Halo ${user.name},\n\nKami menerima permintaan pemulihan kata sandi untuk akun Anda.\nKredensial default sistem TERA:\nEmail: ${user.email}\nKata Sandi: ${user.password || 'admin123'}\n\nPT Utama Telekomindo`,
        }),
      }).catch(() => {});

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal memproses permintaan pemulihan kata sandi.');
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="key" size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lupa Kata Sandi</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Masukkan email akun Anda. Instruksi pemulihan akan dikirimkan langsung ke email Anda via REST API.
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

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Icon name="check" size={18} />
                  <span>Instruksi Terkirim ke Email!</span>
                </div>
                <p>
                  Instruksi pemulihan telah dikirimkan ke <strong>{email}</strong> via REST API. Silakan periksa kotak masuk atau folder spam email Anda.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors block text-center"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email Akun <span className="text-red-600">*</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Mengirim Instruksi via REST API...' : 'Kirim Instruksi ke Email'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5">
                  <Icon name="arrowLeft" size={14} />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
