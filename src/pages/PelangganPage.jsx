/**
 * @file PelangganPage.jsx
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Modul Master Pelanggan Korporat B2B TERA.
 * 100% Fetch data dinamis dari Mock API (/api/pelanggan.json) via Axios & Public API Wilayah Indonesia (EMSIFA) via Fetch API.
 * Dilengkapi Error Handling komprehensif (try-catch), Loading State (Skeleton Shimmer),
 * modal inspeksi data legalitas mitra, dan tombol simulasi gangguan API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import WilayahSelector from '../components/WilayahSelector';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  checkSimulatedError,
  isSimulatedErrorActive,
  setSimulatedError,
} from '../components/StatusStates';

export default function PelangganPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [simActive, setSimActive] = useState(isSimulatedErrorActive());
  const [testRegion, setTestRegion] = useState(null);
  const pageSize = 6;

  // 1. Fetch data 100% dari Mock API via Axios dengan try-catch
  const fetchPelanggan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Pengecekan pra-fetch untuk pengujian simulasi galat API
      checkSimulatedError();

      const res = await axios.get('/api/pelanggan.json');
      if (!Array.isArray(res.data)) {
        throw new Error('Respon Mock API bukan daftar data pelanggan yang valid.');
      }
      setClients(res.data);
    } catch (err) {
      console.error('[Pelanggan Fetch Error]:', err);
      const message = err.isSimulated
        ? err.message
        : err.response
        ? `Server Mock API mengembalikan status ${err.response.status}: ${err.response.statusText || 'Gagal memuat pelanggan.json'}.`
        : err.request
        ? 'Gagal terhubung ke endpoint Mock API pelanggan.json. Periksa koneksi server lokal Anda.'
        : `Terjadi kendala saat mengambil data pelanggan: ${err.message}`;

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPelanggan();
  }, [fetchPelanggan]);

  const handleToggleSimulation = () => {
    const nextState = !simActive;
    setSimActive(nextState);
    setSimulatedError(nextState);
    fetchPelanggan();
  };

  // 2. Filter & Search data dinamis
  const filteredClients = clients.filter((c) => {
    if (statusFilter !== 'Semua' && c.status_aktif !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        String(c.nama_perusahaan || '').toLowerCase().includes(q) ||
        String(c.pic_nama || '').toLowerCase().includes(q) ||
        String(c.alamat_kantor || '').toLowerCase().includes(q) ||
        String(c.npwp || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {/* Bar Judul & Kontrol Pengujian API */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Manajemen Master Data Pelanggan
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              Modul Zakaria — 100% Mock API (/api/pelanggan.json) &amp; Public API EMSIFA Wilayah Indonesia
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={fetchPelanggan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold shadow transition-colors"
            >
              <Icon name="refresh" size={14} />
              <span>Segarkan API</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-white dark:bg-gray-700 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600">
            <span className="text-gray-400">
              <Icon name="search" size={14} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama perusahaan mitra, NPWP, PIC, atau alamat..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">
              Filter Status:
            </span>
            {['Semua', 'Aktif', 'Non-Aktif'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State UI (Skeleton Shimmer) */}
        {loading && <LoadingState message="Mengambil master data pelanggan via Axios Mock API..." rows={5} />}

        {/* Error State UI (Comprehensive Error & Retry) */}
        {error && !loading && (
          <ErrorState
            title="Gagal Memuat Master Pelanggan dari Mock API"
            message={error}
            onRetry={fetchPelanggan}
          />
        )}

        {/* Empty State UI */}
        {!loading && !error && filteredClients.length === 0 && (
          <EmptyState
            title="Mitra Pelanggan Tidak Ditemukan"
            description="Tidak ada data mitra yang cocok dengan filter atau kata kunci pencarian Anda."
            actionText="Reset Pencarian"
            onAction={() => {
              setSearch('');
              setStatusFilter('Semua');
            }}
          />
        )}

        {/* Data Table Hasil Fetch */}
        {!loading && !error && filteredClients.length > 0 && (
          <div className="w-full overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                    <th className="px-4 py-3">Perusahaan &amp; NPWP</th>
                    <th className="px-4 py-3">PIC Procurement</th>
                    <th className="px-4 py-3">Kontak &amp; Email</th>
                    <th className="px-4 py-3">Alamat Site / Kantor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Detail API</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                  {paginatedClients.map((c) => {
                    const isAktif = c.status_aktif === 'Aktif';
                    return (
                      <tr
                        key={c.id_pelanggan}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center mr-3 shrink-0">
                              {String(c.nama_perusahaan || 'P').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {c.nama_perusahaan}
                              </p>
                              <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                                NPWP: {c.npwp || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          <p>{c.pic_nama}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">{c.pic_jabatan}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700 dark:text-gray-300">{c.pic_telepon}</p>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-[180px]">
                            {c.pic_email}
                          </p>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="truncate text-gray-700 dark:text-gray-300" title={c.alamat_kantor}>
                            {c.alamat_kantor || 'Alamat site belum diatur'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 font-semibold text-[11px] rounded-full inline-block ${
                              isAktif
                                ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                                : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                            }`}
                          >
                            {isAktif ? 'Approved' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedClient(c)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors"
                          >
                            Inspeksi Mitra
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginasi Data */}
            <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
              <span className="flex items-center col-span-4">
                Menampilkan {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredClients.length)} dari {filteredClients.length} Mitra (Mock API)
              </span>
              <span className="col-span-1"></span>
              <span className="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Modal Detail Inspeksi Legalitas Mitra & Pengujian Public API EMSIFA */}
      <Modal
        open={Boolean(selectedClient)}
        onClose={() => {
          setSelectedClient(null);
          setTestRegion(null);
        }}
        title={`Inspeksi Mitra B2B: ${selectedClient?.nama_perusahaan}`}
        subtitle="Data profil & integrasi Public API Wilayah Indonesia (EMSIFA) via Fetch API"
        maxWidth="max-w-xl"
        footer={
          <button
            type="button"
            onClick={() => {
              setSelectedClient(null);
              setTestRegion(null);
            }}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow"
          >
            Tutup Dialog
          </button>
        }
      >
        {selectedClient && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-700/60 border border-blue-200 dark:border-gray-600 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {selectedClient.nama_perusahaan}
                </p>
                <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  NPWP: {selectedClient.npwp || 'Belum Terdaftar'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-600 text-white">
                {selectedClient.status_aktif}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 block text-[10px]">Penanggung Jawab (PIC)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">{selectedClient.pic_nama}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{selectedClient.pic_jabatan}</span>
              </div>
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 block text-[10px]">Kontak &amp; Korespondensi</span>
                <span className="text-gray-900 dark:text-gray-100 block">{selectedClient.pic_telepon}</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">{selectedClient.pic_email}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
              <span className="text-gray-400 block text-[10px]">Alamat Kantor Terdaftar</span>
              <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{selectedClient.alamat_kantor}</p>
            </div>

            {/* Komponen Pengujian Public API EMSIFA (Zakaria) */}
            <div className="p-3 rounded-lg border border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700/50">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                Simulasi Pemilihan Wilayah Site Baru (Fetch API EMSIFA Real-time):
              </p>
              <WilayahSelector
                onSelectRegion={(reg) => {
                  setTestRegion(reg);
                }}
              />
              {testRegion && (testRegion.province || testRegion.city) && (
                <div className="mt-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200">
                  Lokasi Terpilih dari Public API: <strong>{testRegion.city}</strong>, {testRegion.province}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
