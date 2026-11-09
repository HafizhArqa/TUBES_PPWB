/**
 * @file ForgotPasswordPage.jsx
 * @description Halaman permintaan pemulihan kata sandi BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Verifikasi via Mock API (Axios) dan pengiriman instruksi reset ke email via REST API.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';
import { checkSimulatedError } from '../components/StatusStates';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Alamat email akun Anda wajib diisi.');
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(cleanEmail)) {
      setError('Format alamat email tidak valid (contoh: nama@tera.com).');
      return;
    }
    setLoading(true);
    setError('');

    try {
      checkSimulatedError();

      const res = await axios.get('/api/users.json');
      const users = Array.isArray(res.data) ? res.data : [];
      const user = users.find((u) => String(u.email).toLowerCase() === cleanEmail);

      if (!user) {
        throw new Error('Alamat email tidak terdaftar dalam data Mock API users.json.');
      }

      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
      console.error('[Forgot Password Error]:', err);
      const userMessage = err.isSimulated
        ? err.message
        : err.response
        ? `Server Mock API merespon dengan status ${err.response.status}: ${err.response.statusText || 'Gagal memproses users.json'}.`
        : err.request
        ? 'Gagal menghubungi server Mock API. Periksa koneksi jaringan.'
        : err.message || 'Gagal memproses permintaan pemulihan kata sandi.';

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] transition-colors duration-200 p-4 sm:p-6 font-sans">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Icon name="creditCards" size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1E293B] dark:text-white">
            BankFlash<span className="text-blue-600">.</span>
          </span>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-8">
        <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-blue-400 hover:shadow-md rounded-[22px] p-7 sm:p-9 transition-all">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="key" size={22} />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
              Lupa Kata Sandi
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5">
              Masukkan email akun Anda untuk menerima petunjuk pemulihan kata sandi
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

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Icon name="check" size={18} />
                  <span>Instruksi Terkirim ke Email!</span>
                </div>
                <p>
                  Instruksi pemulihan telah dikirimkan ke <strong>{email}</strong> via REST API. Silakan periksa kotak masuk atau spam email Anda.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 block text-center transition-all"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#1E293B] dark:text-[#F8FAFC] mb-1.5">
                  Alamat Email Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tera.com"
                  className="w-full rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9] dark:bg-gray-800/80 px-4 py-2.5 text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] hover:border-blue-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Mengirim Instruksi via REST API...' : 'Kirim Instruksi ke Email'}
              </button>

              <div className="pt-3 text-center">
                <Link to="/login" className="text-xs font-bold text-[#64748B] hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors">
                  <Icon name="arrowLeft" size={14} />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
