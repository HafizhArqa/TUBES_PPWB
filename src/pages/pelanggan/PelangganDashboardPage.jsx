/**
 * @file PelangganDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Portal Pelanggan Korporat B2B TERA. Menampilkan ringkasan akun mitra,
 * status kontrak sewa aktif, dan permohonan pengadaan perangkat radio telekomunikasi.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPelangganDashboardStats } from '../../services/dashboardService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateId } from '../../utils/formatters';

export default function PelangganDashboardPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState({ requests: [], activeContractsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPelangganDashboardStats(user);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState message="Memuat ringkasan portal pelanggan..." rows={3} />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const { requests, activeContractsCount } = data;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="tera-dark-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/25">
            <Icon name="radio" size={14} />
            Portal Klien B2B — PT Utama Telekomindo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, {user?.name || 'Mitra B2B'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sistem informasi penyewaan perangkat radio Repeater, Base Station, Handy Talkie Explosion Proof, dan HF SSB untuk operasional industri telekomunikasi, pertambangan, maritim, dan konstruksi.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs">
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Status Layanan SLA</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              99.5% Uptime Dijamin
            </span>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section aria-label="Ringkasan Status Klien" className="kpi-grid-3">
        <article className="tera-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kontrak Sewa Berjalan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Saat ini terdapat <strong className="text-emerald-700">{activeContractsCount} kontrak sewa aktif</strong> dengan jaminan penggantian unit 1x24 jam.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Icon name="box" size={20} />
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block w-fit">
            &bull; Kontrak Beroperasi Normal
          </span>
        </article>

        <article className="tera-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dukungan Hot-Swap Radio</h2>
              <p className="text-xs text-slate-500 mt-1">
                Layanan penggantian unit cadangan tersedia 24/7 untuk menjaga kontinuitas komunikasi di area site kritis.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon name="radio" size={20} />
            </span>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block w-fit">
            &bull; Hot-Swap Ready
          </span>
        </article>

        <article className="tera-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Perwakilan PIC Terdaftar</h2>
              <p className="text-xs text-slate-500 mt-1">
                Akun terverifikasi sebagai perwakilan resmi procurement korporat mitra TERA.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Icon name="building" size={20} />
            </span>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg inline-block w-fit">
            &bull; Akun Terverifikasi
          </span>
        </article>
      </section>

      {/* Requests & Account Details */}
      <div className="dashboard-split-grid">
        <section className="tera-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Permohonan & Proyek Sewa Terdaftar</h2>
            <span className="text-xs font-semibold text-slate-500">{requests.length} Permohonan</span>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada permohonan penyewaan aktif yang tercatat.
            </div>
          ) : (
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Kode Proyek</th>
                    <th>Lokasi Site</th>
                    <th>Durasi</th>
                    <th>Estimasi Nilai</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 4).map((req) => (
                    <tr key={req.id_request}>
                      <td>
                        <span className="font-mono font-bold text-blue-700 text-xs">{req.kode_request}</span>
                        <span className="block text-[11px] text-slate-400">{formatDateId(req.created_at)}</span>
                      </td>
                      <td className="text-xs font-medium text-slate-700">{req.lokasi_site}</td>
                      <td className="text-xs">{req.durasi_sewa_bulan} Bulan</td>
                      <td className="text-xs font-bold text-slate-900">{formatRupiah(req.estimasi_total)}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="tera-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Informasi Akun Terdaftar</h2>
          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Nama Perwakilan</dt>
              <dd className="font-bold text-slate-900">{user?.name}</dd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Username</dt>
              <dd className="font-mono text-slate-800">{user?.username || '—'}</dd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Email Resmi</dt>
              <dd className="text-slate-800">{user?.email}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Hak Akses</dt>
              <dd className="font-semibold text-emerald-700">Mitra Korporat B2B</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors border border-red-200"
          >
            Keluar Sesi Akun
          </button>
        </aside>
      </div>
    </div>
  );
}
