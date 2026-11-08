/**
 * @file StatusUnitPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Modul Pemantauan dan Mutasi Cepat Status Unit Radio TERA.
 * Fitur: Toggle tampilan Grid dan Tabel, quick update status (Tersedia, Disewa, Maintenance, Terjual),
 * pencatatan histori perubahan lokasi/klien, dan badge status visual.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getUnitsData,
  getUnitWithHistory,
  updateQuickUnitStatus,
} from '../../services/unitService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatDateTimeId } from '../../utils/formatters';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

export default function StatusUnitPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState({ total: 0, tersedia: 0, disewa: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState('grid');
  const [kategori, setKategori] = useState('Semua');
  const [status, setStatus] = useState('Semua');
  const [search, setSearch] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status_unit: 'Tersedia',
    lokasi: '',
    klien: '',
    keterangan: '',
  });
  const [historyModal, setHistoryModal] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUnitsData({ search, kategori, status });
      setUnits(res.units);
      setSummary(res.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, kategori, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openStatusModal = (u) => {
    setEditTarget(u);
    setStatusForm({
      status_unit: u.status_unit,
      lokasi: u.lokasi || '',
      klien: u.klien || '',
      keterangan: '',
    });
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      await updateQuickUnitStatus(editTarget.id_unit, statusForm, user?.name);
      showToast(`Status [${editTarget.kode_unit}] diperbarui menjadi ${statusForm.status_unit}.`, 'success');
      setEditTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openAuditHistory = async (idUnit) => {
    try {
      const res = await getUnitWithHistory(idUnit);
      setHistoryModal(res);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState message="Memuat pemantauan status fisik unit..." rows={4} />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pemantauan Status Fisik & Lokasi Unit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Lacak posisi perangkat di Gudang Pusat, Site Tambang/Maritim Klien, maupun Workshop Kalibrasi RF
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon name="grid" size={14} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon name="list" size={14} />
            <span>Tabel</span>
          </button>
        </div>
      </header>

      {/* 3 Stat Cards */}
      <section className="kpi-grid-3">
        <div className="tera-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Siap Mobilisasi (Tersedia)</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{summary.tersedia} Unit</p>
          </div>
          <StatusBadge status="Tersedia" />
        </div>
        <div className="tera-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Aktif Terpasang di Klien</span>
            <p className="text-2xl font-extrabold text-blue-700 mt-0.5">{summary.disewa} Unit</p>
          </div>
          <StatusBadge status="Disewa" />
        </div>
        <div className="tera-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Perawatan & Perbaikan RF</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-0.5">{summary.maintenance} Unit</p>
          </div>
          <StatusBadge status="Maintenance" />
        </div>
      </section>

      {/* Filter Bar */}
      <section className="tera-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setKategori(kat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                kategori === kat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter status fisik"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Disewa">Disewa</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Rusak">Rusak</option>
          </select>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari kode unit atau lokasi"
            placeholder="Cari lokasi site / klien..."
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
          />
        </div>
      </section>

      {units.length === 0 ? (
        <div className="tera-card">
          <EmptyState icon="layers" title="Tidak Ada Data Unit" />
        </div>
      ) : viewMode === 'grid' ? (
        <section className="catalog-grid">
          {units.map((u) => (
            <article key={u.id_unit} className="tera-card p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700">{u.kode_unit}</span>
                  <StatusBadge status={u.status_unit} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">{u.nama_unit}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {u.kategori} &bull; {u.frekuensi}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Icon name="pin" size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{u.lokasi}</span>
                  </div>
                  {u.klien && (
                    <div className="text-[11px] font-semibold text-indigo-700 pl-5">
                      Klien: {u.klien}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openStatusModal(u)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold"
                >
                  Ubah Status
                </button>
                <button
                  type="button"
                  onClick={() => openAuditHistory(u.id_unit)}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Riwayat
                </button>
              </div>
            </article>
          ))}

          {/* Dashed Add Unit Card */}
          <Link
            to="/admin/units"
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 p-6 flex flex-col items-center justify-center text-center transition-colors min-h-[200px]"
          >
            <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
              <Icon name="plus" size={20} />
            </span>
            <span className="text-xs font-bold text-slate-800">Tambah Unit Radio Baru</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Buka modul Kelola Inventaris</span>
          </Link>
        </section>
      ) : (
        <section className="tera-card overflow-hidden">
          <div className="tera-table-wrap">
            <table className="tera-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Perangkat</th>
                  <th>Status Fisik</th>
                  <th>Lokasi Saat Ini</th>
                  <th>Klien</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id_unit}>
                    <td className="font-mono text-xs font-bold text-blue-700">{u.kode_unit}</td>
                    <td className="text-xs font-bold text-slate-900">{u.nama_unit}</td>
                    <td>
                      <StatusBadge status={u.status_unit} />
                    </td>
                    <td className="text-xs text-slate-600">{u.lokasi}</td>
                    <td className="text-xs font-semibold text-slate-700">{u.klien || '—'}</td>
                    <td className="text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openStatusModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
                      >
                        Ubah Status
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuditHistory(u.id_unit)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Riwayat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal Ubah Status Cepat */}
      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={`Ubah Status Fisik [${editTarget?.kode_unit || ''}]`}
        subtitle={editTarget?.nama_unit}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="quick-status-form"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Simpan Status & Catat Audit
            </button>
          </>
        }
      >
        <form id="quick-status-form" onSubmit={handleSaveStatus} className="space-y-3.5">
          <div>
            <label htmlFor="qs-status" className="block text-xs font-semibold text-slate-700 mb-1">
              Status Baru
            </label>
            <select
              id="qs-status"
              value={statusForm.status_unit}
              onChange={(e) => setStatusForm({ ...statusForm, status_unit: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
            >
              <option value="Tersedia">Tersedia (Siap di Gudang)</option>
              <option value="Disewa">Disewa (Aktif di Site Klien)</option>
              <option value="Maintenance">Maintenance (Kalibrasi / Perawatan)</option>
              <option value="Rusak">Rusak (Perlu Perbaikan Komponen)</option>
            </select>
          </div>

          <div>
            <label htmlFor="qs-lokasi" className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi Penempatan
            </label>
            <input
              id="qs-lokasi"
              type="text"
              required
              value={statusForm.lokasi}
              onChange={(e) => setStatusForm({ ...statusForm, lokasi: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          {statusForm.status_unit === 'Disewa' && (
            <div>
              <label htmlFor="qs-klien" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Perusahaan Penyewa
              </label>
              <input
                id="qs-klien"
                type="text"
                value={statusForm.klien}
                onChange={(e) => setStatusForm({ ...statusForm, klien: e.target.value })}
                placeholder="PT ..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          )}

          <div>
            <label htmlFor="qs-ket" className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Audit
            </label>
            <textarea
              id="qs-ket"
              rows={2}
              required
              value={statusForm.keterangan}
              onChange={(e) => setStatusForm({ ...statusForm, keterangan: e.target.value })}
              placeholder="Alasan perubahan status unit..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Riwayat Audit */}
      <Modal
        open={Boolean(historyModal)}
        onClose={() => setHistoryModal(null)}
        title={`Riwayat Status [${historyModal?.unit?.kode_unit || ''}]`}
        subtitle={historyModal?.unit?.nama_unit}
      >
        {historyModal && (
          <ol className="space-y-3 border-l-2 border-blue-200 pl-3.5">
            {historyModal.history.map((h) => (
              <li key={h.id_riwayat} className="text-xs">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>{h.status_sebelum}</strong> &rarr; <StatusBadge status={h.status_sesudah} />
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDateTimeId(h.created_at)}</span>
                </div>
                <p className="text-slate-600 mt-1">{h.keterangan}</p>
                <span className="text-[11px] text-slate-400">
                  {h.lokasi} &bull; Petugas: {h.diubah_oleh}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Modal>
    </div>
  );
}

