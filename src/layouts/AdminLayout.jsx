import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { resetMockDatabase } from '../services/mockDb';
import { isSimulatedApiErrorEnabled, setSimulatedApiError } from '../services/apiClient';

const NAV_GROUPS = [
  {
    heading: 'Utama',
    items: [{ to: '/admin/dashboard', label: 'Dashboard Eksekutif', icon: 'dashboard' }],
  },
  {
    heading: 'Inventaris Perangkat',
    items: [
      { to: '/admin/units', label: 'Kelola Unit Radio', icon: 'box' },
      { to: '/admin/status-unit', label: 'Status Fisik Unit', icon: 'layers' },
    ],
  },
  {
    heading: 'Manajemen Master Data',
    items: [
      { to: '/admin/pelanggan', label: 'Master Pelanggan B2B', icon: 'building' },
      { to: '/admin/master-tarif', label: 'Master Tarif & Standar', icon: 'tag' },
    ],
  },
  {
    heading: 'Komersial & Proyek B2B',
    items: [
      { to: '/admin/transaksi', label: 'Transaksi & Proyek', icon: 'briefcase', end: true },
      { to: '/admin/transaksi/create', label: 'Buat Transaksi Baru', icon: 'plus' },
      { to: '/admin/angsuran', label: 'Monitoring Angsuran', icon: 'receipt' },
    ],
  },
  {
    heading: 'Pelaporan & Analitik',
    items: [
      { to: '/admin/laporan-penyewaan', label: 'Laporan Penyewaan', icon: 'chart' },
      { to: '/admin/laporan-pendapatan', label: 'Laporan Pendapatan', icon: 'wallet' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [simError, setSimError] = useState(() => isSimulatedApiErrorEnabled());

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
    showToast(
      next
        ? 'Simulasi Gangguan API diaktifkan. Buka/muat halaman untuk menguji Error State & tombol Coba Lagi.'
        : 'Simulasi Gangguan API dimatikan. Koneksi Mock API kembali normal.',
      next ? 'warning' : 'info'
    );
  };

  const handleResetDemoDb = async () => {
    setResetting(true);
    try {
      setSimulatedApiError(false);
      setSimError(false);
      await resetMockDatabase();
      showToast('Database demo berhasil di-reset ulang dari endpoint /api/*.json!', 'success');
      setResetModalOpen(false);
      window.location.reload();
    } catch (err) {
      showToast(err.message || 'Gagal mereset database demo.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutModalOpen(false);
    showToast('Anda telah keluar dari sesi Admin TERA.', 'info');
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      {/* Backdrop Mobile Sidebar */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-50 lg:hidden"
        />
      )}

      {/* Semantic Aside Sidebar */}
      <aside
        aria-label="Navigasi utama panel admin"
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
              <Icon name="radio" size={20} />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white">
                TERA <span className="text-sky-400">ADMIN</span>
              </span>
              <span className="block text-[11px] text-slate-400">PT Utama Telekomindo</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu samping"
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav aria-label="Daftar modul administrasi" className="flex-1 px-3.5 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.heading}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
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

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
          >
            <Icon name="refresh" size={14} />
            <span>Reset Data Mock API</span>
          </button>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-xs font-semibold text-red-200 border border-red-400/20 transition-colors"
          >
            <Icon name="logout" size={14} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Icon name="menu" size={20} />
            </button>

            <form onSubmit={handleQuickSearch} role="search" className="hidden sm:flex items-center max-w-md w-full">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="search"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  aria-label="Cari cepat kode atau nama perangkat"
                  placeholder="Cari cepat unit radio (mis. SLR 5300, UTR-RPT)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none text-xs font-medium"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSimError}
              title="Fitur demonstrasi Error State & Retry UI"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                simError
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Icon name="alert" size={14} />
              <span>{simError ? 'Simulasi Error: ON' : 'Uji Error API'}</span>
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
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
            </Link>
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
          Seluruh perubahan data transaksi, inventaris, dan faktur yang sudah disimpan tetap aman tersimpan di penyimpanan lokal browser Anda.
        </p>
      </Modal>

      {/* Modal Reset Database Demo */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Ulang Database Mock API?"
        subtitle="Mengambil ulang seluruh data awal dari file JSON di /api/*.json melalui Axios."
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
              {resetting ? 'Memuat Ulang JSON...' : 'Ya, Reset Data Awal'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Tindakan ini akan mengembalikan daftar unit, pelanggan, kontrak, dan invoice kembali ke dataset awal PT Utama Telekomindo.
        </p>
      </Modal>
    </div>
  );
}

