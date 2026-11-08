/**
 * @file UnitsPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Modul CRUD Master Inventaris Perangkat Radio Komunikasi TERA.
 * Fitur: Form create/edit modal, upload foto preview, filter kategori, search kode/nama,
 * pagination data dinamis, dan modal riwayat status unit.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getUnitsData,
  getUnitWithHistory,
  createUnitItem,
  updateUnitItem,
  deleteUnitItem,
  generateNextUnitCode,
} from '../../services/unitService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateTimeId } from '../../utils/formatters';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

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
  klien: '',
  foto_unit: '/images/units/repeater-slr5300.svg',
  spesifikasi: '',
};

export default function UnitsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [units, setUnits] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [summary, setSummary] = useState({ total: 0, tersedia: 0, disewa: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [kategori, setKategori] = useState('Semua');
  const [status, setStatus] = useState('Semua');
  const [page, setPage] = useState(1);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const urlQ = searchParams.get('q');
    if (urlQ !== null) setSearch(urlQ);
  }, [searchParams]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUnitsData({ search, kategori, status });
      setUnits(res.units);
      setAllUnits(res.allUnits);
      setSummary(res.summary);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, kategori, status]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const openCreateModal = () => {
    setEditingUnit(null);
    setForm({
      ...EMPTY_FORM,
      kode_unit: generateNextUnitCode(allUnits, 'Repeater'),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUnit(u);
    setForm({
      kode_unit: u.kode_unit,
      nama_unit: u.nama_unit,
      kategori: u.kategori,
      merk: u.merk,
      frekuensi: u.frekuensi || '',
      harga_sewa: u.harga_sewa,
      harga_jual: u.harga_jual,
      status_unit: u.status_unit,
      lokasi: u.lokasi || '',
      klien: u.klien || '',
      foto_unit: u.foto_unit || '/images/units/repeater-slr5300.svg',
      spesifikasi: u.spesifikasi || '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const openHistoryDetail = async (idUnit) => {
    try {
      const res = await getUnitWithHistory(idUnit);
      setDetailData(res);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, foto_unit: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const next = {};
    if (!form.kode_unit.trim()) next.kode_unit = 'Kode unit wajib diisi.';
    if (!form.nama_unit.trim() || form.nama_unit.trim().length < 3) {
      next.nama_unit = 'Nama perangkat wajib diisi (minimal 3 karakter).';
    }
    if (!form.merk.trim()) next.merk = 'Merk pabrikan wajib diisi.';
    if (Number(form.harga_sewa) <= 0) next.harga_sewa = 'Tarif sewa bulanan harus lebih dari Rp 0.';
    if (Number(form.harga_jual) <= 0) next.harga_jual = 'Harga jual unit harus lebih dari Rp 0.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingUnit) {
        await updateUnitItem(editingUnit.id_unit, form, user?.name);
        showToast(`Perangkat [${form.kode_unit}] berhasil diperbarui.`, 'success');
      } else {
        await createUnitItem(form, user?.name);
        showToast(`Perangkat baru [${form.kode_unit}] berhasil ditambahkan ke inventaris!`, 'success');
      }
      setFormOpen(false);
      loadUnits();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUnitItem(deleteTarget.id_unit, user?.name);
      showToast(`Unit [${deleteTarget.kode_unit}] berhasil dihapus.`, 'info');
      setDeleteTarget(null);
      loadUnits();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState message="Memuat data inventaris unit radio..." rows={5} />;
  if (error) return <ErrorState message={error} onRetry={loadUnits} />;

  const pageSize = 8;
  const pagedUnits = units.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Inventaris Unit Radio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen katalog perangkat Repeater, Base Station, Handy Talkie, dan HF SSB PT Utama Telekomindo
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="plus" size={16} />
          <span>Tambah Unit Baru</span>
        </button>
      </header>

      {/* 4 Metric Cards */}
      <section aria-label="Ringkasan inventaris" className="kpi-grid-4">
        <div className="tera-card p-4 border-l-4 border-l-blue-600">
          <span className="text-xs text-slate-500 font-semibold">Total Unit Terdaftar</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-500 font-semibold">Tersedia di Gudang</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.tersedia}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-indigo-500">
          <span className="text-xs text-slate-500 font-semibold">Sedang Disewa Klien</span>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{summary.disewa}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-amber-500">
          <span className="text-xs text-slate-500 font-semibold">Maintenance / Kalibrasi</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{summary.maintenance}</p>
        </div>
      </section>

      {/* Filter & Table */}
      <section className="tera-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter kategori unit">
            {CATEGORIES.map((kat) => (
              <button
                key={kat}
                type="button"
                role="tab"
                aria-selected={kategori === kat}
                onClick={() => setKategori(kat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  kategori === kat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="unit-status-select" className="sr-only">
              Filter Status Unit
            </label>
            <select
              id="unit-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Disewa">Disewa</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
            </select>

            <div className="relative min-w-[220px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Icon name="search" size={15} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari kode, nama, merk, atau lokasi unit"
                placeholder="Cari kode, merk, lokasi..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {pagedUnits.length === 0 ? (
          <EmptyState
            icon="box"
            title="Tidak Ada Unit yang Cocok"
            description="Ubah filter pencarian atau tambahkan unit perangkat baru ke inventaris."
          />
        ) : (
          <>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>Kategori & Frekuensi</th>
                    <th>Tarif Sewa / Bln</th>
                    <th>Harga Jual Lepas</th>
                    <th>Status & Lokasi</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUnits.map((u) => (
                    <tr key={u.id_unit}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={u.foto_unit}
                            alt={u.nama_unit}
                            className="w-12 h-9 rounded-lg object-cover bg-slate-900 shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-bold text-blue-600 block">
                              {u.kode_unit}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{u.nama_unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">
                        <span className="font-semibold text-slate-800">{u.kategori}</span>
                        <span className="block text-[11px] text-slate-500">
                          {u.merk} &bull; {u.frekuensi}
                        </span>
                      </td>
                      <td className="text-xs font-bold text-blue-700">{formatRupiah(u.harga_sewa)}</td>
                      <td className="text-xs font-semibold text-slate-700">{formatRupiah(u.harga_jual)}</td>
                      <td>
                        <StatusBadge status={u.status_unit} />
                        <span className="block text-[11px] text-slate-500 mt-1 max-w-[200px] truncate">
                          {u.lokasi}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openHistoryDetail(u.id_unit)}
                            aria-label={`Detail & riwayat ${u.nama_unit}`}
                            title="Detail & Riwayat Audit"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            aria-label={`Edit ${u.nama_unit}`}
                            title="Edit Unit"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            aria-label={`Hapus ${u.nama_unit}`}
                            title="Hapus Unit"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalItems={units.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Modal Tambah / Edit Unit */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingUnit ? `Edit Unit [${editingUnit.kode_unit}]` : 'Registrasi Unit Perangkat Baru'}
        subtitle="Pastikan spesifikasi frekuensi, tarif sewa korporat, dan harga pengadaan terisi akurat."
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              form="unit-crud-form"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              {saving ? 'Menyimpan...' : editingUnit ? 'Simpan Perubahan' : 'Tambahkan ke Inventaris'}
            </button>
          </>
        }
      >
        <form id="unit-crud-form" onSubmit={handleSaveUnit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="f-kategori" className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Perangkat <span className="text-red-600">*</span>
            </label>
            <select
              id="f-kategori"
              value={form.kategori}
              onChange={(e) => {
                const kat = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  kategori: kat,
                  kode_unit: editingUnit ? prev.kode_unit : generateNextUnitCode(allUnits, kat),
                }));
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
            >
              {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-kode" className="block text-xs font-semibold text-slate-700 mb-1">
              Kode Serial Inventaris <span className="text-red-600">*</span>
            </label>
            <input
              id="f-kode"
              type="text"
              value={form.kode_unit}
              onChange={(e) => setForm({ ...form, kode_unit: e.target.value })}
              aria-invalid={Boolean(formErrors.kode_unit)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold"
            />
            {formErrors.kode_unit && <p className="text-xs text-red-600 mt-1">{formErrors.kode_unit}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="f-nama" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama & Tipe Perangkat <span className="text-red-600">*</span>
            </label>
            <input
              id="f-nama"
              type="text"
              value={form.nama_unit}
              onChange={(e) => setForm({ ...form, nama_unit: e.target.value })}
              aria-invalid={Boolean(formErrors.nama_unit)}
              placeholder="Contoh: Motorola MOTOTRBO SLR 5300 UHF"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
            />
            {formErrors.nama_unit && <p className="text-xs text-red-600 mt-1">{formErrors.nama_unit}</p>}
          </div>

          <div>
            <label htmlFor="f-merk" className="block text-xs font-semibold text-slate-700 mb-1">
              Merk / Pabrikan <span className="text-red-600">*</span>
            </label>
            <input
              id="f-merk"
              type="text"
              value={form.merk}
              onChange={(e) => setForm({ ...form, merk: e.target.value })}
              aria-invalid={Boolean(formErrors.merk)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
            {formErrors.merk && <p className="text-xs text-red-600 mt-1">{formErrors.merk}</p>}
          </div>

          <div>
            <label htmlFor="f-freq" className="block text-xs font-semibold text-slate-700 mb-1">
              Pita Frekuensi & Daya Pancar
            </label>
            <input
              id="f-freq"
              type="text"
              value={form.frekuensi}
              onChange={(e) => setForm({ ...form, frekuensi: e.target.value })}
              placeholder="VHF 136-174 MHz (50W)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label htmlFor="f-sewa" className="block text-xs font-semibold text-slate-700 mb-1">
              Tarif Sewa Bulanan (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              id="f-sewa"
              type="number"
              min={0}
              value={form.harga_sewa}
              onChange={(e) => setForm({ ...form, harga_sewa: Number(e.target.value) })}
              aria-invalid={Boolean(formErrors.harga_sewa)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-blue-700"
            />
            {formErrors.harga_sewa && <p className="text-xs text-red-600 mt-1">{formErrors.harga_sewa}</p>}
          </div>

          <div>
            <label htmlFor="f-jual" className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Jual Lepas (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              id="f-jual"
              type="number"
              min={0}
              value={form.harga_jual}
              onChange={(e) => setForm({ ...form, harga_jual: Number(e.target.value) })}
              aria-invalid={Boolean(formErrors.harga_jual)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
            />
            {formErrors.harga_jual && <p className="text-xs text-red-600 mt-1">{formErrors.harga_jual}</p>}
          </div>

          <div>
            <label htmlFor="f-status" className="block text-xs font-semibold text-slate-700 mb-1">
              Status Fisik Unit
            </label>
            <select
              id="f-status"
              value={form.status_unit}
              onChange={(e) => setForm({ ...form, status_unit: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="Tersedia">Tersedia</option>
              <option value="Disewa">Disewa</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>

          <div>
            <label htmlFor="f-lokasi" className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi Penempatan Saat Ini
            </label>
            <input
              id="f-lokasi"
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="f-foto" className="block text-xs font-semibold text-slate-700 mb-1">
              Unggah Foto Perangkat (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={form.foto_unit}
                alt="Pratinjau unit"
                className="w-16 h-12 rounded-lg object-cover bg-slate-900 border border-slate-200"
              />
              <input
                id="f-foto"
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="text-xs text-slate-600"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="f-spek" className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi & Spesifikasi Teknis
            </label>
            <textarea
              id="f-spek"
              rows={2}
              value={form.spesifikasi}
              onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Detail & Riwayat Status Unit */}
      <Modal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={detailData?.unit?.nama_unit || 'Detail Unit'}
        subtitle={`Kode: ${detailData?.unit?.kode_unit || ''} • Riwayat Perubahan Status Fisik`}
        maxWidth="max-w-2xl"
      >
        {detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Status Saat Ini</span>
                <div className="mt-1">
                  <StatusBadge status={detailData.unit.status_unit} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Tarif Sewa</span>
                <strong className="text-blue-700 mt-1 block">
                  {formatRupiah(detailData.unit.harga_sewa)}/bln
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">Klien Aktif</span>
                <strong className="text-slate-900 mt-1 block">
                  {detailData.unit.klien || 'Gudang TERA'}
                </strong>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Log Riwayat Status Fisik ({detailData.history.length})
              </h3>
              {detailData.history.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada riwayat perubahan status.</p>
              ) : (
                <ol className="space-y-2.5 border-l-2 border-blue-200 pl-3.5">
                  {detailData.history.map((h) => (
                    <li key={h.id_riwayat} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>{h.status_sebelum}</strong> &rarr;{' '}
                          <StatusBadge status={h.status_sesudah} />
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTimeId(h.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{h.keterangan}</p>
                      <span className="text-[11px] text-slate-400">
                        Lokasi: {h.lokasi} &bull; Oleh: {h.diubah_oleh}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Perangkat dari Inventaris?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Ya, Hapus Unit
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Anda akan menghapus perangkat{' '}
          <strong className="text-slate-900">
            [{deleteTarget?.kode_unit}] {deleteTarget?.nama_unit}
          </strong>{' '}
          beserta riwayat auditnya.
        </p>
      </Modal>
    </div>
  );
}

