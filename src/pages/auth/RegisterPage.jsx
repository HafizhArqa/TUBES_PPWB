/**
 * @file RegisterPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Halaman registrasi akun mitra pelanggan B2B TERA dengan validasi
 * format email korporat, username regex, kekuatan kata sandi, dan integrasi OTP.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { initiateRegisterOtp } from '../../services/authService';
import { useToast } from '../../context/AuthContext';
import Icon from '../../components/Icon';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 3) {
      next.name = 'Nama lengkap minimal 3 karakter.';
    }
    if (!/^[a-zA-Z0-9._-]{4,24}$/.test(form.username.trim())) {
      next.username = 'Username 4–24 karakter (huruf, angka, titik, atau garis bawah).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Format alamat email korporat tidak valid.';
    }
    if (form.password.length < 8) {
      next.password = 'Kata sandi wajib minimal 8 karakter.';
    }
    if (form.password !== form.passwordConfirm) {
      next.passwordConfirm = 'Konfirmasi kata sandi tidak cocok.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await initiateRegisterOtp(form);
      showToast('Kode verifikasi OTP 6 digit telah dibuat!', 'info');
      navigate('/register/verify-otp');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Registrasi Akun Baru"
      subtitle="Daftarkan akun Anda untuk mengakses sistem informasi manajemen TERA"
    >
      {errors.form && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2"
        >
          <Icon name="alert" size={16} />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Lengkap PIC <span className="text-red-600">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            placeholder="Contoh: Budi Santoso"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 mb-1">
            Username <span className="text-red-600">*</span>
          </label>
          <input
            id="reg-username"
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            aria-invalid={Boolean(errors.username)}
            placeholder="Contoh: budi.procurement"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Email Perusahaan <span className="text-red-600">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={Boolean(errors.email)}
            placeholder="nama@perusahaan.co.id"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-pass"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              aria-invalid={Boolean(errors.password)}
              placeholder="Min. 8 karakter"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="reg-pass2" className="block text-xs font-semibold text-slate-700 mb-1">
              Konfirmasi Sandi <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-pass2"
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
              aria-invalid={Boolean(errors.passwordConfirm)}
              placeholder="Ulangi kata sandi"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.passwordConfirm && (
              <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm transition-colors mt-2"
        >
          {submitting ? 'Memproses Pendaftaran...' : 'Lanjutkan Verifikasi OTP'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        Sudah memiliki akun terdaftar?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </AuthLayout>
  );
}

