/**
 * @file LoginPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Halaman autentikasi utama TERA dengan validasi client-side,
 * toggle visibilitas password, tombol auto-fill akun demo, dan integrasi AuthContext.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Icon from '../../components/Icon';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!identity.trim()) {
      next.identity = 'Email atau Username wajib diisi.';
    }
    if (!password) {
      next.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      next.password = 'Kata sandi minimal 6 karakter.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const loggedUser = await login({ identity, password });
      showToast(`Selamat datang kembali, ${loggedUser.name}!`, 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setIdentity('admin@tera.co.id');
      setPassword('password123');
    } else {
      setIdentity('admin.tera');
      setPassword('password123');
    }
    setErrors({});
  };

  return (
    <AuthLayout
      title="Masuk ke Portal TERA"
      subtitle="Kelola penyewaan & pengadaan sistem radio komunikasi B2B Anda"
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

      {/* Demo Account Quick Fill */}
      <div className="mb-5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
        <p className="font-bold text-blue-950 mb-2">Akun Demo Siap Pakai (Klik untuk isi otomatis):</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('admin')}
            className="px-3 py-2 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 font-semibold text-blue-800 transition-colors text-left"
          >
            <span className="block font-bold">Admin Utama</span>
            <span className="block text-[11px] opacity-80">admin@tera.co.id</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('project')}
            className="px-3 py-2 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-blue-200 font-semibold text-blue-800 transition-colors text-left"
          >
            <span className="block font-bold">Admin Operasional</span>
            <span className="block text-[11px] opacity-80">admin.tera</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="login-identity" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email atau Username <span className="text-red-600">*</span>
          </label>
          <input
            id="login-identity"
            type="text"
            autoComplete="username"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            aria-invalid={Boolean(errors.identity)}
            aria-describedby={errors.identity ? 'err-login-identity' : undefined}
            placeholder="admin@tera.co.id atau admin.tera"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
              errors.identity
                ? 'border-red-500 bg-red-50/30'
                : 'border-slate-300 focus:border-blue-600'
            }`}
          />
          {errors.identity && (
            <p id="err-login-identity" className="text-xs text-red-600 mt-1 font-medium">
              {errors.identity}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
              Kata Sandi <span className="text-red-600">*</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'err-login-password' : undefined}
              placeholder="Masukkan kata sandi"
              className={`w-full rounded-xl border pl-3.5 pr-10 py-2.5 text-sm focus:outline-none ${
                errors.password
                  ? 'border-red-500 bg-red-50/30'
                  : 'border-slate-300 focus:border-blue-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
          {errors.password && (
            <p id="err-login-password" className="text-xs text-red-600 mt-1 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm transition-colors"
        >
          {submitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        Belum memiliki akun pelanggan korporat?{' '}
        <Link to="/register" className="font-bold text-blue-600 hover:underline">
          Daftar Akun Baru
        </Link>
      </p>
    </AuthLayout>
  );
}

