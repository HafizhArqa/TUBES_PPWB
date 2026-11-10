/**
 * @file Navbar.jsx
 * @description Header & Sidebar Navigation BankFlash bertema Putih, Grey, dan Hover Biru.
 * Memuat tepat 3 link navigasi sesuai instruksi: Dashboard, Kelola Data Unit, dan Data Pelanggan.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Modal from './Modal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dark mode state dengan persistensi localStorage
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('dark');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('dark', JSON.stringify(isDark));
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const rawUser = sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { name: 'Admin TERA', email: 'admin@tera.com' };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setLogoutOpen(false);
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Overview';
    if (path.includes('/units')) return 'Kelola Data Unit';
    if (path.includes('/pelanggan')) return 'Data Pelanggan';
    return 'Overview';
  };

  // TEPAT 3 NAV LINKS SESUAI INSTRUKSI & REFERENSI BANKFLASH:
  // 1. Dashboard -> Home Icon
  // 2. Kelola Data Unit -> Transactions / Card Icon
  // 3. Data Pelanggan -> User / Accounts Icon
  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'home', exact: true },
    { to: '/admin/units', label: 'Kelola Data Unit', icon: 'transactions' },
    { to: '/admin/pelanggan', label: 'Data Pelanggan', icon: 'user' },
  ];

  return (
    <>
      {/* =========================================================================
          1. SIDEBAR FIXED: 3 NAV LINKS SAJA (PUTIH, GREY, HOVER BIRU)
          ========================================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 lg:w-[250px] z-50 flex flex-col justify-between py-6 bg-white dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155] transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand TERA: Putih, Grey, Aksen Biru */}
          <div className="px-7 pb-8 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <Icon name="card" size={22} />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#1E293B] dark:text-white transition-colors group-hover:text-blue-600">
                  TERA<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block -mt-0.5">Telekomindo</span>
              </div>
            </div>

            {/* Tombol Tutup Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-400 hover:text-blue-600 p-1 transition-colors"
              aria-label="Tutup Menu"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* 3 Nav Links */}
          <nav className="flex flex-col space-y-1.5 px-3" aria-label="Menu Utama">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'text-blue-600 font-bold bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm'
                      : 'text-[#64748B] dark:text-[#94A3B8] font-medium hover:text-blue-600 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 dark:hover:text-blue-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Indicator Pill */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-md"
                        aria-hidden="true"
                      />
                    )}
                    <Icon
                      name={item.icon}
                      size={20}
                      className={`transition-all group-hover:scale-110 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-[#64748B] group-hover:text-blue-600'
                      }`}
                    />
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar: Tombol Logout & Info */}
        <div className="px-5 pt-4 space-y-3 border-t border-[#E2E8F0] dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all group text-left"
          >
            <Icon name="logout" size={18} className="group-hover:scale-110 group-hover:text-rose-600 transition-transform" />
            <span>Keluar Sistem</span>
          </button>

          <div className="px-4 py-1 flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="hover:text-blue-600 transition-colors font-medium">TERA System v2.5</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sistem Aktif" />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          2. TOPBAR HEADER (PUTIH, GREY, HOVER BIRU)
          ========================================================================= */}
      <header className="bank-topbar lg:ml-[250px] sticky top-0 z-30 bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-8 flex items-center justify-between h-20">
        {/* Kiri: Toggle Mobile & Judul Halaman */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#64748B] hover:text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Buka Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* Kanan: Search Pill + Notification + Setting + Dark Mode + Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Pill: Background Grey, Border Hover Biru */}
          <div className="hidden md:flex items-center gap-3 bg-[#F1F5F9] dark:bg-gray-800/80 rounded-full px-5 py-2.5 w-56 lg:w-64 border border-[#E2E8F0] dark:border-gray-700 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Icon name="search" size={18} className="text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for something"
              className="bg-transparent text-sm text-[#1E293B] dark:text-white placeholder-[#64748B] outline-none w-full"
            />
          </div>

          {/* Setting Icon Button: Grey, Hover Biru */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center text-[#64748B] hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all"
            title="Pengaturan & Keluar"
            aria-label="Pengaturan"
          >
            <Icon name="setting" size={20} />
          </button>

          {/* Notification Button: Grey, Hover Biru */}
          <button
            type="button"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center text-[#64748B] hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all relative"
            title="Notifikasi"
            aria-label="Notifikasi"
          >
            <Icon name="bell" size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-800" />
          </button>

          {/* Theme Mode Toggle: Grey, Hover Biru */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center text-[#64748B] hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all"
            title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
            aria-label="Ganti Tema"
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={20} />
          </button>

          {/* Avatar Profile */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer group" onClick={() => setLogoutOpen(true)}>
            <img
              src=""
              alt="Avatar Admin"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#E2E8F0] dark:ring-gray-700 group-hover:ring-blue-600 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Modal Konfirmasi Logout */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Konfirmasi Keluar Akun"
        subtitle="Sesi administrator Anda akan diakhiri secara aman"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="px-5 py-2 rounded-full border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-md shadow-rose-500/20 transition-all"
            >
              Ya, Keluar
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <p>
            Anda sedang masuk sebagai <strong className="text-[#1E293B] dark:text-white">{user.name}</strong> ({user.email}).
          </p>
          <p>
            Apakah Anda yakin ingin keluar dari sistem BankFlash TERA? Anda perlu memasukkan kredensial akun kembali untuk mengakses halaman manajemen.
          </p>
        </div>
      </Modal>
    </>
  );
}
