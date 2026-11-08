import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Modal from './Modal';

export default function Navbar() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawUser = sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { name: 'Admin TERA', email: 'admin@tera.com' };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setLogoutOpen(false);
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/units', label: 'Kelola Unit Radio', icon: 'box' },
    { to: '/admin/pelanggan', label: 'Data Pelanggan', icon: 'building' },
  ];

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                <Icon name="radio" size={18} />
              </span>
              <div>
                <span className="block text-base font-extrabold tracking-tight text-white leading-none">
                  TERA <span className="text-sky-400">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-400">PT Utama Telekomindo</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi Utama">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Session & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold">{user.name || 'Admin'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Keluar Sesi"
              >
                <Icon name="logout" size={14} />
                <span>Keluar</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Menu"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setLogoutOpen(true);
              }}
              className="w-full mt-2 text-left px-3 py-2 rounded-lg bg-red-600/20 text-red-300 text-xs font-bold"
            >
              Keluar Sesi
            </button>
          </div>
        )}
      </header>

      {/* Modal Konfirmasi Logout */}
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
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white"
            >
              Ya, Keluar
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Anda akan keluar dan diarahkan kembali ke halaman login.
        </p>
      </Modal>
    </>
  );
}
