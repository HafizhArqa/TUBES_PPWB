/**
 * @file UnitsPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Modul Pengelolaan Inventaris Radio Komunikasi TERA.
 * Fitur: Form create/edit modal, upload foto preview, filter kategori, search, dan pagination.
 * Mengonsumsi data dinamis dari Mock API via Axios dengan tema Tailwind Blue & Dark Mode.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

const formatRupiah = (number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);

const EMPTY_FORM = {
  kode_unit: '',
  nama_unit: '',
  kategori: 'Repeater',
  merk: 'Motorola',
  frekuensi: 'UHF 403-470 MHz',
  harga_sewa: 3500000,
  harga_jual: 42000000,
  status_unit: 'Tersedia',
  lokasi: 'Gudang Pusat Cilandak, Jakarta Selatan',
  spesifikasi: '',
};

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/units.json');
      setUnits(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data unit dari Mock API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Filter & Search
  const filteredUnits = units.filter((u) => {
    if (category !== 'Semua' && u.kategori !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const match =
        String(u.kode_unit || '').toLowerCase().includes(q) ||
        String(u.nama_unit || '').toLowerCase().includes(q) ||
        String(u.lokasi || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      kode_unit: `RAD-${String(units.length + 1).padStart(3, '0')}`,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (unit) => {
    setEditingId(unit.id);
    setForm({ ...unit });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nama_unit.trim()) {
      alert('Nama model unit wajib diisi!');
      return;
    }

    if (editingId) {
      setUnits((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
      showFeedback(`Perangkat [${form.kode_unit}] berhasil diperbarui.`);
    } else {
      const newUnit = {
        id: Date.now(),
        ...form,
      };
      setUnits((prev) => [newUnit, ...prev]);
      showFeedback(`Perangkat [${form.kode_unit}] berhasil ditambahkan ke inventaris.`);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    showFeedback(`Unit [${deleteTarget.kode_unit}] telah dihapus.`);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {/* Floating feedback alert */}
        {feedback && (
          <div role="status" className="p-3 rounded-md bg-green-100 dark:bg-green-700 border border-green-300 dark:border-green-600 text-xs font-bold text-green-900 dark:text-green-100 shadow">
            {feedback}
          </div>
        )}

        {/* Page Title & Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Kelola Unit Radio Komunikasi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              Modul Steven Taufik Fajar — Inventaris Repeater, Handy Talkie, Base Station &amp; Radio Maritim
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-bold shadow transition-colors"
          >
            <Icon name="plus" size={14} />
            <span>Tambah Unit Baru</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 transition-colors">
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
              placeholder="Cari kode unit, model, atau lokasi site..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
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
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState message="Mengambil katalog unit via Axios Mock API..." rows={4} />}
        {error && <ErrorState message={error} onRetry={fetchUnits} />}

        {!loading && !error && filteredUnits.length === 0 && (
          <EmptyState
            title="Tidak Ada Unit Ditemukan"
            description="Tidak ada unit radio yang cocok dengan kata kunci atau filter kategori yang dipilih."
            actionText="Reset Filter"
            onAction={() => {
              setQuery('');
              setCategory('Semua');
            }}
          />
        )}

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
                    <th className="px-4 py-3">Harga Sewa / Bln</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
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
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(unit)}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(unit)}
                              className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 font-semibold text-xs transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
              <span className="flex items-center col-span-4">
                Menampilkan {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredUnits.length)} dari {filteredUnits.length} Unit
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

      {/* Modal Form Tambah / Edit Unit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit Unit: ${form.kode_unit}` : 'Tambah Unit Radio Baru'}
        subtitle="Form registrasi perangkat radio komunikasi ke inventaris Mock API"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kode Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.kode_unit}
                onChange={(e) => setForm({ ...form, kode_unit: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Repeater">Repeater</option>
                <option value="Radio Base">Radio Base</option>
                <option value="Radio HT">Radio HT</option>
                <option value="Radio HF SSB">Radio HF SSB</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama Model Perangkat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama_unit}
                onChange={(e) => setForm({ ...form, nama_unit: e.target.value })}
                placeholder="Contoh: Motorola SLR 5300"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Merk / Manufaktur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.merk}
                onChange={(e) => setForm({ ...form, merk: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Harga Sewa Bulanan (Rp)
              </label>
              <input
                type="number"
                value={form.harga_sewa}
                onChange={(e) => setForm({ ...form, harga_sewa: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status Unit
              </label>
              <select
                value={form.status_unit}
                onChange={(e) => setForm({ ...form, status_unit: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Disewa">Disewa</option>
                <option value="Perawatan">Perawatan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lokasi Penempatan / Gudang
            </label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow"
            >
              {editingId ? 'Simpan Perubahan' : 'Tambahkan Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus Unit */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Unit Radio"
        subtitle={`Konfirmasi penghapusan perangkat [${deleteTarget?.kode_unit}]`}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow"
            >
              Ya, Hapus Unit
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Apakah Anda yakin ingin menghapus unit <strong>{deleteTarget?.nama_unit}</strong> ({deleteTarget?.kode_unit}) dari inventaris?
        </p>
      </Modal>
    </div>
  );
}
