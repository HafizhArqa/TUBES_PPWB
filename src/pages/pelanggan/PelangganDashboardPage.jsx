/**
 * @file PelangganDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Portal Pelanggan Korporat B2B TERA. Menampilkan ringkasan kontrak aktif,
 * notifikasi permohonan sewa, akses cepat ke katalog perangkat, dan status pengadaan.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPelangganDashboardStats } from '../../services/laporanService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateId } from '../../utils/formatters';

export default function PelangganDashboardPage() {
  const { user } = useAuth();
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
            Portal Mitra B2B PT Utama Telekomindo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ajukan penyewaan perangkat radio Repeater, Base Station, Handy Talkie Explosion Proof, hingga HF SSB untuk operasional tambang, maritim, dan kilang dengan jaminan SLA 99,5%.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/pelanggan/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-colors"
          >
            <Icon name="radio" size={16} />
            <span>Jelajahi Katalog Unit</span>
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
          >
            <Icon name="user" size={16} />
            <span>Kelola Profil Akun</span>
          </Link>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section aria-label="Menu akses cepat" className="kpi-grid-3">
        <article className="tera-card tera-card-hover p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Katalog Perangkat Radio</h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih unit Repeater, Rig Base, HT Digital, dan HF SSB siap deploy.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon name="radio" size={20} />
            </span>
          </div>
          <Link to="/pelanggan/katalog" className="text-xs font-bold text-blue-600 hover:underline">
            Buka Katalog Sewa &rarr;
          </Link>
        </article>

        <article className="tera-card tera-card-hover p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kontrak Berjalan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Saat ini terdapat <strong className="text-emerald-700">{activeContractsCount} kontrak sewa aktif</strong> dengan jaminan SLA operasional 99.5%.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Icon name="shieldCheck" size={20} />
            </span>
          </div>
          <Link to="/pelanggan/katalog" className="text-xs font-bold text-emerald-600 hover:underline">
            Lihat Unit Tersedia &rarr;
          </Link>
        </article>

        <article className="tera-card tera-card-hover p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Profil & Keamanan Akun</h2>
              <p className="text-xs text-slate-500 mt-1">
                Perbarui data perwakilan procurement dan kata sandi korporat akun Anda.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Icon name="user" size={20} />
            </span>
          </div>
          <Link to="/profile" className="text-xs font-bold text-sky-600 hover:underline">
            Pengaturan Akun &rarr;
          </Link>
        </article>
      </section>

      {/* Recent Requests & Account Card */}
      <div className="dashboard-split-grid">
        <section className="tera-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Permohonan & Proyek Sewa Terdaftar</h2>
            <span className="text-xs font-semibold text-slate-500">{requests.length} Permohonan</span>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada permohonan penyewaan. Silakan pilih perangkat pada menu Katalog.
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
          <Link
            to="/profile"
            className="block text-center w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            Kelola Profil & Kata Sandi
          </Link>
        </aside>
      </div>
    </div>
  );
}

