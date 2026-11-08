import React, { useState, useEffect, useCallback } from 'react';
import { getLaporanPenyewaanData } from '../../services/laporanService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import AreaLineChart from '../../components/AreaLineChart';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah } from '../../utils/formatters';

export default function LaporanPenyewaanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLaporanPenyewaanData();
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

  if (loading) return <LoadingState message="Menyusun laporan penyewaan & utilisasi..." rows={4} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadReport} />;

  const { kpi, categoryBreakdown, volumeTrend, unitsTable } = data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Laporan Penyewaan & Utilisasi Perangkat Radio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi tingkat keterpakaian armada radio Repeater, Base, HT, dan HF SSB PT Utama Telekomindo
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm no-print"
        >
          <Icon name="printer" size={16} />
          <span>Cetak / Ekspor PDF</span>
        </button>
      </header>

      <section className="kpi-grid-4">
        <div className="tera-card p-4 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500">Total Kontrak Sewa</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalKontrakSewa}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500">Kontrak Sewa Aktif</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{kpi.kontrakSewaAktif}</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-indigo-500">
          <span className="text-xs font-semibold text-slate-500">Total Populasi Unit</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalUnitInventaris} Unit</p>
        </div>
        <div className="tera-card p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500">Rasio Utilisasi Armada</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{kpi.utilisasiPersen}%</p>
        </div>
      </section>

      <div className="dashboard-split-grid">
        <section className="tera-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">
            Tren Pertumbuhan Unit Terpasang di Site Klien (2026)
          </h2>
          <AreaLineChart
            data={volumeTrend}
            valueKey="realisasi"
            isCurrency={false}
            unitSuffix=" Unit"
            ariaLabel="Grafik pertumbuhan jumlah unit radio disewa"
          />
        </section>

        <section className="tera-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Distribusi Utilisasi per Kategori</h2>
          <div className="space-y-3.5">
            {categoryBreakdown.map((c) => (
              <div key={c.kategori} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.kategori}</span>
                  <span className="text-slate-500">
                    {c.disewa}/{c.total} Disewa (<strong>{c.utilisasiPersen}%</strong>)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${c.utilisasiPersen}%` }}
                  />
                </div>
                <span className="block text-[11px] text-emerald-700 font-semibold">
                  Pendapatan aktif kategori: {formatRupiah(c.potensiBulanan)} / bulan
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Tabel Detail Performa Unit */}
      <section className="tera-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Rincian Status & Penempatan Seluruh Unit</h2>
        </div>
        <div className="tera-table-wrap">
          <table className="tera-table">
            <thead>
              <tr>
                <th>Kode Unit</th>
                <th>Perangkat</th>
                <th>Kategori</th>
                <th>Tarif Sewa / Bln</th>
                <th>Klien & Lokasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {unitsTable.map((u) => (
                <tr key={u.id_unit}>
                  <td className="font-mono text-xs font-bold text-blue-700">{u.kode_unit}</td>
                  <td className="text-xs font-bold text-slate-900">{u.nama_unit}</td>
                  <td className="text-xs">{u.kategori}</td>
                  <td className="text-xs font-bold">{formatRupiah(u.harga_sewa)}</td>
                  <td className="text-xs text-slate-600">
                    {u.klien ? `${u.klien} — ${u.lokasi}` : u.lokasi}
                  </td>
                  <td>
                    <StatusBadge status={u.status_unit} />
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

