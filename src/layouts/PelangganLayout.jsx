import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

export default function PelangganLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutOpen(false);
    showToast('Anda telah keluar dari Portal Pelanggan TERA.', 'info');
    navigate('/login');
  };

  const navLinks = [
    { to: '/pelanggan/dashboard', label: 'Dashboard Portal', icon: 'dashboard' },
    { to: '/pelanggan/katalog', label: 'Katalog Perangkat', icon: 'radio' },
  ];

  return (
    <div className="portal-shell">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <header className="portal-navbar">
        <div className="portal-navbar-inner">
          <Link to="/pelanggan/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Icon name="radio" size={18} />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white">
                TERA <span className="text-sky-400">CLIENT PORTAL</span>
              </span>
              <span className="block text-[11px] text-slate-300">PT Utama Telekomindo</span>
            </div>
          </Link>

          <nav aria-label="Menu portal pelanggan" className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white"
            >
              <Icon name="user" size={15} />
              <span className="max-w-[140px] truncate">{user?.name || 'Pelanggan'}</span>
            </Link>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              aria-label="Keluar dari akun"
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Buka menu portal"
            className="md:hidden p-2 rounded-xl bg-white/10 text-white"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Menu portal seluler"
            className="md:hidden px-4 pb-4 pt-2 border-t border-white/10 space-y-1.5"
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
                  }`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-white/10 text-xs font-semibold text-white"
              >
                Profil Saya
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500/25 text-xs font-semibold text-red-200"
              >
                Keluar
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="portal-main">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 px-6 text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PT Utama Telekomindo — Layanan Sewa Radio B2B</span>
          <span>Hotline Teknis 24/7: (021) 5290-8800 &bull; sales@tera.co.id</span>
        </div>
      </footer>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Keluar dari Portal Pelanggan?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 text-xs font-semibold text-white"
            >
              Ya, Keluar
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Item di dalam keranjang pengajuan sewa Anda tetap tersimpan untuk kunjungan berikutnya.
        </p>
      </Modal>
    </div>
  );
}

