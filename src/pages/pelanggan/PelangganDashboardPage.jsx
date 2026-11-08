/**
 * @file PelangganDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Portal Pelanggan Korporat B2B TERA. Menampilkan ringkasan kontrak aktif,
 * notifikasi permohonan sewa, akses cepat ke katalog perangkat, dan status pengadaan.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerRentalRequests, getCartItems } from '../../services/portalPelangganService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateId } from '../../utils/formatters';

export default function PelangganDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getCustomerRentalRequests(user);
      setRequests(list);
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

  const cartCount = getCartItems(user?.id).reduce((s, c) => s + (Number(c.qty) || 0), 0);
  const activeContracts = requests.filter((r) => r.status === 'Aktif').length;

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
            to="/pelanggan/permintaan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
          >
            <span>Pantau Proyek ({requests.length})</span>
          </Link>
        </div>
      </section>

      {/* 3 Quick Access Cards */}
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
              <h2 className="text-base font-bold text-slate-900">Keranjang Pengajuan</h2>
              <p className="text-xs text-slate-500 mt-1">
                 saat ini terdapat <strong className="text-slate-900">{cartCount} unit</strong> siap diajukan proposal sewa.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Icon name="cart" size={20} />
            </span>
          </div>
          <Link to="/pelanggan/keranjang" className="text-xs font-bold text-blue-600 hover:underline">
            Lanjutkan Checkout Proposal &rarr;
          </Link>
        </article>

        <article className="tera-card tera-card-hover p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Status Kontrak & Tender</h2>
              <p className="text-xs text-slate-500 mt-1">
                <strong className="text-emerald-700">{activeContracts} kontrak aktif</strong> dari total {requests.length} pengajuan proyek.
              </p>
            </div>
            <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Icon name="briefcase" size={20} />
            </span>
          </div>
          <Link to="/pelanggan/permintaan" className="text-xs font-bold text-blue-600 hover:underline">
            Lihat Riwayat & Tagihan &rarr;
          </Link>
        </article>
      </section>

      {/* Recent Requests & Account Card */}
      <div className="dashboard-split-grid">
        <section className="tera-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Permohonan & Proyek Sewa Terbaru</h2>
            <Link to="/pelanggan/permintaan" className="text-xs font-semibold text-blue-600 hover:underline">
              Semua Permohonan
            </Link>
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
                    <th />
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
                      <td className="text-right">
                        <Link
                          to={`/pelanggan/permintaan/${req.id_request}`}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Detail
                        </Link>
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

