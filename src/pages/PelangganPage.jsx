/**
 * @file PelangganPage.jsx
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Modul Master Pelanggan Korporat B2B TERA.
 * Mengelola direktori master data entitas mitra perusahaan (PT/CV), NPWP, PIC Procurement,
 * dan integrasi pemilihan lokasi site via Public API EMSIFA (WilayahSelector).
 * Menggunakan tema Tailwind Blue & Dark Mode terpadu.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import WilayahSelector from '../components/WilayahSelector';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

const EMPTY_CLIENT = {
  nama_perusahaan: '',
  npwp: '',
  pic_nama: '',
  pic_jabatan: 'Procurement Manager',
  pic_telepon: '',
  pic_email: '',
  alamat_kantor: '',
  status_aktif: 'Aktif',
};

export default function PelangganPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchPelanggan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Konsumsi data dinamis dari Mock API via Axios
      const res = await axios.get('/api/pelanggan.json');
      setClients(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pelanggan dari Mock API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPelanggan();
  }, [fetchPelanggan]);

  // Filter & Search
  const filteredClients = clients.filter((c) => {
    if (statusFilter !== 'Semua' && c.status_aktif !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        String(c.nama_perusahaan || '').toLowerCase().includes(q) ||
        String(c.pic_nama || '').toLowerCase().includes(q) ||
        String(c.alamat_kantor || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(EMPTY_CLIENT);
    setModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingId(client.id_pelanggan);
    setForm({ ...client });
    setModalOpen(true);
  };

  const handleRegionSelected = ({ province, city }) => {
    const combined = [city, province].filter(Boolean).join(', ');
    setForm((prev) => ({
      ...prev,
      alamat_kantor: combined
        ? `${prev.alamat_kantor ? prev.alamat_kantor.split(' - Site: ')[0] + ' - Site: ' : 'Site Area: '}${combined}`
        : prev.alamat_kantor,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nama_perusahaan.trim()) {
      alert('Nama perusahaan mitra wajib diisi!');
      return;
    }

    if (editingId) {
      setClients((prev) =>
        prev.map((c) => (c.id_pelanggan === editingId ? { ...c, ...form } : c))
      );
      showFeedback(`Data mitra ${form.nama_perusahaan} berhasil diperbarui.`);
    } else {
      const newClient = {
        id_pelanggan: Date.now(),
        ...form,
      };
      setClients((prev) => [newClient, ...prev]);
      showFeedback(`Mitra baru ${form.nama_perusahaan} berhasil didaftarkan.`);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setClients((prev) => prev.filter((c) => c.id_pelanggan !== deleteTarget.id_pelanggan));
    showFeedback(`Mitra ${deleteTarget.nama_perusahaan} telah dihapus.`);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="h-full ml-14 mt-14 mb-10 md:ml-64 p-3 sm:p-4 space-y-4">
        {feedback && (
          <div role="status" className="p-3 rounded-md bg-green-100 dark:bg-green-700 border border-green-300 dark:border-green-600 text-xs font-bold text-green-900 dark:text-green-100 shadow">
            {feedback}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Manajemen Master Data Pelanggan
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              Modul Zakaria — Direktori Mitra Korporat B2B &amp; Integrasi Public API Wilayah Indonesia (EMSIFA)
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-600 text-white text-xs font-bold shadow transition-colors"
          >
            <Icon name="plus" size={14} />
            <span>Tambah Mitra Baru</span>
          </button>
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
              placeholder="Cari nama perusahaan, PIC, atau alamat site..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-1">
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

        {loading && <LoadingState message="Mengambil master pelanggan via Axios API..." rows={4} />}
        {error && <ErrorState message={error} onRetry={fetchPelanggan} />}

        {!loading && !error && filteredClients.length === 0 && (
          <EmptyState
            title="Tidak Ada Data Mitra"
            description="Tidak ditemukan data pelanggan yang sesuai dengan kriteria pencarian."
            actionText="Reset Pencarian"
            onAction={() => {
              setSearch('');
              setStatusFilter('Semua');
            }}
          />
        )}

        {!loading && !error && filteredClients.length > 0 && (
          <div className="w-full overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                    <th className="px-4 py-3">Perusahaan &amp; Legalitas</th>
                    <th className="px-4 py-3">PIC Procurement</th>
                    <th className="px-4 py-3">Kontak &amp; Email</th>
                    <th className="px-4 py-3">Lokasi / Site Proyek</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
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
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
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

            <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
              <span className="flex items-center col-span-4">
                Menampilkan {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredClients.length)} dari {filteredClients.length} Mitra
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

      {/* Modal Form Tambah / Edit Mitra B2B dengan Integrasi WilayahSelector */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit Mitra: ${form.nama_perusahaan}` : 'Pendaftaran Mitra Korporat B2B Baru'}
        subtitle="Form terintegrasi Public API Wilayah Indonesia (EMSIFA) untuk penentuan site"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama Perusahaan / Badan Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama_perusahaan}
                onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
                placeholder="Contoh: PT Telekomunikasi Nusantara"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nomor Pokok Wajib Pajak (NPWP)
              </label>
              <input
                type="text"
                value={form.npwp}
                onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                placeholder="01.234.567.8-901.000"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap PIC
              </label>
              <input
                type="text"
                value={form.pic_nama}
                onChange={(e) => setForm({ ...form, pic_nama: e.target.value })}
                placeholder="Nama penanggung jawab"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={form.pic_telepon}
                onChange={(e) => setForm({ ...form, pic_telepon: e.target.value })}
                placeholder="+62 812-..."
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Korespondensi
              </label>
              <input
                type="email"
                value={form.pic_email}
                onChange={(e) => setForm({ ...form, pic_email: e.target.value })}
                placeholder="procurement@perusahaan.co.id"
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Integrasi Komponen Public API EMSIFA (Zakaria) */}
          <div className="p-3 rounded-lg border border-blue-200 dark:border-gray-600 bg-blue-50/60 dark:bg-gray-700/60">
            <span className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
              Pilih Wilayah Operasional Site (Fetch API EMSIFA)
            </span>
            <WilayahSelector onSelectRegion={handleRegionSelected} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Alamat Kantor / Deskripsi Site Lengkap
            </label>
            <textarea
              rows={2}
              value={form.alamat_kantor}
              onChange={(e) => setForm({ ...form, alamat_kantor: e.target.value })}
              placeholder="Alamat jalan, gedung, kawasan industri, atau koordinat site"
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
              {editingId ? 'Simpan Perubahan' : 'Daftarkan Mitra'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Mitra */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Data Mitra"
        subtitle={`Konfirmasi penghapusan mitra [${deleteTarget?.nama_perusahaan}]`}
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
              Ya, Hapus Mitra
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Apakah Anda yakin ingin menghapus data mitra <strong>{deleteTarget?.nama_perusahaan}</strong> dari sistem?
        </p>
      </Modal>
    </div>
  );
}
