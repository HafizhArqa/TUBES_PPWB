/**
 * @file PelangganPage.jsx
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Modul Master Pelanggan Korporat B2B TERA.
 * Mengelola direktori master data entitas mitra perusahaan (PT/CV), NPWP, PIC Procurement,
 * dan integrasi pemilihan lokasi site via Public API EMSIFA (WilayahSelector).
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import WilayahSelector from '../components/WilayahSelector';
import StatusBadge from '../components/StatusBadge';
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
    setTimeout(() => setFeedback(null), 3000);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 shadow-md">
            {feedback}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Data Pelanggan</h1>
            <p className="text-xs text-slate-500 mt-1">
              Direktori mitra korporat B2B, legalitas NPWP, PIC procurement, dan integrasi Public API Wilayah
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Icon name="plus" size={16} />
            <span>Tambah Mitra Baru</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="tera-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-slate-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama perusahaan, PIC, atau alamat..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['Semua', 'Aktif', 'Non-Aktif'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState message="Mengambil data pelanggan via Axios API..." rows={4} />}
        {error && <ErrorState message={error} onRetry={fetchPelanggan} />}

        {!loading && !error && filteredClients.length === 0 && (
          <EmptyState
            title="Tidak Ada Data Mitra"
            description="Tidak ditemukan data pelanggan yang sesuai dengan pencarian."
            actionText="Reset Pencarian"
            onAction={() => {
              setSearch('');
              setStatusFilter('Semua');
            }}
          />
        )}

        {!loading && !error && filteredClients.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedClients.map((c) => (
                <article
                  key={c.id_pelanggan}
                  className="tera-card p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center shrink-0">
                        {String(c.nama_perusahaan || 'P').slice(0, 2).toUpperCase()}
                      </div>
                      <StatusBadge status={c.status_aktif || 'Aktif'} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {c.nama_perusahaan}
                      </h2>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                        NPWP: {c.npwp || '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <p className="font-semibold text-slate-800">
                        PIC: {c.pic_nama} <span className="text-slate-400 font-normal">({c.pic_jabatan})</span>
                      </p>
                      <p className="text-slate-600">{c.pic_telepon}</p>
                      <p className="text-slate-600 truncate">{c.pic_email}</p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      <Icon name="mapPin" size={13} className="inline mr-1 text-slate-400" />
                      {c.alamat_kantor || 'Alamat belum diatur'}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      {/* Modal Form Tambah / Edit Pelanggan */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Data Mitra Korporat' : 'Tambah Mitra Korporat Baru'}
        subtitle="Lengkapi identitas korporat, NPWP, perwakilan PIC, dan lokasi site"
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
              Simpan Data Mitra
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nama Perusahaan (PT / CV) *</label>
            <input
              type="text"
              value={form.nama_perusahaan}
              onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
              placeholder="Contoh: PT Samudera Raya Logistik"
              className="w-full rounded-lg border border-slate-300 p-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={form.npwp}
                onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                placeholder="01.234.567.8-901.000"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Status Keaktifan</label>
              <select
                value={form.status_aktif}
                onChange={(e) => setForm({ ...form, status_aktif: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama PIC Procurement</label>
              <input
                type="text"
                value={form.pic_nama}
                onChange={(e) => setForm({ ...form, pic_nama: e.target.value })}
                placeholder="Nama perwakilan"
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Jabatan PIC</label>
              <input
                type="text"
                value={form.pic_jabatan}
                onChange={(e) => setForm({ ...form, pic_jabatan: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nomor Telepon PIC</label>
              <input
                type="text"
                value={form.pic_telepon}
                onChange={(e) => setForm({ ...form, pic_telepon: e.target.value })}
                placeholder="0812-XXXX-XXXX"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Resmi PIC</label>
              <input
                type="email"
                value={form.pic_email}
                onChange={(e) => setForm({ ...form, pic_email: e.target.value })}
                placeholder="pic@perusahaan.com"
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
          </div>

          {/* Integrasi Public API EMSIFA Wilayah Indonesia (Zakaria) */}
          <WilayahSelector onSelectRegion={handleRegionSelected} />

          <div>
            <label className="block text-slate-700 font-medium mb-1">Alamat Kantor / Site Proyek</label>
            <textarea
              rows={2}
              value={form.alamat_kantor}
              onChange={(e) => setForm({ ...form, alamat_kantor: e.target.value })}
              placeholder="Alamat kantor pusat atau lokasi site proyek..."
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Data Mitra?"
        subtitle={`Konfirmasi penghapusan mitra [${deleteTarget?.nama_perusahaan || ''}]`}
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
              Hapus Mitra
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Apakah Anda yakin ingin menghapus data mitra <strong>{deleteTarget?.nama_perusahaan}</strong> dari direktori master data?
        </p>
      </Modal>

      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} PT Utama Telekomindo. Sistem Informasi Berbasis API.
      </footer>
    </div>
  );
}
