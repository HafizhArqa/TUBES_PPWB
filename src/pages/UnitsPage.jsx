/**
 * @file UnitsPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Modul Pengelolaan Inventaris Radio Komunikasi TERA.
 * 100% Data Fetching dinamis dari Mock API (/api/units.json) menggunakan Axios.
 * Dilengkapi Error Handling komprehensif (try-catch), Loading State (Skeleton Shimmer),
 * modal detail spesifikasi unit untuk pengujian, serta tombol simulasi galat API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
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

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];
const STATUSES = ['Semua', 'Tersedia', 'Disewa', 'Perawatan'];

const formatRupiah = (number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [simActive, setSimActive] = useState(isSimulatedErrorActive());
  const pageSize = 8;

  // 1. Fetch data 100% dari Mock API via Axios dengan try-catch
  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Pengecekan pra-fetch untuk pengujian simulasi galat
      checkSimulatedError();

      const res = await axios.get('/api/units.json');
      if (!Array.isArray(res.data)) {
        throw new Error('Respon dari server Mock API bukan array data unit yang valid.');
      }
      setUnits(res.data);
    } catch (err) {
      console.error('[Units Fetch Error]:', err);
      const message = err.isSimulated
        ? err.message
        : err.response
        ? `Server Mock API mengembalikan status ${err.response.status}: ${err.response.statusText || 'Gagal memuat units.json'}.`
        : err.request
        ? 'Gagal terhubung ke endpoint Mock API units.json. Periksa koneksi jaringan server.'
        : `Terjadi kendala saat mengambil data unit: ${err.message}`;

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleToggleSimulation = () => {
    const nextState = !simActive;
    setSimActive(nextState);
    setSimulatedError(nextState);
    fetchUnits();
  };

  // 2. Filter & Search data dinamis
  const filteredUnits = units.filter((u) => {
    if (category !== 'Semua' && u.kategori !== category) return false;
    if (statusFilter !== 'Semua' && u.status_unit !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const match =
        String(u.kode_unit || '').toLowerCase().includes(q) ||
        String(u.nama_unit || '').toLowerCase().includes(q) ||
        String(u.merk || '').toLowerCase().includes(q) ||
        String(u.lokasi || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {/* Bar Judul Halaman & Kontrol Pengujian API */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Kelola Unit Radio Komunikasi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              Modul Steven Taufik Fajar — 100% Fetch Dinamis dari Endpoint Mock API /api/units.json
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
              onClick={fetchUnits}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-semibold shadow transition-colors"
            >
              <Icon name="refresh" size={14} />
              <span>Segarkan API</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 space-y-3 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-white dark:bg-gray-700 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600">
              <span className="text-gray-400">
                <Icon name="search" size={14} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari kode unit, model perangkat, merk, atau lokasi site..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">
                Status:
              </span>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
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

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">
              Kategori:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State UI (Skeleton Shimmer) */}
        {loading && <LoadingState message="Mengambil katalog unit radio via Axios Mock API..." rows={5} />}

        {/* Error State UI (Comprehensive Error & Retry) */}
        {error && !loading && (
          <ErrorState
            title="Gagal Memuat Inventaris Unit dari Mock API"
            message={error}
            onRetry={fetchUnits}
          />
        )}

        {/* Empty State UI */}
        {!loading && !error && filteredUnits.length === 0 && (
          <EmptyState
            title="Unit Radio Tidak Ditemukan"
            description="Tidak ada data unit yang cocok dengan filter atau kata kunci pencarian."
            actionText="Reset Semua Filter"
            onAction={() => {
              setQuery('');
              setCategory('Semua');
              setStatusFilter('Semua');
            }}
          />
        )}

        {/* Data Table Hasil Fetch */}
        {!loading && !error && filteredUnits.length > 0 && (
          <div className="w-full overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                    <th className="px-4 py-3">Kode Unit</th>
                    <th className="px-4 py-3">Model &amp; Merk</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Frekuensi</th>
                    <th className="px-4 py-3">Tarif Sewa / Bln</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Detail API</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                  {paginatedUnits.map((unit) => {
                    const isAvailable = unit.status_unit === 'Tersedia';
                    const isRented = unit.status_unit === 'Disewa';
                    return (
                      <tr
                        key={unit.id}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                            {unit.kode_unit}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {unit.lokasi}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                            {unit.nama_unit}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {unit.merk}
                          </span>
                        </td>
                        <td className="px-4 py-3">{unit.kategori}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">{unit.frekuensi}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                          {formatRupiah(unit.harga_sewa || unit.tarif_sewa_bulanan)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 font-semibold text-[11px] rounded-full inline-block ${
                              isAvailable
                                ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                                : isRented
                                ? 'text-yellow-700 bg-yellow-100 dark:bg-amber-600 dark:text-amber-100'
                                : 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {unit.status_unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedUnit(unit)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors"
                          >
                            Inspeksi Unit
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
                {Math.min(currentPage * pageSize, filteredUnits.length)} dari {filteredUnits.length} Unit (Mock API)
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

      {/* Modal Detail Inspeksi Spesifikasi Teknis Unit dari Mock API */}
      <Modal
        open={Boolean(selectedUnit)}
        onClose={() => setSelectedUnit(null)}
        title={`Inspeksi Spesifikasi Teknis: ${selectedUnit?.kode_unit}`}
        subtitle="Data teknis & komersial perangkat terverifikasi dari Mock API units.json"
        maxWidth="max-w-xl"
        footer={
          <button
            type="button"
            onClick={() => setSelectedUnit(null)}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow"
          >
            Tutup Dialog
          </button>
        }
      >
        {selectedUnit && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-700/60 border border-blue-200 dark:border-gray-600 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {selectedUnit.nama_unit}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Manufaktur: {selectedUnit.merk} • Kategori: {selectedUnit.kategori}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-blue-600 text-white">
                {selectedUnit.status_unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 block text-[10px]">Rentang Frekuensi Operasi</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{selectedUnit.frekuensi}</span>
              </div>
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 block text-[10px]">Tarif Sewa Bulanan (SLA 99.5%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(selectedUnit.harga_sewa || selectedUnit.tarif_sewa_bulanan)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
              <span className="text-gray-400 block text-[10px]">Lokasi Gudang / Site Penempatan</span>
              <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{selectedUnit.lokasi}</p>
            </div>

            <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
              <span className="text-gray-400 block text-[10px]">Deskripsi &amp; Spesifikasi Khusus</span>
              <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                {selectedUnit.spesifikasi ||
                  'Perangkat radio standar industri telekomunikasi dengan sertifikasi SDPPI Postel, siap mobilisasi dengan kelengkapan kabel power, antena omni, duplexer, dan sertifikat kalibrasi aktif.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
