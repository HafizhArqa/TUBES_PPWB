/**
 * @file Navbar.jsx
 * @description Header & Sidebar Admin terpadu dengan tema Tailwind Blue & Dark Mode.
 * Mengintegrasikan Header Tetap (h-14), Sidebar Responsif (hover expandable),
 * Dark Mode toggle dengan persistensi local storage, dan modal konfirmasi Logout.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Modal from './Modal';

export default function Navbar() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dark mode state dengan inisialisasi dari localStorage / prefers-color-scheme
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

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const rawUser = sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { name: 'Admin TERA', email: 'admin@tera.com' };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setLogoutOpen(false);
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      author: 'Marta Safitri',
      badge: 'Live',
      badgeColor: 'text-blue-500 bg-indigo-50 dark:bg-gray-700 dark:text-blue-400',
    },
    {
      to: '/admin/units',
      label: 'Kelola Unit',
      icon: 'box',
      author: 'Steven Taufik Fajar',
      badge: '18 Unit',
      badgeColor: 'text-emerald-500 bg-emerald-50 dark:bg-gray-700 dark:text-emerald-400',
    },
    {
      to: '/admin/pelanggan',
      label: 'Master Pelanggan',
      icon: 'building',
      author: 'Zakaria',
      badge: 'B2B',
      badgeColor: 'text-amber-500 bg-amber-50 dark:bg-gray-700 dark:text-amber-400',
    },
  ];

  return (
    <>
      {/* =========================================================================
          1. HEADER TETAP (HEIGHT: h-14)
          ========================================================================= */}
      <header className="fixed w-full flex items-center justify-between h-14 text-white z-20 top-0 left-0">
        {/* Brand / Logo Kiri */}
        <div className="flex items-center justify-start md:justify-center pl-3 w-14 md:w-64 h-14 bg-blue-800 dark:bg-gray-800 border-none transition-colors duration-200">
          <span className="w-8 h-8 md:w-9 md:h-9 mr-2 rounded-md bg-white/10 dark:bg-white/20 flex items-center justify-center text-white font-black text-sm">
            <Icon name="radio" size={18} />
          </span>
          <span className="hidden md:inline-block font-extrabold tracking-wider text-sm">
            TERA <span className="text-sky-300">ADMIN</span>
          </span>
        </div>

        {/* Header Bagian Kanan */}
        <div className="flex justify-between items-center h-14 bg-blue-800 dark:bg-gray-800 header-right px-3 sm:px-4 transition-colors duration-200">
          {/* Form Pencarian Cepat */}
          <div className="bg-white dark:bg-gray-700 rounded flex items-center w-full max-w-sm md:max-w-md mr-3 p-1.5 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
            <button
              type="button"
              className="outline-none focus:outline-none text-gray-500 dark:text-gray-300 px-1"
              aria-label="Cari"
            >
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fitur, unit, atau data pelanggan..."
              className="w-full pl-2 text-xs text-black dark:text-white outline-none focus:outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-300"
            />
          </div>

          {/* Action List (Dark Mode Toggle, Divider, User Session, Logout) */}
          <ul className="flex items-center space-x-1 sm:space-x-2">
            {/* Tombol Dark Mode Toggle */}
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
                className="group p-2 transition-colors duration-200 rounded-full shadow-md bg-blue-200 hover:bg-blue-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-yellow-400 focus:outline-none flex items-center justify-center"
              >
                {isDark ? (
                  // Sun Icon saat mode gelap aktif
                  <svg
                    width="18"
                    height="18"
                    className="fill-current text-yellow-300"
                    viewBox="0 0 24 24"
                    stroke="none"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  // Moon Icon saat mode terang aktif
                  <svg
                    width="18"
                    height="18"
                    className="fill-current text-blue-900"
                    viewBox="0 0 24 24"
                    stroke="none"
                  >
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </li>

            {/* Pemisah Vertikal */}
            <li>
              <div className="block w-px h-6 mx-2 sm:mx-3 bg-blue-600 dark:bg-gray-700"></div>
            </li>

            {/* Nama Pengguna & Badge */}
            <li className="hidden sm:flex items-center text-xs font-semibold text-blue-100 dark:text-gray-200 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
              <span className="truncate max-w-[120px]">{user.name || 'Admin'}</span>
            </li>

            {/* Tombol Logout */}
            <li>
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="flex items-center px-2 py-1.5 rounded text-xs font-bold text-red-200 hover:text-white hover:bg-red-700/40 transition-colors"
                title="Keluar Sesi"
              >
                <span className="inline-flex mr-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* =========================================================================
          2. SIDEBAR TETAP (HOVER EXPANDABLE w-14 -> w-64)
          ========================================================================= */}
      <aside
        aria-label="Navigasi Menu Admin"
        className="fixed flex flex-col top-14 left-0 w-14 hover:w-64 md:w-64 bg-blue-900 dark:bg-gray-900 h-full text-white transition-all duration-300 border-none z-10 sidebar shadow-xl"
      >
        <div className="overflow-y-auto overflow-x-hidden flex flex-col justify-between flex-grow">
          <ul className="flex flex-col py-4 space-y-1">
            <li className="px-5 hidden md:block">
              <div className="flex flex-row items-center h-8">
                <span className="text-xs font-semibold tracking-wider text-blue-300 dark:text-gray-400 uppercase">
                  Menu Utama Tim
                </span>
              </div>
            </li>

            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex flex-row items-center h-11 focus:outline-none pr-4 transition-colors ${
                      isActive
                        ? 'bg-blue-800 dark:bg-gray-800 text-white border-l-4 border-sky-400 dark:border-blue-500 font-semibold shadow-inner'
                        : 'border-l-4 border-transparent hover:border-blue-400 dark:hover:border-gray-600 hover:bg-blue-800/80 dark:hover:bg-gray-800/80 text-blue-100 hover:text-white'
                    }`
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="ml-3 text-xs tracking-wide truncate font-medium">
                    {item.label}
                  </span>
                  <span
                    className={`hidden md:block px-2 py-0.5 ml-auto text-[10px] font-bold tracking-wide rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </NavLink>
              </li>
            ))}

            <li className="px-5 hidden md:block pt-4">
              <div className="flex flex-row items-center h-8 border-t border-blue-800/60 dark:border-gray-800">
                <span className="text-[11px] font-semibold tracking-wider text-blue-300/80 dark:text-gray-500 uppercase">
                  Informasi Sistem
                </span>
              </div>
            </li>

            {/* Info API Status */}
            <li>
              <div className="relative flex flex-row items-center h-10 px-4 text-blue-200 dark:text-gray-400 text-xs">
                <span className="inline-flex justify-center items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </span>
                <span className="ml-3 text-[11px] tracking-wide truncate hidden md:inline">
                  Axios &amp; EMSIFA Active
                </span>
              </div>
            </li>
          </ul>

          {/* Footer Copyright Sidebar */}
          <div className="mb-14 px-4 py-3 hidden md:block text-center text-[10px] text-blue-300/60 dark:text-gray-500 border-t border-blue-800/40 dark:border-gray-800">
            <p className="font-semibold text-blue-200 dark:text-gray-400">PT Utama Telekomindo</p>
            <p>&copy; {new Date().getFullYear()} TERA System</p>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          3. MODAL KONFIRMASI LOGOUT
          ========================================================================= */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Konfirmasi Keluar Sesi"
        subtitle="Apakah Anda yakin ingin mengakhiri sesi kerja sistem?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow transition-colors"
            >
              Ya, Keluar
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Anda akan keluar dari sesi administrator dan diarahkan kembali ke halaman login.
        </p>
      </Modal>
    </>
  );
}
