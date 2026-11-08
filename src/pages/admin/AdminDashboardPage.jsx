/**
 * @file AdminDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Operasional & Komersial Administrator TERA. Menampilkan 4 KPI Utama,
 * visualisasi grafik SVG arus kas bulanan, daftar unit disewa di site klien, dan log aktivitas sistem.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats } from '../../services/dashboardService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import AreaLineChart from '../../components/AreaLineChart';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatCompactRupiah, formatDateTimeId } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartMetric, setChartMetric] = useState('realisasi');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminDashboardStats();
      setStats(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <LoadingState message="Memuat metrik eksekutif TERA..." rows={4} />;
  if (error || !stats) return <ErrorState message={error} onRetry={loadStats} />;

  const { kpi, monthlySeries, rentedUnits, recentLogs } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Operasional & Komersial</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan real-time inventaris radio, kontrak sewa B2B aktif, dan realisasi arus kas PT Utama Telekomindo
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/units"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
          >
            <Icon name="box" size={16} />
            <span>Kelola Unit Radio</span>
          </Link>
          <Link
            to="/admin/master-tarif"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
          >
            <Icon name="tag" size={16} />
            <span>Master Tarif Acuan</span>
          </Link>
        </div>
      </header>

      {/* 4 KPI Cards */}
      <section aria-label="Indikator kinerja utama" className="kpi-grid-4">
        <article className="tera-card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Unit Perangkat</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Icon name="box" size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{kpi.totalUnits}</p>
          <Link to="/admin/units" className="text-[11px] font-bold text-blue-600 hover:underline mt-2 inline-block">
            Kelola Inventaris &rarr;
          </Link>
        </article>

        <article className="tera-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Unit Siap Sewa (Tersedia)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Icon name="check" size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{kpi.unitTersedia}</p>
          <span className="text-[11px] text-slate-500 mt-2 block">Siap dimobilisasi dari Gudang Pusat</span>
        </article>

        <article className="tera-card p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Unit Terpasang (Disewa)</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Icon name="radio" size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{kpi.unitDisewa}</p>
          <Link to="/admin/status-unit" className="text-[11px] font-bold text-indigo-600 hover:underline mt-2 inline-block">
            Pantau Lokasi Site &rarr;
          </Link>
        </article>

        <article className="tera-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kontrak Korporat Aktif</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Icon name="briefcase" size={18} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{kpi.kontrakAktif}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-2 block">
            +{kpi.pendingRequestsCount} permohonan tender aktif
          </span>
        </article>
      </section>

      {/* Chart + Dark Portfolio Summary */}
      <div className="dashboard-split-grid">
        <section className="tera-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grafik Arus Kas & Tagihan Bulanan (2026)</h2>
              <p className="text-xs text-slate-500">
                Arahkan kursor atau tekan Tab pada titik grafik untuk melihat nominal detail
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMetric('realisasi')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  chartMetric === 'realisasi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Kas Terverifikasi
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('tagihan')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  chartMetric === 'tagihan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Tagihan Terbit
              </button>
            </div>
          </div>

          <AreaLineChart
            data={monthlySeries}
            valueKey={chartMetric}
            ariaLabel="Grafik tren pendapatan bulanan PT Utama Telekomindo"
          />
        </section>

        <aside className="tera-dark-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-sky-300">
              Nilai Portofolio Kontrak Aktif
            </span>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {formatCompactRupiah(kpi.totalNilaiKontrakAktif)}
            </p>
            <p className="text-xs text-slate-300">
              Nominal eksak: <strong className="font-mono">{formatRupiah(kpi.totalNilaiKontrakAktif)}</strong>
            </p>

            <div className="pt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Capaian Target Tahunan ({formatCompactRupiah(kpi.targetTahunan)})</span>
                <strong className="text-emerald-400">{kpi.capaianPersen}%</strong>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                  style={{ width: `${kpi.capaianPersen}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <p className="font-bold text-white"> Standar Operasional B2B TERA</p>
            <p className="text-slate-300 leading-relaxed">
              Seluruh kontrak sewa dilengkapi jaminan ketersediaan frekuensi SLA 99,5% dan dukungan penggantian perangkat Hot-Swap 1x24 jam.
            </p>
            <Link
              to="/admin/master-tarif"
              className="inline-block pt-1 font-bold text-sky-300 hover:underline"
            >
              Lihat Master Tarif &amp; SLA &rarr;
            </Link>
          </div>
        </aside>
      </div>

      {/* Bottom Split: Rented Units & Activity Log */}
      <div className="dashboard-split-grid">
        <section className="tera-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Daftar Unit Sedang Beroperasi di Site Klien</h2>
            <Link to="/admin/status-unit" className="text-xs font-bold text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="tera-table-wrap">
            <table className="tera-table">
              <thead>
                <tr>
                  <th>Kode & Unit</th>
                  <th>Klien Penyewa</th>
                  <th>Lokasi Site</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rentedUnits.slice(0, 6).map((u) => (
                  <tr key={u.id_unit}>
                    <td>
                      <span className="font-mono text-xs font-bold text-blue-700">{u.kode_unit}</span>
                      <span className="block text-xs font-semibold text-slate-800">{u.nama_unit}</span>
                    </td>
                    <td className="text-xs font-semibold text-slate-800">{u.klien || 'Mitra Korporat'}</td>
                    <td className="text-xs text-slate-600">{u.lokasi}</td>
                    <td>
                      <StatusBadge status={u.status_unit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="tera-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Audit Trail & Aktivitas Terkini</h2>
          <ol className="space-y-3.5 border-l-2 border-blue-200 pl-3.5">
            {recentLogs.map((log) => (
              <li key={log.id_log} className="text-xs">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-slate-900">{log.aksi}</strong>
                  <span className="text-[11px] text-slate-400">{formatDateTimeId(log.created_at)}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.deskripsi}</p>
                <span className="text-[11px] text-blue-600 font-medium">Oleh: {log.user_nama}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

