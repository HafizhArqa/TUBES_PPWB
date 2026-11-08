/**
 * @file TransaksiIndexPage.jsx
 * @author Zakaria - Fitur Kelola Transaksi
 * @description Modul Indeks Manajemen Transaksi B2B TERA.
 * Mendukung filter dua mode (Sewa Korporat & Penjualan Putus), pencarian nomor kontrak/klien,
 * penanganan status lelang/tender, modal edit tanggal kontrak, dan pembatalan proyek.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getTransaksiList,
  updateKontrakRecord,
  deleteKontrakRecord,
  deleteRequestRecord,
} from '../../services/transaksiService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatRupiah, formatCompactRupiah, formatDateId } from '../../utils/formatters';

export default function TransaksiIndexPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tipe, setTipe] = useState('sewa');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editKontrak, setEditKontrak] = useState(null);
  const [deleteKontrakTarget, setDeleteKontrakTarget] = useState(null);
  const [deleteReqTarget, setDeleteReqTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTransaksiList({ tipe, search, status: statusFilter });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tipe, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveEditKontrak = async (e) => {
    e.preventDefault();
    if (!editKontrak) return;
    try {
      await updateKontrakRecord(editKontrak.id_kontrak, editKontrak, user?.name);
      showToast(`Kontrak ${editKontrak.nomor_kontrak} berhasil diperbarui.`, 'success');
      setEditKontrak(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteKontrak = async () => {
    if (!deleteKontrakTarget) return;
    try {
      await deleteKontrakRecord(deleteKontrakTarget.id_kontrak, user?.name);
      showToast('Kontrak berhasil dihapus.', 'info');
      setDeleteKontrakTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteReq = async () => {
    if (!deleteReqTarget) return;
    try {
      await deleteRequestRecord(deleteReqTarget.id_request, user?.name);
      showToast('Permohonan proyek berhasil dihapus.', 'info');
      setDeleteReqTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState message="Memuat portofolio transaksi & proyek B2B..." rows={5} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadData} />;

  const { kontrakList, requestList, kpi } = data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Transaksi & Proyek B2B</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pusat kendali kontrak sewa operasional jangka panjang, tender masuk, dan pengadaan jual lepas
          </p>
        </div>
        <Link
          to="/admin/transaksi/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="plus" size={16} />
          <span>Buat Transaksi Baru</span>
        </Link>
      </header>

      {/* Mode Switch Tabs: Sewa vs Jual Lepas */}
      <div
        role="tablist"
        aria-label="Jenis transaksi komersial"
        className="inline-flex rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tipe === 'sewa'}
          onClick={() => setTipe('sewa')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            tipe === 'sewa' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sewa / Rental B2B (PPh 23)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tipe === 'jual_lepas'}
          onClick={() => setTipe('jual_lepas')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            tipe === 'jual_lepas' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pengadaan Jual Lepas (PPN 11%)
        </button>
      </div>

      {/* KPI Cards */}
      <section className="kpi-grid-4">
        <div className="tera-card p-4 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500">Total Kontrak ({tipe === 'sewa' ? 'Sewa' : 'Jual'})</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalTransaksi}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500">Berstatus Aktif</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{kpi.aktif}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-indigo-500">
          <span className="text-xs font-semibold text-slate-500">Total Unit Terlibat</span>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{kpi.totalUnit} Unit</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500">Akumulasi Nilai Kontrak</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatCompactRupiah(kpi.totalNilai)}</p>
        </div>
      </section>

      {/* Tabel 1: Permohonan Masuk & Pusat Kendali Proyek 8-Tab */}
      <section className="tera-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Proyek & Permohonan Masuk ({requestList.length})
            </h2>
            <p className="text-xs text-slate-500">
              Klik <strong>Kelola Proyek (8 Tab)</strong> untuk mengatur penawaran, lelang, instalasi, kontrak, adendum, tagihan, & pembongkaran
            </p>
          </div>
          <div className="relative min-w-[230px]">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" size={15} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Cari kode proyek, nama PT, atau site"
              placeholder="Cari kode, klien, site..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {requestList.length === 0 ? (
          <EmptyState icon="briefcase" title="Belum Ada Data Proyek" />
        ) : (
          <div className="tera-table-wrap">
            <table className="tera-table">
              <thead>
                <tr>
                  <th>Kode Proyek</th>
                  <th>Klien & Site Operasional</th>
                  <th>Durasi</th>
                  <th>Estimasi Nilai</th>
                  <th>Tahapan Proyek</th>
                  <th className="text-right">Pusat Kendali</th>
                </tr>
              </thead>
              <tbody>
                {requestList.map((r) => (
                  <tr key={r.id_request}>
                    <td>
                      <span className="font-mono text-xs font-bold text-blue-700 block">
                        {r.kode_request}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDateId(r.created_at)}</span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-900 block">{r.nama_klien}</span>
                      <span className="text-[11px] text-slate-500">{r.lokasi_site}</span>
                    </td>
                    <td className="text-xs font-semibold">
                      {r.tipe_transaksi === 'jual_lepas' ? 'Putus' : `${r.durasi_sewa_bulan} Bln`}
                    </td>
                    <td className="text-xs font-bold text-slate-900">
                      {formatRupiah(r.estimasi_total)}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                      <span className="block text-[11px] text-slate-500 mt-0.5 max-w-[210px] truncate">
                        {r.tahap_proses}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/proyek/${r.id_request}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                        >
                          <span>Kelola Proyek</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteReqTarget(r)}
                          aria-label={`Hapus proyek ${r.kode_request}`}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Icon name="trash" size={15} />
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

      {/* Tabel 2: Kontrak Resmi */}
      <section className="tera-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Arsip Kontrak Resmi Terbit ({kontrakList.length})
          </h2>
          <div className="flex gap-1.5">
            {['Semua', 'Aktif', 'Menunggu', 'Berakhir'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {kontrakList.length === 0 ? (
          <EmptyState icon="file" title="Tidak Ada Kontrak Resmi" />
        ) : (
          <div className="tera-table-wrap">
            <table className="tera-table">
              <thead>
                <tr>
                  <th>Nomor Kontrak</th>
                  <th>Judul & Mitra Korporat</th>
                  <th>Periode</th>
                  <th>Unit</th>
                  <th>Nilai Kontrak</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kontrakList.map((k) => (
                  <tr key={k.id_kontrak}>
                    <td className="font-mono text-xs font-bold text-blue-700">{k.nomor_kontrak}</td>
                    <td>
                      <span className="text-xs font-bold text-slate-900 block">{k.judul_proyek}</span>
                      <span className="text-[11px] text-slate-500">
                        {k.nama_perusahaan} &bull; {k.lokasi_site}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">
                      {formatDateId(k.tgl_mulai)} – {formatDateId(k.tgl_selesai)}
                    </td>
                    <td className="text-xs font-bold">{k.unit_terpasang} Unit</td>
                    <td className="text-xs font-extrabold text-slate-900">
                      {formatRupiah(k.nilai_kontrak)}
                    </td>
                    <td>
                      <StatusBadge status={k.status_kontrak} />
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        {k.id_request && (
                          <Link
                            to={`/admin/proyek/${k.id_request}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Buka Detail Proyek"
                          >
                            <Icon name="eye" size={16} />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditKontrak({ ...k })}
                          aria-label={`Edit kontrak ${k.nomor_kontrak}`}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteKontrakTarget(k)}
                          aria-label={`Hapus kontrak ${k.nomor_kontrak}`}
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
        )}
      </section>

      {/* Modal Edit Kontrak */}
      <Modal
        open={Boolean(editKontrak)}
        onClose={() => setEditKontrak(null)}
        title={`Edit Kontrak [${editKontrak?.nomor_kontrak || ''}]`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditKontrak(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-kontrak-form"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Simpan Kontrak
            </button>
          </>
        }
      >
        {editKontrak && (
          <form id="edit-kontrak-form" onSubmit={handleSaveEditKontrak} className="space-y-3.5">
            <div>
              <label htmlFor="ek-judul" className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Proyek Kontrak
              </label>
              <input
                id="ek-judul"
                type="text"
                required
                value={editKontrak.judul_proyek}
                onChange={(e) => setEditKontrak({ ...editKontrak, judul_proyek: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ek-mulai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  id="ek-mulai"
                  type="date"
                  value={editKontrak.tgl_mulai}
                  onChange={(e) => setEditKontrak({ ...editKontrak, tgl_mulai: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="ek-selesai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  id="ek-selesai"
                  type="date"
                  value={editKontrak.tgl_selesai}
                  onChange={(e) => setEditKontrak({ ...editKontrak, tgl_selesai: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ek-nilai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Kontrak (Rp)
                </label>
                <input
                  id="ek-nilai"
                  type="number"
                  value={editKontrak.nilai_kontrak}
                  onChange={(e) =>
                    setEditKontrak({ ...editKontrak, nilai_kontrak: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label htmlFor="ek-status" className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kontrak
                </label>
                <select
                  id="ek-status"
                  value={editKontrak.status_kontrak}
                  onChange={(e) => setEditKontrak({ ...editKontrak, status_kontrak: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Berakhir">Berakhir</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Hapus Kontrak */}
      <Modal
        open={Boolean(deleteKontrakTarget)}
        onClose={() => setDeleteKontrakTarget(null)}
        title="Hapus Data Kontrak?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteKontrakTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDeleteKontrak}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Hapus
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Hapus kontrak <strong>{deleteKontrakTarget?.nomor_kontrak}</strong>?
        </p>
      </Modal>

      {/* Modal Hapus Request */}
      <Modal
        open={Boolean(deleteReqTarget)}
        onClose={() => setDeleteReqTarget(null)}
        title="Hapus Data Permohonan Proyek?"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteReqTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDeleteReq}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Hapus Proyek
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Hapus permohonan <strong>{deleteReqTarget?.kode_request}</strong> ({deleteReqTarget?.nama_klien})?
        </p>
      </Modal>
    </div>
  );
}

