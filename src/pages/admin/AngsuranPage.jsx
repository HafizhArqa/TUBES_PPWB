/**
 * @file AngsuranPage.jsx
 * @author Zakaria - Fitur Kelola Transaksi
 * @description Modul Pemantauan Faktur Tagihan, Piutang Berjalan, dan Deteksi Keterlambatan Jatuh Tempo (Overdue).
 * Menampilkan ringkasan piutang, status pelunasan invoice per termin proyek, dan aksi pencatatan pembayaran.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMonitoringAngsuranData } from '../../services/laporanService';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Icon from '../../components/Icon';
import { formatRupiah, formatCompactRupiah, formatDateId } from '../../utils/formatters';

const STATUS_PILLS = [
  'Semua',
  'Lunas',
  'Menunggu Pembayaran',
  'Menunggu Verifikasi',
  'Jatuh Tempo',
  'Draft',
];

export default function AngsuranPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('Semua');
  const [tipe, setTipe] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMonitoringAngsuranData({ status, tipe, search });
      setData(res);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, tipe, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState message="Memuat monitoring faktur & angsuran B2B..." rows={5} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadData} />;

  const { invoices, summary } = data;
  const pageSize = 8;
  const paged = invoices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Monitoring Angsuran & Faktur Tagihan (Invoices)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemantauan global piutang sewa bulanan, biaya OTC, pelunasan jual lepas, dan keterlambatan jatuh tempo
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 no-print"
        >
          <Icon name="printer" size={16} />
          <span>Cetak Rekap Faktur</span>
        </button>
      </header>

      {/* 4 Financial KPI Cards */}
      <section className="kpi-grid-4">
        <div className="tera-card p-4 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500">Total Tagihan Terbit</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCompactRupiah(summary.totalTagihan)}
          </p>
          <span className="text-[11px] font-mono text-slate-400">{formatRupiah(summary.totalTagihan)}</span>
        </div>

        <div className="tera-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500">Terbayar Lunas (Verified)</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatCompactRupiah(summary.totalLunas)}
          </p>
          <span className="text-[11px] font-mono text-slate-400">{formatRupiah(summary.totalLunas)}</span>
        </div>

        <div className="tera-card p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500">Piutang Menunggu Bayar</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {formatCompactRupiah(summary.menungguPembayaran)}
          </p>
          <span className="text-[11px] font-mono text-slate-400">
            {formatRupiah(summary.menungguPembayaran)}
          </span>
        </div>

        <div className="tera-card p-4 border-l-4 border-l-red-600">
          <span className="text-xs font-semibold text-slate-500">Lewat Jatuh Tempo (Overdue)</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{summary.overdueCount} Faktur</p>
          <span className="text-[11px] font-semibold text-red-600">
            Senilai {formatRupiah(summary.overdueNominal)}
          </span>
        </div>
      </section>

      {/* Filter & Invoice Table */}
      <section className="tera-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_PILLS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  status === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter tipe tagihan"
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="Bulanan">Bulanan</option>
              <option value="OTC">OTC</option>
              <option value="Pelunasan">Pelunasan</option>
              <option value="Termin">Termin</option>
            </select>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Cari nomor invoice atau nama klien"
              placeholder="Cari INV/..., klien..."
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <EmptyState icon="receipt" title="Tidak Ada Faktur Tagihan" />
        ) : (
          <>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>No. Invoice</th>
                    <th>Mitra Klien & Periode</th>
                    <th>Tipe</th>
                    <th>Jatuh Tempo</th>
                    <th>Nominal Tagihan</th>
                    <th>Sisa Piutang</th>
                    <th>Status</th>
                    <th className="text-right no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((inv) => (
                    <tr key={inv.id_invoice} className={inv.isOverdue ? 'bg-red-50/40' : ''}>
                      <td>
                        <span className="font-mono text-xs font-bold text-blue-700 block">
                          {inv.nomor_invoice}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{inv.nomor_kontrak}</span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-900 block">{inv.nama_klien}</span>
                        <span className="text-[11px] text-slate-500">{inv.periode_tagihan}</span>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                          {inv.tipe}
                        </span>
                      </td>
                      <td className="text-xs">
                        <span className={inv.isOverdue ? 'font-bold text-red-600' : 'text-slate-700'}>
                          {formatDateId(inv.tgl_jatuh_tempo)}
                        </span>
                        {inv.isOverdue && (
                          <span className="block text-[10px] font-extrabold text-red-600">
                            Terlambat {inv.overdueDays} hari
                          </span>
                        )}
                      </td>
                      <td className="text-xs font-bold text-slate-900">
                        {formatRupiah(inv.total_tagihan)}
                      </td>
                      <td className="text-xs font-bold text-amber-700">{formatRupiah(inv.sisa)}</td>
                      <td>
                        <StatusBadge status={inv.status_bayar} />
                      </td>
                      <td className="text-right no-print">
                        {inv.id_request && (
                          <Link
                            to={`/admin/proyek/${inv.id_request}?tab=tagihan`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold"
                          >
                            <span>Kelola</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalItems={invoices.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

