import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { resetMockDatabase } from '../services/mockDb';
import { isSimulatedApiErrorEnabled, setSimulatedApiError } from '../services/apiClient';

const NAV_GROUPS = [
  {
    heading: 'Utama',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    heading: 'Inventaris',
    items: [{ to: '/admin/units', label: 'Kelola Unit Radio', icon: 'box' }],
  },
  {
    heading: 'Master Data',
    items: [{ to: '/admin/pelanggan', label: 'Data Pelanggan', icon: 'building' }],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [simError, setSimError] = useState(() => isSimulatedApiErrorEnabled());
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const q = quickQuery.trim();
    if (!q) return;
    navigate(`/admin/units?q=${encodeURIComponent(q)}`);
    setQuickQuery('');
  };

  const handleToggleSimError = () => {
    const next = !simError;
    setSimulatedApiError(next);
    setSimError(next);
    triggerToast(
      next
        ? 'Simulasi Gangguan API diaktifkan. Buka halaman untuk menguji Error State & tombol Coba Lagi.'
        : 'Simulasi Gangguan API dimatikan. Koneksi Mock API normal.',
      next ? 'warning' : 'info'
    );
  };

  const handleResetDemoDb = async () => {
    setResetting(true);
    try {
      setSimulatedApiError(false);
      setSimError(false);
      await resetMockDatabase();
      triggerToast('Database demo berhasil di-reset ulang dari Mock API!', 'success');
      setResetModalOpen(false);
      window.location.reload();
    } catch (err) {
      triggerToast(err.message || 'Gagal mereset database demo.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-blue-50 text-blue-800 border-blue-300'
          }`}
        >
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 font-bold"
            aria-label="Tutup notifikasi"
          >
            &times;
          </button>
        </div>
      )}

      {/* Backdrop Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ASIDE SIDEBAR */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        aria-label="Navigasi Utama Admin"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30">
              <Icon name="radio" size={22} />
            </span>
            <div>
              <span className="block font-black text-white text-base tracking-wide">
                TERA <span className="text-sky-400">ADMIN</span>
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">
                PT Utama Telekomindo
              </span>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu sidebar"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
            {String(user?.name || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@tera.co.id'}</p>
          </div>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Aktif" />
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto" aria-label="Menu Aplikasi">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.heading}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `sidebar-nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <Icon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Action Buttons: Reset & Logout */}
        <div className="p-3 border-t border-white/10 space-y-1.5 text-xs">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Icon name="refresh" size={16} />
              Reset Database Mock
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Icon name="logout" size={16} />
              Keluar Sesi
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Icon name="menu" size={20} />
            </button>

            {/* Quick Search */}
            <form onSubmit={handleQuickSearch} className="relative hidden md:block">
              <input
                type="search"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Cari Serial / Model Unit..."
                className="w-64 lg:w-80 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Icon name="search" size={14} />
              </span>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Simulasi Gangguan API */}
            <button
              type="button"
              onClick={handleToggleSimError}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                simError
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Aktifkan simulasi galat jaringan (500) untuk menguji penanganan Error State"
            >
              <span className={`w-2 h-2 rounded-full ${simError ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline">Simulasi Galat:</span>
              <span>{simError ? 'Aktif' : 'Normal'}</span>
            </button>

            {/* User Info Badge */}
            <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {String(user?.name || 'A').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="block text-[10px] font-semibold uppercase text-blue-600">
                  Admin Operasional
                </span>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="admin-content">
          <Outlet />
        </main>

        <footer className="px-6 py-4 border-t border-slate-200/80 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 no-print">
          <span>&copy; {new Date().getFullYear()} PT Utama Telekomindo — Sistem TERA v1.0</span>
          <span>React 18 &bull; CSS Grid/Flexbox + Tailwind &bull; Axios Mock &amp; Public API</span>
        </footer>
      </div>

      {/* Modal Konfirmasi Logout */}
      <Modal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Konfirmasi Keluar Sesi"
        subtitle="Apakah Anda yakin ingin mengakhiri sesi kerja Admin TERA?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setLogoutModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white"
            >
              Ya, Keluar Sekarang
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Seluruh perubahan data inventaris dan master data yang sudah disimpan tetap aman tersimpan di penyimpanan lokal browser Anda.
        </p>
      </Modal>

      {/* Modal Reset Database Demo */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Ulang Database Mock API?"
        subtitle="Mengambil ulang seluruh data awal dari Mock API."
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDemoDb}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white disabled:opacity-50"
            >
              {resetting ? 'Memuat Ulang...' : 'Ya, Reset Data Awal'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Tindakan ini akan mengembalikan daftar unit dan pelanggan kembali ke dataset awal.
        </p>
      </Modal>
    </div>
  );
}
