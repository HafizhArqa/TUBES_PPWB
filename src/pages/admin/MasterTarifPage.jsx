/**
 * @file MasterTarifPage.jsx
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Modul Master Data Tarif Acuan & Paket Standar Perangkat Radio B2B TERA.
 * Mengelola daftar acuan harga sewa bulanan, harga jual lepas, estimasi biaya One-Time Charge (OTC),
 * serta konfigurasi perpajakan B2B (PPh 23 2% & PPN 11%).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getMasterKatalogStandar,
  createMasterKatalogItem,
  updateMasterKatalogItem,
  deleteMasterKatalogItem,
} from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatRupiah } from '../../utils/formatters';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

const EMPTY_FORM = {
  kode: '',
  nama: '',
  kategori: 'Repeater',
  harga_sewa: 3500000,
  harga_jual: 42000000,
  otc: 2500000,
  deskripsi: '',
};

export default function MasterTarifPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMasterKatalogStandar({ search, kategori });
      setList(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, kategori]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditing(item);
    setForm({
      kode: item.kode,
      nama: item.nama,
      kategori: item.kategori,
      harga_sewa: item.harga_sewa,
      harga_jual: item.harga_jual,
      otc: item.otc || 0,
      deskripsi: item.deskripsi || '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.nama.trim()) next.nama = 'Nama paket standar acuan wajib diisi.';
    if (Number(form.harga_sewa) <= 0) next.harga_sewa = 'Tarif sewa bulanan harus lebih besar dari 0.';
    if (Number(form.harga_jual) <= 0) next.harga_jual = 'Harga jual aset harus lebih besar dari 0.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editing) {
        await updateMasterKatalogItem(editing.kode, form, user?.name);
        showToast(`Paket standar ${editing.kode} berhasil diperbarui.`, 'success');
      } else {
        await createMasterKatalogItem(form, user?.name);
        showToast('Paket standar acuan baru berhasil ditambahkan ke Master Data.', 'success');
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMasterKatalogItem(deleteTarget.kode, user?.name);
      showToast(`Paket standar ${deleteTarget.kode} berhasil dihapus dari Master Data.`, 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading && list.length === 0) {
    return <LoadingState message="Memuat Master Tarif & Standar Komersial..." rows={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
              Master Data TERA
            </span>
            <span className="text-xs text-slate-400">Acuan Komersial B2B</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Master Tarif & Paket Standar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola acuan patokan tarif sewa bulanan, harga pengadaan jual lepas, dan One-Time Charge (OTC) instalasi BTS
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all shadow-blue-500/20"
        >
          <Icon name="plus" size={16} />
          <span>Tambah Paket Acuan</span>
        </button>
      </header>

      {/* Tax & Commercial Parameter Cards */}
      <section aria-labelledby="tax-rules" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <h2 id="tax-rules" className="sr-only">Parameter Perpajakan B2B</h2>

        <article className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Icon name="percent" size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Tarif PPh 23 (Sewa B2B)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900">2.00%</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Potongan Pajak Jasa</span>
            </div>
          </div>
        </article>

        <article className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Icon name="receipt" size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Tarif PPN 11% (Jual Lepas)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900">11.00%</span>
              <span className="text-[11px] text-sky-600 font-semibold">Faktur Pajak Pertambahan</span>
            </div>
          </div>
        </article>

        <article className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Icon name="shieldCheck" size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              SLA Standard Uptime
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900">99.50%</span>
              <span className="text-[11px] text-amber-600 font-semibold">MTTR &lt; 4 Jam</span>
            </div>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section aria-labelledby="standard-table" className="tera-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="standard-table" className="text-sm font-bold text-slate-900">
            Daftar Paket Standar Acuan ({list.length} Paket)
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold overflow-x-auto">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setKategori(c)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    kategori === c ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Icon name="search" size={15} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode atau paket..."
                aria-label="Cari paket standar"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {list.length === 0 ? (
          <EmptyState
            icon="tag"
            title="Tidak Ada Paket Acuan"
            description="Tidak ditemukan paket standar dengan filter yang dipilih."
            actionLabel="Tambah Paket Acuan"
            onAction={openCreateModal}
          />
        ) : (
          <div className="tera-table-wrap">
            <table className="tera-table">
              <thead>
                <tr>
                  <th>Kode & Paket Standar</th>
                  <th>Kategori</th>
                  <th>Tarif Acuan Sewa / Bln</th>
                  <th>Harga Acuan Jual</th>
                  <th>Estimasi OTC</th>
                  <th>Deskripsi Teknis</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.kode}>
                    <td>
                      <span className="font-mono text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {item.kode}
                      </span>
                      <span className="block text-xs font-bold text-slate-900">{item.nama}</span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-700">{item.kategori}</span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-emerald-700">{formatRupiah(item.harga_sewa)}</span>
                      <span className="block text-[10px] text-slate-400">/ bulan / unit</span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-800">{formatRupiah(item.harga_jual)}</span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.otc ? formatRupiah(item.otc) : '—'}
                      </span>
                    </td>
                    <td>
                      <p className="text-[11px] text-slate-500 max-w-xs line-clamp-2">{item.deskripsi || '—'}</p>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Ubah Paket Acuan"
                          aria-label={`Ubah paket ${item.kode}`}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Hapus Paket Acuan"
                          aria-label={`Hapus paket ${item.kode}`}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Form Modal (Create / Edit) */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Ubah Master Paket: ${editing.kode}` : 'Tambah Master Paket Standar & Tarif Acuan'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="kategori-select" className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Perangkat <span className="text-red-500">*</span>
            </label>
            <select
              id="kategori-select"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nama-input" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Paket Standar Acuan <span className="text-red-500">*</span>
            </label>
            <input
              id="nama-input"
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Paket Repeater Motorola SLR 5300 + Duplexer"
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                errors.nama ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
              }`}
            />
            {errors.nama && <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.nama}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="sewa-input" className="block text-xs font-bold text-slate-700 mb-1">
                Tarif Sewa / Bln (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="sewa-input"
                type="number"
                min="0"
                step="50000"
                value={form.harga_sewa}
                onChange={(e) => setForm({ ...form, harga_sewa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label htmlFor="jual-input" className="block text-xs font-bold text-slate-700 mb-1">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="jual-input"
                type="number"
                min="0"
                step="500000"
                value={form.harga_jual}
                onChange={(e) => setForm({ ...form, harga_jual: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label htmlFor="otc-input" className="block text-xs font-bold text-slate-700 mb-1">
                Biaya OTC Instalasi (Rp)
              </label>
              <input
                id="otc-input"
                type="number"
                min="0"
                step="100000"
                value={form.otc}
                onChange={(e) => setForm({ ...form, otc: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deskripsi-input" className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Teknis Kelengkapan
            </label>
            <textarea
              id="deskripsi-input"
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Rincian kabel heliax, tuning duplexer, sertifikasi tahan ledakan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambahkan ke Master'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Master Paket Acuan"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus paket acuan <strong className="text-slate-900">{deleteTarget?.kode} - {deleteTarget?.nama}</strong> dari Master Data?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
            >
              Ya, Hapus Paket
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

