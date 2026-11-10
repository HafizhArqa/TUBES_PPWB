/**
 * @file ForgotPasswordPage.jsx
 * @author Hafizh Arqamilandri Wakhyudi
 * @description Inisiasi komponen halaman pemulihan kata sandi sistem TERA
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot password inisiasi:', email);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] p-4 font-sans">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-8">
        <section className="bg-white border border-[#E2E8F0] shadow-sm rounded-[22px] p-7">
          <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">Pemulihan Kata Sandi</h1>
          <p className="text-xs text-[#64748B] text-center mb-6">Inisiasi form reset kata sandi</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Alamat Email Terdaftar</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@tera.com"
                className="w-full rounded-[14px] border px-4 py-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-blue-600 text-white text-xs font-bold"
            >
              Kirim Instruksi Reset
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-blue-600 font-semibold">
                Kembali ke Login
              </Link>
            </div>
          </form>
        </section>
      </main>

      <footer className="text-center text-xs text-[#64748B] py-2">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo (TERA). Modul Autentikasi.
      </footer>
    </div>
  );
}
