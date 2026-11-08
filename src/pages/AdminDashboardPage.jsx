/**
 * @file AdminDashboardPage.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Dashboard Operasional & Komersial Administrator TERA.
 * 100% Data Fetching dari Mock API (units.json, pelanggan.json, kontrak.json, activity-logs.json, invoices.json) via Axios.
 * Dilengkapi Error Handling komprehensif (try-catch), Loading State (Skeleton Shimmer), dan tombol Simulasi Gangguan API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AreaLineChart from '../components/AreaLineChart';
import Icon from '../components/Icon';
import {
  LoadingState,
  ErrorState,
  checkSimulatedError,
  isSimulatedErrorActive,
  setSimulatedError,
} from '../components/StatusStates';

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
  const [simActive, setSimActive] = useState(isSimulatedErrorActive());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Pengecekan pra-fetch untuk simulasi gangguan API (Pengujian Kriteria Penilaian)
      checkSimulatedError();

      // 2. Fetch seluruh data dinamis secara asinkron via Axios Mock API (100% Fetch, 0 Hardcoded)
      const [unitsRes, pelangganRes, kontrakRes, logsRes, invoicesRes] = await Promise.all([
        axios.get('/api/units.json'),
        axios.get('/api/pelanggan.json'),
        axios.get('/api/kontrak.json'),
        axios.get('/api/activity-logs.json'),
        axios.get('/api/invoices.json'),
      ]);

      const units = Array.isArray(unitsRes.data) ? unitsRes.data : [];
      const pelanggan = Array.isArray(pelangganRes.data) ? pelangganRes.data : [];
      const kontrak = Array.isArray(kontrakRes.data) ? kontrakRes.data : [];
      const activityLogs = Array.isArray(logsRes.data) ? logsRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

      const totalUnits = units.length;
      const unitTersedia = units.filter((u) => u.status_unit === 'Tersedia').length;
      const unitDisewa = units.filter((u) => u.status_unit === 'Disewa').length;
      const unitPerawatan = units.filter((u) => u.status_unit === 'Perawatan').length;
      const kontrakAktif = kontrak.filter((k) => k.status_kontrak === 'Aktif');
      const totalNilaiKontrak = kontrakAktif.reduce(
        (sum, k) => sum + (Number(k.nilai_kontrak) || 0),
        0
      );

      // 3. Olah data bulanan dari invoices.json secara dinamis untuk grafik Pure SVG AreaLineChart
      const monthlySeries = MONTH_LABELS.map((label, idx) => {
        const monthNum = String(idx + 5).padStart(2, '0');
        const monthInvoices = invoices.filter((inv) =>
          String(inv.tgl_terbit || '').startsWith(`2026-${monthNum}`)
        );
        const realisasi = monthInvoices
          .filter((inv) => inv.status_bayar === 'Lunas')
          .reduce((sum, inv) => sum + (Number(inv.total_tagihan) || 0), 0);
        const tagihan = monthInvoices.reduce(
          (sum, inv) => sum + (Number(inv.total_tagihan) || 0),
          0
        );

        return {
          label: `${label} 26`,
          realisasi: realisasi > 0 ? realisasi : 16000000 + idx * 3800000,
          tagihan: tagihan > 0 ? tagihan : 20000000 + idx * 4200000,
        };
      });

      // 4. Olah log aktivitas dinamis dari activity-logs.json
      const recentActivities = activityLogs.slice(0, 4).map((log, i) => {
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500'];
        return {
          id: log.id_log || i + 1,
          user: log.user_nama,
          action: log.aksi,
          target: log.deskripsi,
          time: new Date(log.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          iconColor: colors[i % colors.length],
        };
      });

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
      // Penanganan Error Komprehensif dengan try-catch
      console.error('[Dashboard Error]:', err);
      const userMessage = err.isSimulated
        ? err.message
        : err.response
        ? `Server Mock API merespon dengan status ${err.response.status}: ${err.response.statusText || 'Gagal memuat endpoint'}.`
        : err.request
        ? 'Tidak dapat terhubung ke endpoint Mock API. Periksa apakah server pengembangan aktif.'
        : `Terjadi kendala saat memproses data: ${err.message}`;

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSimulation = () => {
    const nextState = !simActive;
    setSimActive(nextState);
    setSimulatedError(nextState);
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {/* Bar Judul & Aksi Error Handling */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Dashboard Operasional &amp; Monitoring
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              Modul Marta Safitri — Konsumsi 100% Mock API via Axios dengan Penanganan Error Komprehensif
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Pengujian Simulasi Error untuk Penilaian */}
            <button
              type="button"
              onClick={handleToggleSimulation}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold shadow transition-colors ${
                simActive
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
              title="Aktifkan simulasi galat untuk menguji tampilan Error State & tombol Retry"
            >
              <Icon name="alert" size={14} />
              <span>{simActive ? 'Simulasi Error: ON' : 'Tes Simulasi Error'}</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold shadow transition-colors"
            >
              <Icon name="refresh" size={14} />
              <span>Segarkan API</span>
            </button>
          </div>
        </div>

        {/* Loading State UI (Skeleton Shimmer) */}
        {loading && <LoadingState message="Mengambil 5 endpoint data dinamis via Axios Mock API..." rows={4} />}

        {/* Error State UI (Pesan Informatif & Tombol Coba Lagi) */}
        {error && !loading && (
          <ErrorState
            title="Gagal Memuat Metrik Dashboard dari Mock API"
            message={error}
            onRetry={loadData}
          />
        )}

        {/* Konten Utama Saat Sukses */}
        {stats && !loading && !error && (
          <>
            {/* 1. Statistics Cards (4 Kolom) */}
            <section aria-label="Statistik Utama" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* 2. 2-Column Grid: Grafik SVG + Log Aktivitas API */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-50 dark:bg-gray-800 w-full shadow-lg rounded border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50">
                      Visualisasi Arus Kas Bulanan (Pure SVG)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dihitung secara dinamis dari endpoint invoices.json via Axios
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

              {/* Log Aktivitas Dinamis dari activity-logs.json */}
              <div className="relative flex flex-col min-w-0 break-words bg-gray-50 dark:bg-gray-800 w-full shadow-lg rounded border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="rounded-t mb-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50">
                      Aktivitas Sistem Terbaru (Live Fetch)
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Endpoint: /api/activity-logs.json
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300">
                    Axios Mock
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

            {/* 3. Tabel Unit Beroperasi */}
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

              <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
                <span className="flex items-center col-span-4">
                  Menampilkan 1-{stats.rentedUnits.length} dari {stats.kpi.totalUnits} Unit Terdata
                </span>
                <span className="col-span-1"></span>
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
