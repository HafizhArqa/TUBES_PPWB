import React, { useState, useEffect, useCallback } from 'react';
import { getLaporanPendapatanData } from '../../services/laporanService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import AreaLineChart from '../../components/AreaLineChart';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatCompactRupiah, formatDateId } from '../../utils/formatters';

export default function LaporanPendapatanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLaporanPendapatanData();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) return <LoadingState message="Menyusun laporan pendapatan & arus kas..." rows={4} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadReport} />;

  const { kpi, cashflowSeries, recentPaid } = data;
  const totalPortofolio = Math.max(1, kpi.nilaiSewa + kpi.nilaiJual);
  const pctSewa = Math.round((kpi.nilaiSewa / totalPortofolio) * 100);
  const pctJual = 100 - pctSewa;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Laporan Pendapatan & Realisasi Kas B2B
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi nilai komitmen kontrak, penerimaan kas terverifikasi, dan piutang faktur PT Utama Telekomindo
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm no-print"
        >
          <Icon name="printer" size={16} />
          <span>Cetak Laporan Keuangan</span>
        </button>
      </header>

      {/* 3 Executive KPI Cards */}
      <section className="kpi-grid-3">
        <div className="tera-dark-card p-5 space-y-2">
          <span className="text-xs font-bold uppercase text-sky-300">Total Komitmen Kontrak</span>
          <p className="text-2xl font-extrabold text-white">{formatRupiah(kpi.totalKomitmen)}</p>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            {kpi.persenTarget}% dari target tahunan {formatCompactRupiah(kpi.targetKomitmen)}
          </span>
        </div>

        <div className="tera-card p-5 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Kas Masuk Terverifikasi (Lunas)</span>
          <p className="text-2xl font-extrabold text-emerald-700">{formatRupiah(kpi.kasMasukLunas)}</p>
          <span className="text-[11px] text-amber-700 font-semibold block">
            Piutang aktif berjalan: {formatRupiah(kpi.piutangAktif)}
          </span>
        </div>

        <div className="tera-card p-5 border-l-4 border-l-blue-600 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Penyelesaian Faktur Tagihan</span>
          <p className="text-2xl font-extrabold text-slate-900">
            {kpi.jumlahInvoiceLunas} <small className="text-sm font-medium text-slate-500">/ {kpi.totalInvoice} Invoice</small>
          </p>
          <span className="text-[11px] text-slate-500 block">Telah diverifikasi mutasi bank</span>
        </div>
      </section>

      <div className="dashboard-split-grid">
        <section className="tera-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Realisasi Kas Masuk Bulanan (Jun – Nov 2026)</h2>
          <AreaLineChart
            data={cashflowSeries}
            valueKey="realisasi"
            ariaLabel="Grafik kas masuk bulanan"
          />
        </section>

        <section className="tera-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Komposisi Sumber Komitmen Pendapatan</h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-blue-700">Sewa / Rental Operasional ({pctSewa}%)</span>
                <span className="font-bold">{formatRupiah(kpi.nilaiSewa)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pctSewa}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-emerald-700">Pengadaan Jual Lepas ({pctJual}%)</span>
                <span className="font-bold">{formatRupiah(kpi.nilaiJual)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctJual}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Catatan Akuntansi Pajak:</strong>
            Pendapatan sewa dipotong PPh Pasal 23 sebesar 2% oleh pemberi kerja korporat, sedangkan pengadaan jual lepas memungut PPN 11%.
          </div>
        </section>
      </div>

      {/* Tabel Pembayaran Terkini */}
      <section className="tera-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Jurnal Penerimaan Pembayaran Faktur</h2>
        </div>
        <div className="tera-table-wrap">
          <table className="tera-table">
            <thead>
              <tr>
                <th>Tanggal Bayar</th>
                <th>No. Invoice</th>
                <th>Periode / Keterangan</th>
                <th>Metode & Referensi</th>
                <th>Nominal</th>
                <th>Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {recentPaid.map((p) => (
                <tr key={p.id_detail}>
                  <td className="text-xs font-medium">{formatDateId(p.tanggal_bayar)}</td>
                  <td className="font-mono text-xs font-bold text-blue-700">{p.nomor_invoice}</td>
                  <td className="text-xs text-slate-700">{p.periode_tagihan}</td>
                  <td className="text-xs">
                    <span className="font-semibold block">{p.metode_bayar}</span>
                    <span className="font-mono text-[11px] text-slate-400">{p.referensi_bayar}</span>
                  </td>
                  <td className="text-xs font-extrabold text-slate-900">
                    {formatRupiah(p.jumlah_bayar)}
                  </td>
                  <td>
                    <StatusBadge status={p.status_verifikasi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

