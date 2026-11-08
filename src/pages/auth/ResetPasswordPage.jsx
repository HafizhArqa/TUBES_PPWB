/**
 * @file ResetPasswordPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Formulir penetapan kata sandi baru dengan konfirmasi dan validasi kompleksitas.
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { getPendingResetOtp, completePasswordReset } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pending = getPendingResetOtp();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSubmitting(true);
    try {
      await completePasswordReset({ token, password });
      showToast('Kata sandi berhasil diperbarui! Silakan masuk dengan sandi baru.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Buat Kata Sandi Baru" subtitle="Amankan kembali akses akun portal TERA Anda">
      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="rp-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Akun Email
          </label>
          <input
            id="rp-email"
            type="email"
            readOnly
            value={pending?.email || ''}
            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600"
          />
        </div>

        <div>
          <label htmlFor="rp-pass" className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi Baru <span className="text-red-600">*</span>
          </label>
          <input
            id="rp-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="rp-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
            Ulangi Kata Sandi Baru <span className="text-red-600">*</span>
          </label>
          <input
            id="rp-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ketik ulang kata sandi baru"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Batal & kembali ke Login
        </Link>
      </p>
    </AuthLayout>
  );
}

