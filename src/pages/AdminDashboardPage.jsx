/**
 * @file AdminDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Operasional & Komersial Administrator TERA.
 * Menampilkan 4 KPI Utama, grafik SVG arus kas, dan unit disewa dengan fetch data via Axios Mock API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AreaLineChart from '../components/AreaLineChart';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import { LoadingState, ErrorState } from '../components/StatusStates';

const MONTH_LABELS = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];

const formatRupiah = (number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartMetric, setChartMetric] = useState('realisasi');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch data Mock API secara asinkron menggunakan Axios
      const [unitsRes, pelangganRes, kontrakRes] = await Promise.all([
        axios.get('/api/units.json'),
        axios.get('/api/pelanggan.json'),
        axios.get('/api/kontrak.json'),
      ]);

      const units = unitsRes.data || [];
      const pelanggan = pelangganRes.data || [];
      const kontrak = kontrakRes.data || [];

      const totalUnits = units.length;
      const unitTersedia = units.filter((u) => u.status_unit === 'Tersedia').length;
      const unitDisewa = units.filter((u) => u.status_unit === 'Disewa').length;
      const kontrakAktif = kontrak.filter((k) => k.status_kontrak === 'Aktif');
      const totalNilaiKontrak = kontrakAktif.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0);

      // Seri data bulanan arus kas untuk grafik SVG AreaLineChart
      const monthlySeries = MONTH_LABELS.map((label, idx) => ({
        label: `${label} 26`,
        realisasi: 18500000 + idx * 4500000,
        tagihan: 22000000 + idx * 5000000,
      }));

      setStats({
        kpi: {
          totalUnits,
          unitTersedia,
          unitDisewa,
          utilisasiPersen: totalUnits ? Math.round((unitDisewa / totalUnits) * 100) : 0,
          totalPelanggan: pelanggan.length,
          kontrakAktifCount: kontrakAktif.length,
          totalNilaiKontrak,
        },
        monthlySeries,
        rentedUnits: units.filter((u) => u.status_unit === 'Disewa').slice(0, 5),
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard dari Mock API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Operasional</h1>
            <p className="text-xs text-slate-500 mt-1">
              Ringkasan utilisasi perangkat radio komunikasi &amp; monitoring data TERA
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
          >
            <Icon name="refresh" size={14} />
            <span>Segarkan Data API</span>
          </button>
        </header>

        {loading && <LoadingState message="Memuat metrik dashboard via Axios Mock API..." rows={3} />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {stats && !loading && !error && (
          <>
            {/* 4 Kartu KPI Utama */}
            <section aria-label="Metrik Utama" className="kpi-grid-4">
              <article className="tera-card p-5 border-l-4 border-l-blue-600">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Unit Radio</span>
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Icon name="box" size={18} />
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpi.totalUnits}</p>
                <span className="text-[11px] font-semibold text-emerald-600 mt-2 inline-block">
                  {stats.kpi.unitTersedia} unit siap sewa
                </span>
              </article>

              <article className="tera-card p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Utilisasi Armada</span>
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="chart" size={18} />
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpi.utilisasiPersen}%</p>
                <span className="text-[11px] text-slate-500 mt-2 inline-block">
                  {stats.kpi.unitDisewa} unit sedang aktif di site
                </span>
              </article>

              <article className="tera-card p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Mitra Terdaftar</span>
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="building" size={18} />
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpi.totalPelanggan}</p>
                <Link to="/admin/pelanggan" className="text-[11px] font-bold text-indigo-600 hover:underline mt-2 inline-block">
                  Kelola Data Pelanggan &rarr;
                </Link>
              </article>

              <article className="tera-card p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Nilai Kontrak Aktif</span>
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Icon name="wallet" size={18} />
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">
                  {formatRupiah(stats.kpi.totalNilaiKontrak)}
                </p>
                <span className="text-[11px] text-slate-500 mt-2 inline-block">
                  {stats.kpi.kontrakAktifCount} kontrak aktif SLA 99.5%
                </span>
              </article>
            </section>

            {/* Visualisasi Grafik SVG AreaLineChart (Marta Safitri) */}
            <section className="tera-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Visualisasi Arus Kas Bulanan</h2>
                  <p className="text-xs text-slate-500">Grafik interaktif murni SVG (tanpa Chart.js eksternal)</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMetric('realisasi')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      chartMetric === 'realisasi'
                        ? 'bg-white text-blue-600 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Realisasi Pembayaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('tagihan')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      chartMetric === 'tagihan'
                        ? 'bg-white text-blue-600 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Proyeksi Tagihan
                  </button>
                </div>
              </div>

              <div className="w-full">
                <AreaLineChart
                  data={stats.monthlySeries}
                  valueKey={chartMetric}
                  height={260}
                  lineColor={chartMetric === 'realisasi' ? '#2563eb' : '#0284c7'}
                  areaColor={chartMetric === 'realisasi' ? '#93c5fd' : '#bae6fd'}
                />
              </div>
            </section>

            {/* Tabel Unit Sedang Beroperasi */}
            <section className="tera-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Unit Sedang Beroperasi di Site Proyek</h2>
                <Link to="/admin/units" className="text-xs font-bold text-blue-600 hover:underline">
                  Kelola Semua Unit &rarr;
                </Link>
              </div>
              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>Kode Unit</th>
                      <th>Model Perangkat</th>
                      <th>Kategori</th>
                      <th>Lokasi Site</th>
                      <th>Status Fisik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rentedUnits.map((u) => (
                      <tr key={u.id}>
                        <td className="font-mono font-bold text-blue-700">{u.kode_unit}</td>
                        <td className="font-semibold text-slate-800">{u.nama_unit}</td>
                        <td>{u.kategori}</td>
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
          </>
        )}
      </main>

      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo. Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
