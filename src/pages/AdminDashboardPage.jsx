/**
 * @file AdminDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Operasional & Komersial Administrator TERA.
 * Menerapkan tema modern Tailwind Blue & Dark Mode dengan 4 Kartu Statistik,
 * Grafik Arus Kas SVG Murni, Aktivitas Terbaru, dan Tabel Data Unit Beroperasi.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AreaLineChart from '../components/AreaLineChart';
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
      // 1. Fetch data dinamis dari Mock API via Axios
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
      const unitPerawatan = units.filter((u) => u.status_unit === 'Perawatan').length;
      const kontrakAktif = kontrak.filter((k) => k.status_kontrak === 'Aktif');
      const totalNilaiKontrak = kontrakAktif.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0);

      // Data series bulanan untuk grafik AreaLineChart
      const monthlySeries = MONTH_LABELS.map((label, idx) => ({
        label: `${label} 26`,
        realisasi: 18500000 + idx * 4500000,
        tagihan: 22000000 + idx * 5000000,
      }));

      // Log aktivitas terbaru sistem
      const recentActivities = [
        {
          id: 1,
          user: 'Steven Taufik Fajar',
          action: 'Memperbarui status unit',
          target: 'RD-MOT-001 (Motorola XPR 7550e) ke Disewa',
          time: 'Hari ini, 09:42 WIB',
          iconColor: 'bg-indigo-500',
        },
        {
          id: 2,
          user: 'Zakaria',
          action: 'Mendaftarkan mitra pelanggan B2B baru',
          target: 'PT Pertamina Hulu Rokan (Site Duri)',
          time: 'Hari ini, 08:15 WIB',
          iconColor: 'bg-green-500',
        },
        {
          id: 3,
          user: 'Hafizh Arqamilandri W.',
          action: 'Mengirimkan notifikasi sesi via REST API Email',
          target: 'admin@tera.com',
          time: 'Kemarin, 16:30 WIB',
          iconColor: 'bg-blue-500',
        },
      ];

      setStats({
        kpi: {
          totalUnits,
          unitTersedia,
          unitDisewa,
          unitPerawatan,
          utilisasiPersen: totalUnits ? Math.round((unitDisewa / totalUnits) * 100) : 0,
          totalPelanggan: pelanggan.length,
          kontrakAktifCount: kontrakAktif.length,
          totalNilaiKontrak,
        },
        monthlySeries,
        recentActivities,
        rentedUnits: units.filter((u) => u.status_unit === 'Disewa').slice(0, 6),
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
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      {/* Header & Sidebar Terpadu */}
      <Navbar />

      {/* Kontainer Konten Utama dengan Offset Sidebar */}
      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {/* Bar Judul & Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Dashboard Operasional &amp; Monitoring
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              PT Utama Telekomindo — Manajemen Unit Radio, Data Pelanggan &amp; Arus Kas
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold shadow transition-colors"
          >
            <Icon name="refresh" size={14} />
            <span>Segarkan API</span>
          </button>
        </div>

        {loading && <LoadingState message="Memuat metrik statistik via Axios..." rows={3} />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {stats && !loading && !error && (
          <>
            {/* =========================================================================
                1. STATISTICS CARDS (4 KOLOM)
                ========================================================================= */}
            <section aria-label="Statistik Utama" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Unit Radio */}
              <div className="bg-blue-500 dark:bg-gray-800 shadow-lg rounded-md flex items-center justify-between p-4 border-b-4 border-blue-600 dark:border-gray-600 text-white font-medium group transition-all">
                <div className="flex justify-center items-center w-14 h-14 bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12 shadow">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-blue-800 dark:text-gray-800 transform transition-transform duration-500 ease-in-out">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">{stats.kpi.totalUnits}</p>
                  <p className="text-xs text-blue-100 dark:text-gray-300">Total Unit Radio</p>
                  <span className="text-[10px] text-blue-200 dark:text-emerald-400 block mt-1">
                    {stats.kpi.unitTersedia} unit siap sewa
                  </span>
                </div>
              </div>

              {/* Card 2: Utilisasi Armada */}
              <div className="bg-blue-500 dark:bg-gray-800 shadow-lg rounded-md flex items-center justify-between p-4 border-b-4 border-blue-600 dark:border-gray-600 text-white font-medium group transition-all">
                <div className="flex justify-center items-center w-14 h-14 bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12 shadow">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-blue-800 dark:text-gray-800 transform transition-transform duration-500 ease-in-out">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">{stats.kpi.utilisasiPersen}%</p>
                  <p className="text-xs text-blue-100 dark:text-gray-300">Tingkat Utilisasi</p>
                  <span className="text-[10px] text-blue-200 dark:text-gray-400 block mt-1">
                    {stats.kpi.unitDisewa} unit dioperasikan
                  </span>
                </div>
              </div>

              {/* Card 3: Mitra Pelanggan B2B */}
              <div className="bg-blue-500 dark:bg-gray-800 shadow-lg rounded-md flex items-center justify-between p-4 border-b-4 border-blue-600 dark:border-gray-600 text-white font-medium group transition-all">
                <div className="flex justify-center items-center w-14 h-14 bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12 shadow">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-blue-800 dark:text-gray-800 transform transition-transform duration-500 ease-in-out">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">{stats.kpi.totalPelanggan}</p>
                  <p className="text-xs text-blue-100 dark:text-gray-300">Mitra Pelanggan</p>
                  <span className="text-[10px] text-blue-200 dark:text-blue-300 block mt-1">
                    Master Data Zakaria
                  </span>
                </div>
              </div>

              {/* Card 4: Nilai Kontrak Berjalan */}
              <div className="bg-blue-500 dark:bg-gray-800 shadow-lg rounded-md flex items-center justify-between p-4 border-b-4 border-blue-600 dark:border-gray-600 text-white font-medium group transition-all">
                <div className="flex justify-center items-center w-14 h-14 bg-white rounded-full transition-all duration-300 transform group-hover:rotate-12 shadow">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-blue-800 dark:text-gray-800 transform transition-transform duration-500 ease-in-out">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tracking-tight">
                    {formatRupiah(stats.kpi.totalNilaiKontrak)}
                  </p>
                  <p className="text-xs text-blue-100 dark:text-gray-300">Nilai Kontrak</p>
                  <span className="text-[10px] text-blue-200 dark:text-amber-400 block mt-1">
                    {stats.kpi.kontrakAktifCount} Kontrak Aktif
                  </span>
                </div>
              </div>
            </section>

            {/* =========================================================================
                2. 2-COLUMN GRID (CHART SVG MURNI + AKTIVITAS TERBARU)
                ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kolom Kiri: Visualisasi Arus Kas SVG Murni (Marta Safitri) */}
              <div className="relative flex flex-col min-w-0 break-words bg-gray-50 dark:bg-gray-800 w-full shadow-lg rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50">
                      Visualisasi Arus Kas Bulanan (Pure SVG)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dinamis via Axios Mock API tanpa dependensi eksternal
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                    <button
                      type="button"
                      onClick={() => setChartMetric('realisasi')}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                        chartMetric === 'realisasi'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      Realisasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetric('tagihan')}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                        chartMetric === 'tagihan'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      Tagihan
                    </button>
                  </div>
                </div>

                <div className="w-full pt-2">
                  <AreaLineChart
                    data={stats.monthlySeries}
                    valueKey={chartMetric}
                    height={240}
                  />
                </div>
              </div>

              {/* Kolom Kanan: Log Aktivitas Terbaru (Template Style) */}
              <div className="relative flex flex-col min-w-0 break-words bg-gray-50 dark:bg-gray-800 w-full shadow-lg rounded border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="rounded-t mb-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50">
                    Aktivitas Terbaru Sistem
                  </h2>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300">
                    Live Event
                  </span>
                </div>

                <div className="p-4">
                  <ul className="space-y-3">
                    {stats.recentActivities.map((act) => (
                      <li key={act.id} className="flex items-start">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${act.iconColor} text-white flex items-center justify-center mr-3 mt-0.5 shadow-sm`}>
                          <Icon name="check" size={16} />
                        </div>
                        <div className="flex-grow border-b border-gray-200 dark:border-gray-700 pb-2.5 text-xs text-gray-600 dark:text-gray-300">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {act.user} <span className="font-normal text-gray-500 dark:text-gray-400">{act.action}</span>
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                            {act.target}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                            {act.time}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. CLIENT & UNIT OPERATIONAL TABLE (TEMPLATE STYLE)
                ========================================================================= */}
            <div className="w-full overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50">
                    Unit Radio Sedang Beroperasi di Site Mitra
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Data realtime dari endpoint Axios Mock API units.json
                  </p>
                </div>
                <Link
                  to="/admin/units"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-bold uppercase px-3 py-1.5 rounded transition-colors"
                >
                  Kelola Semua Unit &rarr;
                </Link>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                      <th className="px-4 py-3">Kode Unit</th>
                      <th className="px-4 py-3">Model Perangkat</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Lokasi Site</th>
                      <th className="px-4 py-3">Status Sewa</th>
                      <th className="px-4 py-3">Tarif Sewa / Bln</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {stats.rentedUnits.map((u) => (
                      <tr
                        key={u.id}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {u.kode_unit}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                          {u.nama_unit}
                        </td>
                        <td className="px-4 py-3">{u.kategori}</td>
                        <td className="px-4 py-3">{u.lokasi}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                            {u.status_unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatRupiah(u.tarif_sewa_bulanan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Paginasi Template */}
              <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
                <span className="flex items-center col-span-3">
                  Menampilkan 1-{stats.rentedUnits.length} dari {stats.kpi.totalUnits} Unit
                </span>
                <span className="col-span-2"></span>
                <span className="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                  <Link
                    to="/admin/units"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    Buka Paginasi Lengkap di Kelola Unit &rarr;
                  </Link>
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
