import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../context/AuthContext';
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[150px] truncate">{user?.name || 'Pelanggan'}</span>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              aria-label="Keluar dari akun"
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Icon name="logout" size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="portal-main">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo. Portal Klien Radio Telekomunikasi B2B.
      </footer>

      {/* Modal Konfirmasi Logout */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Konfirmasi Keluar Sesi"
        subtitle="Apakah Anda yakin ingin keluar dari Portal Pelanggan?"
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
          Anda dapat masuk kembali kapan saja menggunakan email atau username dan kata sandi Anda.
        </p>
      </Modal>
    </div>
  );
}
