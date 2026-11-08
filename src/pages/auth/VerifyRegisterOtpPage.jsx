/**
 * @file VerifyRegisterOtpPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Halaman verifikasi kode OTP 6-digit pendaftaran dengan fitur
 * auto-advance antar input, paste handler, hitung mundur 10 menit, dan banner mode demo.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import {
  getPendingRegisterOtp,
  resendRegisterOtp,
  verifyRegisterOtp,
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/AuthContext';

export default function VerifyRegisterOtpPage() {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const { showToast } = useToast();

  const [pending, setPending] = useState(() => getPendingRegisterOtp());
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pending) {
      navigate('/register', { replace: true });
      return undefined;
    }

    const updateTimer = () => {
      const rem = Math.max(0, Math.floor((pending.expiresAt - Date.now()) / 1000));
      setSecondsLeft(rem);
    };
    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [pending, navigate]);

  const handleDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError('');
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      const next = ['', '', '', '', '', ''];
      pasted.split('').forEach((ch, idx) => {
        next[idx] = ch;
      });
      setDigits(next);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setSubmitting(true);
    try {
      const createdUser = await verifyRegisterOtp(code);
      syncUser(createdUser);
      showToast('Akun berhasil diverifikasi! Selamat datang di Portal TERA.', 'success');
      navigate('/pelanggan/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const refreshed = await resendRegisterOtp();
      setPending(getPendingRegisterOtp());
      setDigits(['', '', '', '', '', '']);
      setError('');
      showToast(`Kode OTP baru (${refreshed.otpDemo}) telah diterbitkan.`, 'info');
    } catch (err) {
      setError(err.message);
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <AuthLayout
      title="Verifikasi Kode OTP"
      subtitle={`Masukkan 6 digit kode verifikasi untuk ${pending?.email || ''}`}
    >
      {/* Email API Dispatch & OTP Banner */}
      {pending && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pengiriman Email REST API Aktif
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              FormSubmit API
            </span>
          </div>
          <p className="text-slate-600">
            Kode verifikasi 6 digit telah dikirimkan ke alamat email <strong>{pending.email}</strong>.
          </p>
          <div className="pt-1 text-[11px] text-slate-500">
            Kode OTP verifikasi aktif: <strong className="font-mono text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">{pending.otp}</strong>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="otp-input-grid" onPaste={handlePaste}>
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit OTP ke-${idx + 1}`}
              value={d}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-full h-12 text-center text-lg font-extrabold font-mono rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Sisa waktu berlaku:{' '}
            <strong className={secondsLeft < 60 ? 'text-red-600 font-mono' : 'text-slate-900 font-mono'}>
              {mm}:{ss}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleResend}
            className="font-bold text-blue-600 hover:underline"
          >
            Kirim Ulang OTP
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
        >
          {submitting ? 'Memverifikasi...' : 'Verifikasi & Aktifkan Akun'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        Salah alamat email?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:underline">
          Kembali ke Registrasi
        </Link>
      </p>
    </AuthLayout>
  );
}

