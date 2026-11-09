/**
 * @file UnitsPage.jsx
 * @description Halaman Kelola Unit Radio BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Memadukan CSS Grid + Flexbox dengan Tailwind CSS.
 * 100% Data Fetching dari Mock API (units.json) via Axios, dilengkapi Paginasi, Filter Kategori/Status, Modal Inspeksi, serta tampilan responsif Mobile/Tablet/Desktop.
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

const getStatusBadgeClass = (status) => {
  if (status === 'Tersedia') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (status === 'Disewa') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
};

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [query, setQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [simActive, setSimActive] = useState(isSimulatedErrorActive());

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
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
        ? 'Gagal terhubung ke endpoint Mock API units.json. Periksa koneksi server dev.'
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

  const filteredUnits = units.filter((u) => {
    if (category !== 'Semua' && u.kategori !== category) return false;
    if (statusFilter !== 'Semua') {
      if (statusFilter === 'Perawatan') {
        if (u.status_unit !== 'Perawatan' && u.status_unit !== 'Maintenance' && u.status_unit !== 'Rusak') return false;
      } else if (u.status_unit !== statusFilter) {
        return false;
      }
    }
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200">
      <Navbar />

      <div className="lg:ml-[250px] min-h-screen flex flex-col">
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-5 sm:space-y-6 text-left">
          {/* Top Bar Action (Simulasi & Refresh) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E2E8F0]/70 dark:border-[#334155]/70">
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
              Inventaris &amp; Monitoring Seluruh Perangkat Telekomunikasi TERA
            </p>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleSimulation}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  simActive
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:border-blue-400 hover:text-blue-600'
                }`}
                title="Aktifkan simulasi galat untuk menguji tampilan Error State & tombol Retry"
              >
                <Icon name="alert" size={13} />
                <span>{simActive ? 'Simulasi Error: ON' : 'Tes Simulasi Error'}</span>
              </button>

              <button
                type="button"
                onClick={fetchUnits}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] text-xs font-semibold hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all"
              >
                <Icon name="refresh" size={13} />
                <span>Segarkan API</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              KATALOG & DAFTAR UNIT RADIO (RESPONSIF DESKTOP TABLE + MOBILE CARDS)
              ========================================================================= */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-4 sm:p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
            {/* Header Judul & Pencarian */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-[22px] font-bold text-[#1E293B] dark:text-white tracking-tight">
                  Recent Transactions
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Daftar armada repeater, base station, handy talkie, dan radio maritim aktif
                </p>
              </div>

              {/* Search Pill: Grey background, hover/focus blue */}
              <div className="flex items-center gap-2.5 bg-[#F1F5F9] dark:bg-gray-800/80 rounded-full px-4 py-2.5 w-full md:w-72 lg:w-80 border border-[#E2E8F0] dark:border-gray-700 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
                <Icon name="search" size={16} className="text-[#64748B] shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari kode unit, model, lokasi..."
                  aria-label="Cari unit radio"
                  className="bg-transparent text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#64748B] outline-none w-full min-w-0"
                />
              </div>
            </div>

            {/* Filter Bar: Status Tabs + Category Pills */}
            <div className="space-y-4 mb-5">
              {/* Status Tabs (Horizontal scroll bersih di layar kecil) */}
              <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto table-scroll-smooth border-b border-[#E2E8F0] dark:border-[#334155]">
                {STATUSES.map((st) => {
                  const isActive = statusFilter === st;
                  const labelMap = {
                    Semua: 'All Transactions',
                    Tersedia: 'Income / Tersedia',
                    Disewa: 'Expense / Disewa',
                    Perawatan: 'Maintenance',
                  };
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                      }}
                      className={`relative pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600'
                      }`}
                    >
                      {labelMap[st] || st}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Category Filter Pills & Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setCurrentPage(1);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'bg-[#F1F5F9] dark:bg-gray-800 text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 border border-transparent hover:border-blue-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {!loading && !error && (
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {filteredUnits.length} unit ditemukan
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState message="Memuat katalog unit dari Mock API..." rows={4} />}

            {/* Error State */}
            {error && !loading && (
              <ErrorState
                title="Gagal Memuat Inventaris Unit"
                message={error}
                onRetry={fetchUnits}
              />
            )}

            {/* Empty State */}
            {!loading && !error && filteredUnits.length === 0 && (
              <EmptyState
                title="Unit Radio Tidak Ditemukan"
                description="Tidak ada data unit yang cocok dengan filter atau kata kunci pencarian."
                actionText="Reset Semua Filter"
                onAction={() => {
                  setQuery('');
                  setCategory('Semua');
                  setStatusFilter('Semua');
                  setCurrentPage(1);
                }}
              />
            )}

            {/* =================================================================
                TAMPILAN MOBILE (< md / < 768px): RESPONSIVE CARD LIST
                ================================================================= */}
            {!loading && !error && filteredUnits.length > 0 && (
              <div className="md:hidden space-y-3">
                {paginatedUnits.map((unit) => {
                  const isDisewa = unit.status_unit === 'Disewa';
                  return (
                    <article
                      key={unit.id_unit || unit.kode_unit}
                      onClick={() => setSelectedUnit(unit)}
                      className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-gray-800/50 border border-[#E2E8F0] dark:border-[#334155] hover:border-blue-400 transition-all space-y-3 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                            <svg
                              className={`w-4 h-4 transform ${
                                isDisewa ? '-rotate-45 text-rose-500' : 'rotate-45 text-emerald-500'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5m-7 7l7-7 7 7" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#1E293B] dark:text-white leading-snug">
                              {unit.nama_unit}
                            </h3>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex flex-wrap items-center gap-x-1">
                              <span>{unit.merk}</span>
                              <span>&bull;</span>
                              <span className="font-mono whitespace-nowrap">#{unit.kode_unit}</span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${getStatusBadgeClass(
                            unit.status_unit
                          )}`}
                        >
                          {unit.status_unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[11px]">
                        <div>
                          <span className="text-[#94A3B8] block">Kategori</span>
                          <span className="font-semibold text-[#1E293B] dark:text-gray-200">{unit.kategori}</span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] block">Frekuensi</span>
                          <span className="font-mono font-medium text-[#1E293B] dark:text-gray-200">
                            {unit.frekuensi || '—'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[#94A3B8] block">Lokasi Site</span>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">{unit.lokasi}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                        <span className={`text-sm font-bold ${isDisewa ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isDisewa ? '-' : '+'}
                          {formatRupiah(unit.harga_sewa || unit.tarif_sewa_bulanan)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnit(unit);
                          }}
                          className="px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-sm"
                        >
                          Download
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* =================================================================
                TAMPILAN TABLET & DESKTOP (md+ / >= 768px): RESPONSIVE TABLE
                ================================================================= */}
            {!loading && !error && filteredUnits.length > 0 && (
              <div className="hidden md:block overflow-x-auto table-scroll-smooth">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="pb-3.5 px-2.5 xl:px-3 whitespace-nowrap">Description</th>
                      <th className="pb-3.5 px-2.5 xl:px-3 whitespace-nowrap">Transaction ID</th>
                      <th className="hidden xl:table-cell pb-3.5 px-3 whitespace-nowrap">Type</th>
                      <th className="hidden xl:table-cell pb-3.5 px-3 whitespace-nowrap min-w-[160px]">Card / Frekuensi</th>
                      <th className="pb-3.5 px-2.5 xl:px-3 whitespace-nowrap">Date / Lokasi</th>
                      <th className="pb-3.5 px-2.5 xl:px-3 text-right whitespace-nowrap">Amount</th>
                      <th className="pb-3.5 px-2.5 xl:px-3 text-center whitespace-nowrap">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-xs">
                    {paginatedUnits.map((unit) => {
                      const isDisewa = unit.status_unit === 'Disewa';
                      return (
                        <tr
                          key={unit.id_unit || unit.kode_unit}
                          onClick={() => setSelectedUnit(unit)}
                          className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors group cursor-pointer"
                        >
                          {/* Description: Circle Icon with arrow + Title */}
                          <td className="py-4 px-2.5 xl:px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center text-[#64748B] group-hover:text-blue-600 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all shrink-0">
                                <svg
                                  className={`w-4 h-4 transform ${
                                    isDisewa ? '-rotate-45 text-rose-500' : 'rotate-45 text-emerald-500'
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5m-7 7l7-7 7 7" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[#1E293B] dark:text-white block group-hover:text-blue-600 transition-colors leading-snug">
                                  {unit.nama_unit}
                                </span>
                                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                                  {unit.merk} &bull; {unit.status_unit}
                                </span>
                                <span className="xl:hidden text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono block mt-0.5">
                                  {unit.kategori} &bull; {unit.frekuensi || '—'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Transaction ID */}
                          <td className="py-4 px-2.5 xl:px-3 font-mono text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                            #{unit.kode_unit}
                          </td>

                          {/* Type (Desktop xl+) */}
                          <td className="hidden xl:table-cell py-4 px-3 text-[#64748B] dark:text-[#94A3B8] font-medium whitespace-nowrap">
                            {unit.kategori}
                          </td>

                          {/* Card / Frekuensi (Desktop xl+) */}
                          <td className="hidden xl:table-cell py-4 px-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                            {unit.frekuensi || '1234 ****'}
                          </td>

                          {/* Date / Lokasi */}
                          <td className="py-4 px-2.5 xl:px-3 text-[#64748B] dark:text-[#94A3B8] max-w-[165px] xl:max-w-[230px] leading-snug">
                            {unit.lokasi}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-2.5 xl:px-3 text-right font-bold whitespace-nowrap">
                            <span className={isDisewa ? 'text-rose-500' : 'text-emerald-500'}>
                              {isDisewa ? '-' : '+'}
                              {formatRupiah(unit.harga_sewa || unit.tarif_sewa_bulanan)}
                            </span>
                          </td>

                          {/* Receipt: Pill Outline Button with Blue Hover */}
                          <td className="py-4 px-2.5 xl:px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUnit(unit);
                              }}
                              className="px-3.5 xl:px-4 py-1.5 rounded-full border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-sm"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination: BankFlash style */}
            {!loading && !error && filteredUnits.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0] dark:border-[#334155] mt-4">
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] text-center sm:text-left">
                  Menampilkan {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredUnits.length)} dari {filteredUnits.length} Unit Radio
                </span>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Detail Inspeksi Unit */}
      {selectedUnit && (
        <Modal
          open={Boolean(selectedUnit)}
          onClose={() => setSelectedUnit(null)}
          title={`Inspeksi Unit: ${selectedUnit.kode_unit}`}
          subtitle={`Spesifikasi teknis perangkat telekomunikasi ${selectedUnit.nama_unit}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="px-5 py-2 rounded-full border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Faktur bukti unit ${selectedUnit.kode_unit} diunduh.`);
                  setSelectedUnit(null);
                }}
                className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Unduh Lembar PDF
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-[#64748B] dark:text-[#94A3B8] text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-[#F8FAFC] dark:bg-gray-800/50 border border-[#E2E8F0] dark:border-gray-700">
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Model Unit</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.nama_unit}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Merk / Produsen</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.merk}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Kategori</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.kategori}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Frekuensi Operasi</span>
                <span className="font-mono font-bold text-[#1E293B] dark:text-white text-sm">
                  {selectedUnit.frekuensi || '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Lokasi Penempatan</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.lokasi}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Status Operasional</span>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                    selectedUnit.status_unit
                  )}`}
                >
                  {selectedUnit.status_unit}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Tarif Sewa Bulanan</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {formatRupiah(selectedUnit.harga_sewa || selectedUnit.tarif_sewa_bulanan)}
                </span>
              </div>
              {selectedUnit.klien && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Mitra Penyewa</span>
                  <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.klien}</span>
                </div>
              )}
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Catatan Teknis / Lisensi</span>
              <p className="p-3 bg-[#F1F5F9] dark:bg-gray-800 rounded-lg text-[#1E293B] dark:text-gray-200 leading-relaxed">
                {selectedUnit.spesifikasi ||
                  selectedUnit.deskripsi ||
                  'Unit tersertifikasi SDPPI Postel, terkalibrasi berkala dan memenuhi standar SLA 99.5% untuk komunikasi industri.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
