/**
 * @file UnitsPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Modul Pengelolaan Inventaris Radio Komunikasi TERA.
 * Fitur: Form create/edit modal, upload foto preview, filter kategori, search, dan pagination.
 * Mengonsumsi data dinamis dari Mock API via Axios.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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
    setTimeout(() => setFeedback(null), 3000);
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
      showFeedback(`Perangkat [${form.kode_unit}] berhasil ditambahkan.`);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Floating feedback alert */}
        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 shadow-md">
            {feedback}
          </div>
        )}

        {/* Page Title & Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Kelola Unit Radio</h1>
            <p className="text-xs text-slate-500 mt-1">
              Inventaris perangkat telekomunikasi repeater, handy talkie, base station, dan radio maritim
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Icon name="plus" size={16} />
            <span>Tambah Unit Baru</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="tera-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-slate-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode unit, model, atau lokasi..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState message="Mengambil katalog unit via Axios API..." rows={4} />}
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
          <>
            <div className="tera-card overflow-hidden">
              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>Kode Unit</th>
                      <th>Model &amp; Merk</th>
                      <th>Kategori</th>
                      <th>Frekuensi</th>
                      <th>Harga Sewa/Bulan</th>
                      <th>Status</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUnits.map((unit) => (
                      <tr key={unit.id}>
                        <td>
                          <span className="font-mono font-bold text-blue-700">{unit.kode_unit}</span>
                          <span className="block text-[11px] text-slate-400">{unit.lokasi}</span>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-900 block">{unit.nama_unit}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{unit.merk}</span>
                        </td>
                        <td>{unit.kategori}</td>
                        <td className="text-xs text-slate-600 font-mono">{unit.frekuensi}</td>
                        <td className="font-bold text-slate-900">{formatRupiah(unit.harga_sewa)}</td>
                        <td>
                          <StatusBadge status={unit.status_unit} />
                        </td>
                        <td className="text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(unit)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold"
                            title="Edit Unit"
                          >
                            <Icon name="edit" size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(unit)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                            title="Hapus Unit"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUnits.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      {/* Modal Form Tambah / Edit Unit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Perangkat Radio' : 'Tambah Perangkat Radio Baru'}
        subtitle="Lengkapi spesifikasi teknis dan parameter komersial sewa unit"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white"
            >
              Simpan Perangkat
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Kode Unit</label>
              <input
                type="text"
                value={form.kode_unit}
                onChange={(e) => setForm({ ...form, kode_unit: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nama Model Perangkat *</label>
            <input
              type="text"
              value={form.nama_unit}
              onChange={(e) => setForm({ ...form, nama_unit: e.target.value })}
              placeholder="Contoh: Motorola SLR 5300 Repeater"
              className="w-full rounded-lg border border-slate-300 p-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Merk</label>
              <input
                type="text"
                value={form.merk}
                onChange={(e) => setForm({ ...form, merk: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Rentang Frekuensi</label>
              <input
                type="text"
                value={form.frekuensi}
                onChange={(e) => setForm({ ...form, frekuensi: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Harga Sewa / Bulan (Rp)</label>
              <input
                type="number"
                value={form.harga_sewa}
                onChange={(e) => setForm({ ...form, harga_sewa: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Status Fisik</label>
              <select
                value={form.status_unit}
                onChange={(e) => setForm({ ...form, status_unit: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 bg-white"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Disewa">Disewa</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Lokasi Unit / Gudang</label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Unit Radio?"
        subtitle={`Konfirmasi penghapusan unit [${deleteTarget?.kode_unit || ''}]`}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white"
            >
              Hapus Unit
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.nama_unit}</strong> dari inventaris sistem?
        </p>
      </Modal>

      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo. Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
