/**
 * @file VerifyResetOtpPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Verifikasi OTP pemulihan kata sandi dengan verifikasi token reset.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import {
  getPendingResetOtp,
  resendPasswordResetOtp,
  verifyPasswordResetOtp,
} from '../../services/authService';
import { useToast } from '../../context/AuthContext';

export default function VerifyResetOtpPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pending, setPending] = useState(() => getPendingResetOtp());
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pending) {
      navigate('/forgot-password', { replace: true });
      return undefined;
    }
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.floor((pending.expiresAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pending, navigate]);

  const handleDigitChange = (idx, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError('');
    if (clean && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Masukkan 6 digit kode OTP pemulihan.');
      return;
    }
    setSubmitting(true);
    try {
      const { token } = await verifyPasswordResetOtp(code);
      showToast('OTP terverifikasi. Silakan buat kata sandi baru.', 'success');
      navigate(`/reset-password/${token}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendPasswordResetOtp();
      setPending(getPendingResetOtp());
      setDigits(['', '', '', '', '', '']);
      showToast(`Kode OTP baru (${res.otpDemo}) diterbitkan.`, 'info');
    } catch (err) {
      setError(err.message);
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <AuthLayout
      title="Verifikasi OTP Pemulihan"
      subtitle={`Kode dikirimkan untuk akun ${pending?.email || ''}`}
    >
      {pending && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950"
        >
          <span className="font-bold uppercase block text-amber-800 mb-1">
            Mode Demo — Kode OTP Reset Sandi
          </span>
          Gunakan kode OTP:{' '}
          <strong className="font-mono text-base tracking-widest bg-white px-2 py-0.5 rounded border border-amber-300">
            {pending.otp}
          </strong>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="otp-input-grid">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit OTP pemulihan ke-${idx + 1}`}
              value={d}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
                  inputRefs.current[idx - 1]?.focus();
                }
              }}
              className="w-full h-12 text-center text-lg font-extrabold font-mono rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Sisa waktu: <strong className="font-mono text-slate-900">{mm}:{ss}</strong>
          </span>
          <button type="button" onClick={handleResend} className="font-bold text-blue-600 hover:underline">
            Kirim Ulang Kode
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
        >
          {submitting ? 'Memverifikasi...' : 'Lanjutkan Atur Ulang Sandi'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline">
          Ganti alamat email
        </Link>
      </p>
    </AuthLayout>
  );
}

