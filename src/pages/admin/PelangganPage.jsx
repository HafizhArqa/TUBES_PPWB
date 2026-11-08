import React, { useState, useEffect, useCallback } from 'react';
import {
  getPelangganDirectory,
  getPelangganDetailById,
  createPelangganEntity,
  updatePelangganEntity,
  deletePelangganEntity,
} from '../../services/pelangganService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatRupiah, getCorporateInitials } from '../../utils/formatters';

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
  const { user } = useAuth();
  const { showToast } = useToast();

  const [list, setList] = useState([]);
  const [summary, setSummary] = useState({ total: 0, aktif: 0, tidakAktif: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [errors, setErrors] = useState({});

  const [detailModal, setDetailModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPelangganDirectory({ search, status: statusFilter });
      setList(res.pelangganList);
      setSummary(res.summary);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_CLIENT);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nama_perusahaan: p.nama_perusahaan,
      npwp: p.npwp || '',
      pic_nama: p.pic_nama,
      pic_jabatan: p.pic_jabatan || '',
      pic_telepon: p.pic_telepon || '',
      pic_email: p.pic_email || '',
      alamat_kantor: p.alamat_kantor || '',
      status_aktif: p.status_aktif || 'Aktif',
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.nama_perusahaan.trim()) next.nama_perusahaan = 'Nama entitas perusahaan wajib diisi.';
    if (!form.pic_nama.trim()) next.pic_nama = 'Nama PIC wajib diisi.';
    if (!form.pic_telepon.trim()) next.pic_telepon = 'Nomor telepon PIC wajib diisi.';
    if (form.pic_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.pic_email)) {
      next.pic_email = 'Format email PIC tidak valid.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        await updatePelangganEntity(editing.id_pelanggan, form, user?.name);
        showToast(`Data mitra ${form.nama_perusahaan} berhasil diperbarui.`, 'success');
      } else {
        await createPelangganEntity(form, user?.name);
        showToast(`Mitra korporat baru ${form.nama_perusahaan} berhasil didaftarkan!`, 'success');
      }
      setFormOpen(false);
      loadDirectory();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openDetail = async (idPelanggan) => {
    try {
      const res = await getPelangganDetailById(idPelanggan);
      setDetailModal(res);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePelangganEntity(deleteTarget.id_pelanggan, user?.name);
      showToast(`Entitas ${deleteTarget.nama_perusahaan} telah dihapus.`, 'info');
      setDeleteTarget(null);
      loadDirectory();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState message="Memuat direktori mitra korporat B2B..." rows={4} />;
  if (error) return <ErrorState message={error} onRetry={loadDirectory} />;

  const pageSize = 8;
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Direktori Mitra Pelanggan Korporat</h1>
          <p className="text-xs text-slate-500 mt-1">
            Database entitas perusahaan tambang, migas, maritim, dan perkebunan mitra B2B PT Utama Telekomindo
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="plus" size={16} />
          <span>Daftarkan PT / Mitra Baru</span>
        </button>
      </header>

      <section className="kpi-grid-3">
        <div className="tera-card p-4 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500">Total Entitas Korporat</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total} Perusahaan</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500">Mitra Berstatus Aktif</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.aktif} Perusahaan</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-slate-400">
          <span className="text-xs font-semibold text-slate-500">Non-Aktif / Arsip</span>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{summary.tidakAktif} Perusahaan</p>
        </div>
      </section>

      <section className="tera-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {['Semua', 'Aktif', 'Tidak Aktif'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" size={15} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Cari nama PT, NPWP, atau PIC"
              placeholder="Cari PT, NPWP, PIC..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <EmptyState icon="building" title="Mitra Korporat Tidak Ditemukan" />
        ) : (
          <>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Entitas Perusahaan</th>
                    <th>PIC Procurement</th>
                    <th>Kontak Resmi</th>
                    <th>Portofolio Kontrak</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr key={p.id_pelanggan}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                            {getCorporateInitials(p.nama_perusahaan)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {p.nama_perusahaan}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              NPWP: {p.npwp || '—'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">
                        <span className="font-bold text-slate-800 block">{p.pic_nama}</span>
                        <span className="text-[11px] text-slate-500">{p.pic_jabatan}</span>
                      </td>
                      <td className="text-xs">
                        <span className="block text-slate-800">{p.pic_telepon}</span>
                        <span className="text-[11px] text-blue-600">{p.pic_email}</span>
                      </td>
                      <td className="text-xs">
                        <span className="font-bold text-slate-900">{p.jumlah_kontrak} Kontrak</span>
                        <span className="block text-[11px] text-emerald-700 font-semibold">
                          {formatRupiah(p.total_nilai_kontrak)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={p.status_aktif} />
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetail(p.id_pelanggan)}
                            aria-label={`Detail ${p.nama_perusahaan}`}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            aria-label={`Edit ${p.nama_perusahaan}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            aria-label={`Hapus ${p.nama_perusahaan}`}
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
              totalItems={list.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Modal Tambah/Edit Pelanggan */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Perbarui Profil Mitra Korporat' : 'Registrasi Mitra Korporat Baru'}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="pelanggan-form"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Simpan Mitra B2B
            </button>
          </>
        }
      >
        <form id="pelanggan-form" onSubmit={handleSave} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label htmlFor="pl-nama" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Resmi Perusahaan (PT / CV) <span className="text-red-600">*</span>
            </label>
            <input
              id="pl-nama"
              type="text"
              value={form.nama_perusahaan}
              onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
              aria-invalid={Boolean(errors.nama_perusahaan)}
              placeholder="PT ..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
            />
            {errors.nama_perusahaan && <p className="text-xs text-red-600 mt-1">{errors.nama_perusahaan}</p>}
          </div>

          <div>
            <label htmlFor="pl-npwp" className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor NPWP
            </label>
            <input
              id="pl-npwp"
              type="text"
              value={form.npwp}
              onChange={(e) => setForm({ ...form, npwp: e.target.value })}
              placeholder="01.xxx.xxx.x-xxx.000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
            />
          </div>

          <div>
            <label htmlFor="pl-status" className="block text-xs font-semibold text-slate-700 mb-1">
              Status Kemitraan
            </label>
            <select
              id="pl-status"
              value={form.status_aktif}
              onChange={(e) => setForm({ ...form, status_aktif: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label htmlFor="pl-pic" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama PIC Procurement <span className="text-red-600">*</span>
            </label>
            <input
              id="pl-pic"
              type="text"
              value={form.pic_nama}
              onChange={(e) => setForm({ ...form, pic_nama: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
            {errors.pic_nama && <p className="text-xs text-red-600 mt-1">{errors.pic_nama}</p>}
          </div>

          <div>
            <label htmlFor="pl-jab" className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan PIC
            </label>
            <input
              id="pl-jab"
              type="text"
              value={form.pic_jabatan}
              onChange={(e) => setForm({ ...form, pic_jabatan: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label htmlFor="pl-tel" className="block text-xs font-semibold text-slate-700 mb-1">
              Telepon / WhatsApp <span className="text-red-600">*</span>
            </label>
            <input
              id="pl-tel"
              type="tel"
              value={form.pic_telepon}
              onChange={(e) => setForm({ ...form, pic_telepon: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
            {errors.pic_telepon && <p className="text-xs text-red-600 mt-1">{errors.pic_telepon}</p>}
          </div>

          <div>
            <label htmlFor="pl-mail" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Korporat
            </label>
            <input
              id="pl-mail"
              type="email"
              value={form.pic_email}
              onChange={(e) => setForm({ ...form, pic_email: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
            {errors.pic_email && <p className="text-xs text-red-600 mt-1">{errors.pic_email}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="pl-alamat" className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Kantor Pusat / Penagihan Faktur
            </label>
            <textarea
              id="pl-alamat"
              rows={2}
              value={form.alamat_kantor}
              onChange={(e) => setForm({ ...form, alamat_kantor: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Detail Pelanggan */}
      <Modal
        open={Boolean(detailModal)}
        onClose={() => setDetailModal(null)}
        title={detailModal?.pelanggan?.nama_perusahaan || 'Detail Mitra'}
        subtitle={`NPWP: ${detailModal?.pelanggan?.npwp || '—'}`}
      >
        {detailModal && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <p>
                <strong>PIC:</strong> {detailModal.pelanggan.pic_nama} ({detailModal.pelanggan.pic_jabatan})
              </p>
              <p>
                <strong>Kontak:</strong> {detailModal.pelanggan.pic_telepon} &bull;{' '}
                {detailModal.pelanggan.pic_email}
              </p>
              <p>
                <strong>Alamat Kantor:</strong> {detailModal.pelanggan.alamat_kantor || '—'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                Daftar Kontrak Terdaftar ({detailModal.kontrakList.length})
              </h3>
              {detailModal.kontrakList.length === 0 ? (
                <p className="text-slate-500">Belum ada kontrak tercatat.</p>
              ) : (
                <ul className="space-y-2">
                  {detailModal.kontrakList.map((k) => (
                    <li
                      key={k.id_kontrak}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-700 block">{k.nomor_kontrak}</span>
                        <span className="text-slate-700">{k.judul_proyek}</span>
                      </div>
                      <div className="text-right">
                        <strong className="block text-slate-900">{formatRupiah(k.nilai_kontrak)}</strong>
                        <StatusBadge status={k.status_kontrak} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Hapus Pelanggan */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Entitas Mitra Korporat?"
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
              onClick={confirmDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Ya, Hapus
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus data mitra{' '}
          <strong className="text-slate-900">{deleteTarget?.nama_perusahaan}</strong>?
        </p>
      </Modal>
    </div>
  );
}

