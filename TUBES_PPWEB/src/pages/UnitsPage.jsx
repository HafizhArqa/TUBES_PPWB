/**
 * @file UnitsPage.jsx
 * @description Halaman Kelola Unit Radio BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Memadukan CSS Grid + Flexbox dengan Tailwind CSS.
 * 100% Data Fetching dari Mock API (units.json) via Axios, dilengkapi Paginasi, Filter Kategori/Status, & Modal Inspeksi.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import BankCard from '../components/BankCard';
import MyExpenseBarChart from '../components/MyExpenseBarChart';
 * 100% Data Fetching dari Mock API (units.json) via Axios, dilengkapi Paginasi, Filter Kategori/Status, Modal Inspeksi, serta tampilan responsif Mobile/Tablet/Desktop.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
const UNIT_CATEGORIES = ['Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];
const UNIT_TYPES = ['Sewa', 'Jual', 'Sewa & Jual'];
const UNIT_INITIAL_STATUSES = ['Tersedia', 'Disewa', 'Maintenance', 'Rusak'];
const BRAND_SUGGESTIONS = ['Motorola', 'Hytera', 'Icom', 'Kenwood', 'Barrett', 'Codan'];
const CUSTOM_UNITS_STORAGE_KEY = 'tera_custom_units';

const INITIAL_ADD_FORM = {
  kode_unit: '',
  merk: 'Motorola',
  nama_unit: '',
  kategori: 'Radio HT',
  tipe_unit: 'Sewa',
  harga_sewa: '0',
  harga_jual: '0',
  status_unit: 'Tersedia',
  spesifikasi: '',
  foto_unit: '',
  foto_nama: '',
};

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

const extractFrequencyFromSpec = (spec = '') => {
  const text = String(spec || '').trim();
  if (!text) return 'Sesuai Spesifikasi';
  const freqMatch = text.match(/\b(?:(?:UHF|VHF|HF|Marine\s+VHF)\s+)?\d+(?:\.\d+)?\s*(?:-|–)\s*\d+(?:\.\d+)?\s*MHz(?:\s*(?:SSB|FM|DMR))?\b/i);
  const powerMatch = text.match(/\b(\d+\s*W)\b/i);
  if (freqMatch) {
    const baseFreq = freqMatch[0].replace(/\s+/g, ' ').trim();
    return powerMatch ? `${baseFreq} (${powerMatch[1].toUpperCase().replace(/\s+/g, '')})` : baseFreq;
  }
  return 'Sesuai Spesifikasi';
};

const getDefaultLocationByStatus = (status) => {
  if (status === 'Disewa') return 'Site Operasional Mitra';
  if (status === 'Maintenance' || status === 'Rusak') return 'Workshop RF Kalibrasi Bekasi, Jawa Barat';
  return 'Gudang Pusat Cilandak, Jakarta Selatan';
};

const getDefaultPhotoByCategory = (kategori) => {
  if (kategori === 'Repeater') return '/images/units/repeater-slr5300.svg';
  if (kategori === 'Radio Base') return '/images/units/radiobase-m8668i.svg';
  if (kategori === 'Radio HF SSB') return '/images/units/hf-barrett4050.svg';
  return '/images/units/ht-p8668i.svg';
};

const generateUniqueUnitCode = (kategori, existingUnits = []) => {
  const prefixMap = {
    Repeater: 'TERA-REP',
    'Radio Base': 'TERA-RBS',
    'Radio HT': 'TERA-RHT',
    'Radio HF SSB': 'TERA-SSB',
  };
  const prefix = prefixMap[kategori] || 'TERA-UNT';
  const existingCodes = new Set(existingUnits.map((u) => String(u.kode_unit || '').toUpperCase()));
  let seq = existingUnits.length + 1;
  let candidate = `${prefix}-${String(seq).padStart(3, '0')}`;
  while (existingCodes.has(candidate.toUpperCase())) {
    seq += 1;
    candidate = `${prefix}-${String(seq).padStart(3, '0')}`;
  }
  return candidate;
};

const loadCustomUnits = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_UNITS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCustomUnits = (customUnits) => {
  try {
    localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(customUnits));
  } catch {
    // Jika gambar dataURL besar melebihi kuota storage, simpan metadata tanpa foto
    try {
      const liteUnits = customUnits.map((u) => ({
        ...u,
        foto_unit: String(u.foto_unit || '').startsWith('data:') ? getDefaultPhotoByCategory(u.kategori) : u.foto_unit,
      }));
      localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(liteUnits));
    } catch {}
  }
};

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [query, setQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_ADD_FORM);
  const [addError, setAddError] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState('');
  const photoInputRef = useRef(null);
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
      const customUnits = loadCustomUnits();
      const customCodes = new Set(customUnits.map((u) => String(u.kode_unit || '').toUpperCase()));
      const merged = [
        ...customUnits,
        ...res.data.filter((u) => !customCodes.has(String(u.kode_unit || '').toUpperCase())),
      ];
      setUnits(merged);
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

  const handleOpenAddModal = () => {
    setAddForm(INITIAL_ADD_FORM);
    setAddError('');
    setIsDraggingPhoto(false);
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setAddError('');
    setIsDraggingPhoto(false);
  };

  const handleAutoGenerateCode = () => {
    const code = generateUniqueUnitCode(addForm.kategori, units);
    setAddForm((prev) => ({ ...prev, kode_unit: code }));
    if (addError) setAddError('');
  };

  const handleProcessPhotoFile = (file) => {
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const isAllowedExt = /\.(png|jpe?g|webp)$/i.test(file.name || '');
    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setAddError('Format foto harus berupa PNG, JPG, atau WEBP.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setAddError('Ukuran foto maksimal 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAddForm((prev) => ({
        ...prev,
        foto_unit: typeof reader.result === 'string' ? reader.result : '',
        foto_nama: file.name,
      }));
      setAddError('');
    };
    reader.onerror = () => {
      setAddError('Gagal membaca berkas gambar. Silakan coba file lain.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateUnit = (e) => {
    e.preventDefault();
    const kodeUnit = addForm.kode_unit.trim();
    const merk = addForm.merk.trim();
    const namaUnit = addForm.nama_unit.trim();
    const hargaSewa = Number(addForm.harga_sewa);
    const hargaJual = Number(addForm.harga_jual || 0);

    if (!kodeUnit) {
      setAddError('Kode Unit wajib diisi.');
      return;
    }
    if (!merk) {
      setAddError('Merk Perangkat wajib diisi.');
      return;
    }
    if (!namaUnit) {
      setAddError('Nama Unit / Seri wajib diisi.');
      return;
    }
    if (units.some((u) => String(u.kode_unit || '').toUpperCase() === kodeUnit.toUpperCase())) {
      setAddError(`Kode Unit "${kodeUnit}" sudah terdaftar. Gunakan kode lain atau klik tombol generate otomatis.`);
      return;
    }
    if (Number.isNaN(hargaSewa) || hargaSewa < 0) {
      setAddError('Harga Sewa / Bulan harus berupa angka yang valid (minimal 0).');
      return;
    }
    if (Number.isNaN(hargaJual) || hargaJual < 0) {
      setAddError('Harga Jual / Unit harus berupa angka yang valid (minimal 0).');
      return;
    }

    const nowIso = new Date().toISOString();
    const specText = addForm.spesifikasi.trim();
    const newUnit = {
      id_unit: Date.now(),
      kode_unit: kodeUnit,
      nama_unit: namaUnit,
      kategori: addForm.kategori,
      merk,
      tipe_unit: addForm.tipe_unit,
      frekuensi: extractFrequencyFromSpec(specText),
      harga_sewa: hargaSewa,
      harga_jual: hargaJual,
      status_unit: addForm.status_unit,
      lokasi: getDefaultLocationByStatus(addForm.status_unit),
      klien: null,
      foto_unit: addForm.foto_unit || getDefaultPhotoByCategory(addForm.kategori),
      spesifikasi:
        specText ||
        `${addForm.kategori} ${merk} seri ${namaUnit}, tipe ${addForm.tipe_unit}, siap inspeksi dan kalibrasi operasional TERA.`,
      created_at: nowIso,
      updated_at: nowIso,
      isCustom: true,
    };

    const nextCustomUnits = [newUnit, ...loadCustomUnits()];
    saveCustomUnits(nextCustomUnits);

    setUnits((prev) => [newUnit, ...prev]);
    setCategory('Semua');
    setStatusFilter('Semua');
    setQuery('');
    setCurrentPage(1);
    setAddModalOpen(false);
    setAddForm(INITIAL_ADD_FORM);
    setAddError('');
    setFeedbackBanner(`Unit baru ${newUnit.kode_unit} (${newUnit.nama_unit}) berhasil disimpan ke daftar inventaris.`);
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
        <main id="main-content" className="flex-1 p-4 sm:p-7 max-w-[1600px] w-full mx-auto space-y-7">
          {/* Top Bar Action (Simulasi & Refresh) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#E2E8F0]/60 dark:border-[#334155]/60">
            <div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Inventaris &amp; Monitoring Seluruh Perangkat Telekomunikasi TERA
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSimulation}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
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
              TOP SECTION: MY CARDS (LEFT 60%) + MY EXPENSE (RIGHT 40%) - BANKFLASH TRANSACTIONS STYLE
              ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* MY CARDS SECTION */}
            

            {/* MY EXPENSE SECTION */}
           
          </div>

          {/* =========================================================================
              KATALOG & DAFTAR UNIT RADIO (CLEAN MODERN TABLE)
              ========================================================================= */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
            {/* Header Judul */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl sm:text-[22px] font-bold text-[#1E293B] dark:text-white tracking-tight">
                  Recent Transactions
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
          {/* Feedback Banner Saat Unit Berhasil Ditambahkan */}
          {feedbackBanner && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="check" size={14} />
                </span>
                <span className="truncate sm:whitespace-normal">{feedbackBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner('')}
                aria-label="Tutup notifikasi"
                className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shrink-0"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          {/* =========================================================================
              KATALOG & DAFTAR UNIT RADIO (RESPONSIF DESKTOP TABLE + MOBILE CARDS)
              ========================================================================= */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-4 sm:p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
            {/* Header Judul, Pencarian & Tombol Tambah Unit */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-[22px] font-bold text-[#1E293B] dark:text-white tracking-tight">
                  Recent Transactions
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Daftar armada repeater, base station, handy talkie, dan radio maritim aktif
                </p>
              </div>

              {/* Search Pill: Grey background, hover/focus blue */}
              <div className="flex items-center gap-3 bg-[#F1F5F9] dark:bg-gray-800/80 rounded-full px-4 py-2 w-full sm:w-72 border border-[#E2E8F0] dark:border-gray-700 hover:border-blue-400 focus-within:border-blue-600 transition-all">
                <Icon name="search" size={16} className="text-[#64748B]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari kode unit, model, lokasi..."
                  className="bg-transparent text-xs text-[#1E293B] dark:text-white placeholder-[#64748B] outline-none w-full"
                />
              </div>
            </div>

            {/* Navigation Tabs Bar (BankFlash style: All Transactions, Income, Expense, etc.) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-1 mb-5">
              {/* Status Tabs */}
              <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {/* Search Pill: Grey background, hover/focus blue */}
                <div className="flex items-center gap-2.5 bg-[#F1F5F9] dark:bg-gray-800/80 rounded-full px-4 py-2.5 w-full sm:flex-1 lg:flex-initial lg:w-72 border border-[#E2E8F0] dark:border-gray-700 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
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

                {/* Tombol Tambah Unit */}
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 transition-all whitespace-nowrap shrink-0"
                >
                  <Icon name="plus" size={16} />
                  <span>Tambah Unit</span>
                </button>
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
                      className={`relative pb-3 text-sm font-semibold transition-colors ${
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

              {/* Category Filter Pills: Grey, Hover Biru */}
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-[#F1F5F9] dark:bg-gray-800 text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
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
                }}
              />
            )}

            {/* Data Table Hasil Fetch */}
            {!loading && !error && filteredUnits.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="pb-3.5 px-3">Description</th>
                      <th className="pb-3.5 px-3">Transaction ID</th>
                      <th className="pb-3.5 px-3">Type</th>
                      <th className="pb-3.5 px-3">Card / Frekuensi</th>
                      <th className="pb-3.5 px-3">Date / Lokasi</th>
                      <th className="pb-3.5 px-3 text-right">Amount</th>
                      <th className="pb-3.5 px-3 text-center">Receipt</th>
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
                          key={unit.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors group cursor-pointer"
                        >
                          {/* Description: Circle Icon with arrow + Title */}
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center text-[#64748B] group-hover:text-blue-600 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all flex-shrink-0">
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
                              <div>
                                <span className="font-bold text-[#1E293B] dark:text-white block group-hover:text-blue-600 transition-colors">
                                  {unit.nama_unit}
                                </span>
                                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                  {unit.merk}
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
                          <td className="py-4 px-3 font-mono text-[#64748B] dark:text-[#94A3B8]">
                            #{unit.kode_unit}
                          </td>

                          {/* Type */}
                          <td className="py-4 px-3 text-[#64748B] dark:text-[#94A3B8] font-medium">
                            {unit.kategori}
                          </td>

                          {/* Card / Frekuensi */}
                          <td className="py-4 px-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
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
                          <td className="py-4 px-3 text-[#64748B] dark:text-[#94A3B8]">
                          <td className="py-4 px-2.5 xl:px-3 text-[#64748B] dark:text-[#94A3B8] max-w-[165px] xl:max-w-[230px] leading-snug">
                            {unit.lokasi}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-3 text-right font-bold">
                          <td className="py-4 px-2.5 xl:px-3 text-right font-bold whitespace-nowrap">
                            <span className={isDisewa ? 'text-rose-500' : 'text-emerald-500'}>
                              {isDisewa ? '-' : '+'}
                              {formatRupiah(unit.harga_sewa || unit.tarif_sewa_bulanan)}
                            </span>
                          </td>

                          {/* Receipt: Pill Outline Button with Blue Hover */}
                          <td className="py-4 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedUnit(unit)}
                              className="px-4 py-1.5 rounded-full border border-[#E2E8F0] dark:border-gray-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-sm"
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
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0] dark:border-[#334155] mt-4">
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
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

      {/* Modal Tambah Unit Inventaris Baru */}
      <Modal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        title="Tambah Unit Inventaris Baru"
        titleIcon={<Icon name="plusCircle" size={20} className="text-blue-600" />}
        subtitle="Lengkapi spesifikasi perangkat telekomunikasi untuk disimpan ke database."
        maxWidth="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="add-unit-form"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all"
            >
              <Icon name="saveBox" size={16} />
              <span>Simpan Unit</span>
            </button>
          </div>
        }
      >
        <form id="add-unit-form" onSubmit={handleCreateUnit} className="space-y-5 text-left">
          {addError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300"
            >
              <Icon name="alert" size={16} className="shrink-0 mt-0.5" />
              <span>{addError}</span>
            </div>
          )}

          {/* Bagian Atas: Upload Foto Perangkat (Kiri) + Spesifikasi Utama (Kanan) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Kiri: Foto Perangkat */}
            <div className="md:col-span-5 space-y-2">
              <span className="block text-xs font-bold text-[#1E293B] dark:text-white">
                Foto Perangkat
              </span>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleProcessPhotoFile(file);
                  e.target.value = '';
                }}
              />

              <div
                role="button"
                tabIndex={0}
                aria-label="Pilih atau seret foto perangkat"
                onClick={() => photoInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    photoInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(true);
                }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(false);
                  const file = e.dataTransfer?.files?.[0];
                  handleProcessPhotoFile(file);
                }}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed min-h-[172px] p-4 text-center cursor-pointer transition-all overflow-hidden ${
                  isDraggingPhoto
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30'
                    : 'border-[#CBD5E1] dark:border-[#475569] bg-[#F8FAFC] dark:bg-gray-800/40 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                }`}
              >
                {addForm.foto_unit ? (
                  <div className="w-full space-y-2.5">
                    <img
                      src={addForm.foto_unit}
                      alt="Pratinjau foto perangkat"
                      className="w-full h-28 object-contain rounded-xl bg-white dark:bg-gray-900/60 p-1.5"
                    />
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#64748B] dark:text-[#94A3B8] truncate">
                        {addForm.foto_nama || 'Foto terpilih'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddForm((prev) => ({ ...prev, foto_unit: '', foto_nama: '' }));
                        }}
                        className="text-rose-600 hover:text-rose-700 font-semibold shrink-0"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2.5 text-blue-600 dark:text-blue-400">
                      <Icon name="uploadCloud" size={30} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">
                      Pilih atau Seret Foto
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      PNG, JPG, WEBP (Maks. 4MB)
                    </span>
                  </>
                )}
              </div>

              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Unggah gambar nyata perangkat untuk katalog penyewaan.
              </p>
            </div>

            {/* Kanan: Kode Unit, Merk, Nama Unit, Kategori, Tipe Unit */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Kode Unit */}
                <div>
                  <label htmlFor="add-kode-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                    Kode Unit <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all overflow-hidden">
                    <input
                      id="add-kode-unit"
                      type="text"
                      value={addForm.kode_unit}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, kode_unit: e.target.value }))}
                      placeholder="TERA-REP-013"
                      className="w-full min-w-0 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateCode}
                      title="Generate Kode Unit Otomatis"
                      aria-label="Generate Kode Unit Otomatis"
                      className="px-2.5 py-2.5 border-l border-[#E2E8F0] dark:border-[#475569] text-[#64748B] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shrink-0"
                    >
                      <Icon name="sparkles" size={16} />
                    </button>
                  </div>
                </div>

                {/* Merk Perangkat */}
                <div>
                  <label htmlFor="add-merk-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                    Merk Perangkat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-merk-unit"
                    type="text"
                    list="tera-merk-suggestions"
                    value={addForm.merk}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, merk: e.target.value }))}
                    placeholder="contoh: Motorola"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                  <datalist id="tera-merk-suggestions">
                    {BRAND_SUGGESTIONS.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Nama Unit / Seri */}
              <div>
                <label htmlFor="add-nama-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                  Nama Unit / Seri <span className="text-rose-500">*</span>
                </label>
                <input
                  id="add-nama-unit"
                  type="text"
                  value={addForm.nama_unit}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, nama_unit: e.target.value }))}
                  placeholder="contoh: Repeater - Motorola SLR 5300"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Kategori Perangkat */}
                <div>
                  <label htmlFor="add-kategori-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                    Kategori Perangkat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="add-kategori-unit"
                      value={addForm.kategori}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, kategori: e.target.value }))}
                      className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm font-medium text-[#1E293B] dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all cursor-pointer"
                    >
                      {UNIT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 text-[#64748B] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* Tipe Unit (FR-020) */}
                <div>
                  <label htmlFor="add-tipe-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                    Tipe Unit (FR-020) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="add-tipe-unit"
                      value={addForm.tipe_unit}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, tipe_unit: e.target.value }))}
                      className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm font-medium text-[#1E293B] dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all cursor-pointer"
                    >
                      {UNIT_TYPES.map((tp) => (
                        <option key={tp} value={tp}>
                          {tp}
                        </option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 text-[#64748B] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Tengah: Harga Sewa, Harga Jual, Status Awal Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="add-harga-sewa" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                Harga Sewa / Bulan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="add-harga-sewa"
                type="number"
                min="0"
                step="1000"
                value={addForm.harga_sewa}
                onChange={(e) => setAddForm((prev) => ({ ...prev, harga_sewa: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm text-[#1E293B] dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="add-harga-jual" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                Harga Jual / Unit (Rp)
              </label>
              <input
                id="add-harga-jual"
                type="number"
                min="0"
                step="1000"
                value={addForm.harga_jual}
                onChange={(e) => setAddForm((prev) => ({ ...prev, harga_jual: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm text-[#1E293B] dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="add-status-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
                Status Awal Unit <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="add-status-unit"
                  value={addForm.status_unit}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, status_unit: e.target.value }))}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm font-medium text-[#1E293B] dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all cursor-pointer"
                >
                  {UNIT_INITIAL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[#64748B] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bagian Bawah: Deskripsi & Spesifikasi Frekuensi */}
          <div>
            <label htmlFor="add-spesifikasi-unit" className="block text-xs font-bold text-[#1E293B] dark:text-white mb-1.5">
              Deskripsi &amp; Spesifikasi Frekuensi
            </label>
            <textarea
              id="add-spesifikasi-unit"
              rows={3}
              value={addForm.spesifikasi}
              onChange={(e) => setAddForm((prev) => ({ ...prev, spesifikasi: e.target.value }))}
              placeholder="contoh: Frekuensi UHF 350-400 MHz, power 25W, cocok untuk lokasi proyek konstruksi."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-white dark:bg-gray-800/80 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all resize-y"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Detail Inspeksi Unit */}
      {selectedUnit && (
        <Modal
          open={Boolean(selectedUnit)}
          onClose={() => setSelectedUnit(null)}
          title={`Inspeksi Unit: ${selectedUnit.kode_unit}`}
          subtitle={`Spesifikasi teknis perangkat telekomunikasi ${selectedUnit.nama_unit}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
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
          <div className="space-y-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] dark:bg-gray-800/50 border border-[#E2E8F0] dark:border-gray-700">
          <div className="space-y-4 text-xs text-[#64748B] dark:text-[#94A3B8] text-left">
            {selectedUnit.foto_unit && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-gray-800/50 border border-[#E2E8F0] dark:border-gray-700 flex items-center justify-center">
                <img
                  src={selectedUnit.foto_unit}
                  alt={selectedUnit.nama_unit}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-36 object-contain rounded-lg"
                />
              </div>
            )}
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
                <span className="block text-[10px] uppercase font-bold text-gray-400">Tipe Unit</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.tipe_unit || 'Sewa'}</span>
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
                <span className="font-bold text-emerald-600 text-sm">{selectedUnit.status_unit}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400">Tarif Sewa Bulanan</span>
                <span className="font-bold text-blue-600 text-sm">
                  {formatRupiah(selectedUnit.harga_sewa || selectedUnit.tarif_sewa_bulanan)}
                </span>
              </div>
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
              {Number(selectedUnit.harga_jual) > 0 && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Harga Jual / Unit</span>
                  <span className="font-bold text-[#1E293B] dark:text-white text-sm">
                    {formatRupiah(selectedUnit.harga_jual)}
                  </span>
                </div>
              )}
              {selectedUnit.klien && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Mitra Penyewa</span>
                  <span className="font-bold text-[#1E293B] dark:text-white text-sm">{selectedUnit.klien}</span>
                </div>
              )}
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Catatan Teknis / Lisensi</span>
              <p className="p-3 bg-[#F1F5F9] dark:bg-gray-800 rounded-lg text-[#1E293B] dark:text-gray-200">
                {selectedUnit.deskripsi ||
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
