/**
 * @file ForgotPasswordPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Forgot Password
 * @description Halaman permintaan pemulihan kata sandi dengan validasi email,
 * verifikasi via Mock API (Axios), dan pengiriman instruksi reset ke email via REST API.
 * Bertema Tailwind Blue & Dark Mode terpadu.
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
      // 1. Pengecekan pra-fetch simulasi galat
      checkSimulatedError();

      // 2. Verifikasi ketersediaan akun di Mock API via Axios
      const res = await axios.get('/api/users.json');
      const users = Array.isArray(res.data) ? res.data : [];
      const user = users.find((u) => String(u.email).toLowerCase() === cleanEmail);

      if (!user) {
        throw new Error('Alamat email tidak terdaftar dalam data Mock API users.json.');
      }

      // 3. Kirim instruksi pemulihan langsung ke email via REST API eksternal
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
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <Icon name="key" size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Lupa Kata Sandi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Masukkan email akun Anda. Instruksi pemulihan akan dikirimkan langsung ke email Anda via REST API.
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

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-xs space-y-2">
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
                className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow block text-center transition-colors"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Alamat Email Akun <span className="text-red-500">*</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
              >
                {loading ? 'Mengirim Instruksi via REST API...' : 'Kirim Instruksi ke Email'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1.5">
                  <Icon name="arrowLeft" size={14} />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
