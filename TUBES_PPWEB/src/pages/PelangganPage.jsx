/**
 * @file PelangganPage.jsx
 * @description Master Pelanggan Korporat B2B BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Memadukan CSS Grid + Flexbox dengan Tailwind CSS.
 * 100% Fetch data dinamis dari Mock API (/api/pelanggan.json) via Axios & Public API Wilayah Indonesia (EMSIFA) via Fetch API.
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

  // 1. Fetch data 100% dari Mock API via Axios
  const fetchPelanggan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
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
        ? 'Gagal terhubung ke endpoint Mock API pelanggan.json. Periksa koneksi server dev.'
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

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status_aktif === 'Aktif').length;
  const suspendedClients = clients.filter((c) => c.status_aktif !== 'Aktif').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200">
      <Navbar />

      <div className="lg:ml-[250px] min-h-screen flex flex-col">
        <main id="main-content" className="flex-1 p-4 sm:p-7 max-w-[1600px] w-full mx-auto space-y-7">
          {/* Top Bar Action (Simulasi & Refresh) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Direktori Mitra Korporat B2B, Legalitas NPWP, PIC Procurement, &amp; Lokasi Site Proyek
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSimulation}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
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
                onClick={fetchPelanggan}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] text-xs font-semibold hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all"
              >
                <Icon name="refresh" size={13} />
                <span>Segarkan API</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              SECTION 1: 3 METRIC CARDS (WHITE, GREY, HOVER BLUE)
              ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Total Mitra Terdaftar
                </span>
                <span className="text-2xl font-bold text-[#1E293B] dark:text-white group-hover:text-blue-600 transition-colors">
                  {totalClients} Korporat
                </span>
                <span className="text-[11px] text-[#94A3B8] block mt-1">100% Mock API terintegrasi</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Icon name="accounts" size={22} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Mitra Approved / Aktif
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activeClients} Akun
                </span>
                <span className="text-[11px] text-[#94A3B8] block mt-1">Kontrak sewa berjalan</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-all">
                <Icon name="check" size={22} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Mitra Suspended / Non-Aktif
                </span>
                <span className="text-2xl font-bold text-rose-500">
                  {suspendedClients} Akun
                </span>
                <span className="text-[11px] text-[#94A3B8] block mt-1">Menunggu rekonsiliasi</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-all">
                <Icon name="alert" size={22} />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: TABEL DATA PELANGGAN (BANKFLASH STYLE)
              ========================================================================= */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
            {/* Header & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-xl sm:text-[22px] font-bold text-[#1E293B] dark:text-white tracking-tight">
                Master Data Pelanggan
              </h3>

              {/* Search Pill */}
              <div className="flex items-center gap-3 bg-[#F1F5F9] dark:bg-gray-800/80 rounded-full px-4 py-2 w-full sm:w-72 border border-[#E2E8F0] dark:border-gray-700 hover:border-blue-400 focus-within:border-blue-600 transition-all">
                <Icon name="search" size={16} className="text-[#64748B]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama perusahaan, NPWP, PIC..."
                  className="bg-transparent text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] outline-none w-full"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-[#E2E8F0] dark:border-[#334155] pb-1 mb-5 text-sm">
              {['Semua', 'Aktif', 'Non-Aktif'].map((st) => {
                const isActive = statusFilter === st;
                const labelMap = {
                  Semua: 'All Accounts',
                  Aktif: 'Active Approved',
                  'Non-Aktif': 'Suspended',
                };
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setCurrentPage(1);
                    }}
                    className={`relative pb-3 text-sm font-semibold transition-colors ${
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

            {/* Loading State */}
            {loading && <LoadingState message="Mengambil master pelanggan dari Mock API..." rows={4} />}

            {/* Error State */}
            {error && !loading && (
              <ErrorState
                title="Gagal Memuat Master Pelanggan"
                message={error}
                onRetry={fetchPelanggan}
              />
            )}

            {/* Empty State */}
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

            {/* Data Table */}
            {!loading && !error && filteredClients.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="pb-3.5 px-3">Perusahaan &amp; NPWP</th>
                      <th className="pb-3.5 px-3">PIC Procurement</th>
                      <th className="pb-3.5 px-3">Kontak &amp; Email</th>
                      <th className="pb-3.5 px-3">Alamat Site / Kantor</th>
                      <th className="pb-3.5 px-3">Status</th>
                      <th className="pb-3.5 px-3 text-center">Receipt / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-xs">
                    {paginatedClients.map((c) => {
                      const isAktif = c.status_aktif === 'Aktif';
                      return (
                        <tr
                          key={c.id_pelanggan}
                          className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {String(c.nama_perusahaan || 'P').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#1E293B] dark:text-white group-hover:text-blue-600 transition-colors">
                                  {c.nama_perusahaan}
                                </p>
                                <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                                  NPWP: {c.npwp || '—'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <p className="font-semibold text-[#1E293B] dark:text-white">{c.pic_nama}</p>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{c.pic_jabatan}</p>
                          </td>

                          <td className="py-4 px-3">
                            <p className="text-[#1E293B] dark:text-white">{c.pic_telepon}</p>
                            <p className="text-[11px] text-blue-600 truncate max-w-[180px]">
                              {c.pic_email}
                            </p>
                          </td>

                          <td className="py-4 px-3 max-w-[220px]">
                            <p className="truncate text-[#64748B] dark:text-[#94A3B8]" title={c.alamat_kantor}>
                              {c.alamat_kantor || 'Alamat site belum diatur'}
                            </p>
                          </td>

                          <td className="py-4 px-3">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-semibold inline-block border ${
                                isAktif
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
                              }`}
                            >
                              {isAktif ? 'Approved' : 'Suspended'}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedClient(c)}
                              className="px-4 py-1.5 rounded-full border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-sm"
                            >
                              Inspeksi
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredClients.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0] dark:border-[#334155] mt-4">
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Menampilkan {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredClients.length)} dari {filteredClients.length} Mitra (Mock API)
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

      {/* Modal Detail Inspeksi Legalitas Mitra & Public API EMSIFA */}
      <Modal
        open={Boolean(selectedClient)}
        onClose={() => {
          setSelectedClient(null);
          setTestRegion(null);
        }}
        title={`Inspeksi Mitra: ${selectedClient?.nama_perusahaan}`}
        subtitle="Data profil & integrasi Public API Wilayah Indonesia (EMSIFA) via Fetch API"
        maxWidth="max-w-xl"
        footer={
          <button
            type="button"
            onClick={() => {
              setSelectedClient(null);
              setTestRegion(null);
            }}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all"
          >
            Tutup Dialog
          </button>
        }
      >
        {selectedClient && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-[14px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1E293B] dark:text-white">
                  {selectedClient.nama_perusahaan}
                </p>
                <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  NPWP: {selectedClient.npwp || 'Belum Terdaftar'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm">
                {selectedClient.status_aktif}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[12px] bg-[#F8FAFC] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700">
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">Penanggung Jawab (PIC)</span>
                <span className="font-semibold text-[#1E293B] dark:text-white block">{selectedClient.pic_nama}</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{selectedClient.pic_jabatan}</span>
              </div>
              <div className="p-3 rounded-[12px] bg-[#F8FAFC] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700">
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">Kontak &amp; Korespondensi</span>
                <span className="text-[#1E293B] dark:text-white block">{selectedClient.pic_telepon}</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">{selectedClient.pic_email}</span>
              </div>
            </div>

            <div className="p-3 rounded-[12px] bg-[#F8FAFC] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700">
              <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">Alamat Kantor Terdaftar</span>
              <p className="font-medium text-[#1E293B] dark:text-white mt-0.5">{selectedClient.alamat_kantor}</p>
            </div>

            {/* Komponen Pemilihan Wilayah Site via EMSIFA Public API */}
            <div className="p-4 rounded-[14px] border border-blue-200 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-800/60">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                Penentuan Wilayah Site Operasional (EMSIFA Public API):
              </p>
              <WilayahSelector
                onSelectRegion={(reg) => {
                  setTestRegion(reg);
                }}
              />
              {testRegion && (testRegion.province || testRegion.city) && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200">
                  Lokasi Site Terpilih: <strong>{testRegion.city}</strong>, {testRegion.province}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
