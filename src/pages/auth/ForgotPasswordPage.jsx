/**
 * @file ForgotPasswordPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Formulir permohonan pemulihan kata sandi dengan validasi email
 * dan pembuatan kode OTP pemulihan berdurasi 10 menit.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { requestPasswordResetOtp } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Masukkan alamat email terdaftar yang valid.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await requestPasswordResetOtp(email);
      showToast('Kode OTP pemulihan kata sandi berhasil dibuat.', 'info');
      navigate('/verify-otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Pemulihan Kata Sandi"
      subtitle="Masukkan email terdaftar Anda untuk menerima kode verifikasi OTP 6 digit"
    >
      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="fp-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Alamat Email Terdaftar <span className="text-red-600">*</span>
          </label>
          <input
            id="fp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            placeholder="Contoh: pelanggan@tera.co.id"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
        >
          {submitting ? 'Mengirim OTP...' : 'Kirim Kode OTP Pemulihan'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-5">
        Ingat kata sandi Anda?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Kembali ke Halaman Masuk
        </Link>
      </p>
    </AuthLayout>
  );
}

