import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProyekDetailComplete } from '../../services/transaksiService';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateId, formatDateTimeId } from '../../utils/formatters';

const STEPS = [
  { key: 'Baru', label: 'Permohonan Masuk' },
  { key: 'Penawaran', label: 'Penawaran & Evaluasi' },
  { key: 'Menang', label: 'Pemenang Tender' },
  { key: 'Instalasi', label: 'Instalasi Site' },
  { key: 'Aktif', label: 'Kontrak Aktif' },
];

const resolveStepIndex = (status) => {
  if (status === 'Aktif' || status === 'Selesai') return 4;
  if (status === 'Instalasi') return 3;
  if (status === 'Menang') return 2;
  if (status === 'Penawaran' || status === 'Ditinjau') return 1;
  return 0;
};

export default function PermintaanDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const detail = await getProyekDetailComplete(id);
      setData(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) return <LoadingState message="Memuat detail progres proyek penyewaan..." rows={4} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadDetail} />;

  const { proyek, kontrak, penawaran, instalasi, mainItems, addenda, invoices, activityLogs } = data;
  const activeStep = resolveStepIndex(proyek.status);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold text-blue-600">{proyek.kode_request}</span>
            <StatusBadge status={proyek.status} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{proyek.nama_klien}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{proyek.lokasi_site}</p>
        </div>

        <Link
          to="/pelanggan/permintaan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Kembali ke Daftar</span>
        </Link>
      </header>

      {/* 5-Step Progress Stepper */}
      <section aria-label="Tahapan progres penyewaan" className="tera-card p-6">
        <div className="tera-stepper">
          {STEPS.map((step, idx) => {
            const done = idx <= activeStep;
            return (
              <div key={step.key} className="tera-step-item">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
                    done
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {idx < activeStep ? <Icon name="check" size={16} /> : idx + 1}
                </div>
                <div className="mt-2">
                  <span
                    className={`block text-xs font-bold ${
                      done ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
          Status Terkini: <strong className="text-slate-900">{proyek.tahap_proses}</strong>
        </p>
      </section>

      <div className="dashboard-split-grid">
        <div className="space-y-6">
          {/* Rincian Perangkat */}
          <section className="tera-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">Rincian Unit Perangkat Terdaftar</h2>
            </div>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>Kode</th>
                    <th>Jml</th>
                    <th>Tarif / Bln</th>
                    <th>Subtotal / Bln</th>
                  </tr>
                </thead>
                <tbody>
                  {mainItems.map((it) => (
                    <tr key={it.id_item}>
                      <td className="text-xs font-bold text-slate-900">{it.nama_unit_snapshot}</td>
                      <td className="text-xs font-mono text-slate-500">{it.kode_unit_snapshot}</td>
                      <td className="text-xs font-bold">{it.jumlah}</td>
                      <td className="text-xs">{formatRupiah(it.harga_sewa_snapshot)}</td>
                      <td className="text-xs font-bold text-blue-600">
                        {formatRupiah(it.subtotal_per_bulan)}
                      </td>
                    </tr>
                  ))}
                  {addenda.flatMap((a) =>
                    a.items.map((it) => (
                      <tr key={it.id_item} className="bg-amber-50/40">
                        <td className="text-xs font-bold text-slate-900">
                          {it.nama_unit_snapshot}{' '}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ml-1">
                            Adendum
                          </span>
                        </td>
                        <td className="text-xs font-mono text-slate-500">{it.kode_unit_snapshot}</td>
                        <td className="text-xs font-bold">+{it.jumlah}</td>
                        <td className="text-xs">{formatRupiah(it.harga_sewa_snapshot)}</td>
                        <td className="text-xs font-bold text-emerald-700">
                          +{formatRupiah(it.subtotal_per_bulan)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Daftar Faktur Invoice */}
          <section className="tera-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Faktur Tagihan (Invoices)</h2>
              <span className="text-xs text-slate-500">
                {invoices.filter((i) => i.status_bayar !== 'Draft').length} Faktur Terbit
              </span>
            </div>
            {invoices.filter((i) => i.status_bayar !== 'Draft').length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                Belum ada faktur tagihan yang diterbitkan untuk proyek ini.
              </p>
            ) : (
              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>No. Invoice</th>
                      <th>Periode</th>
                      <th>Jatuh Tempo</th>
                      <th>Nominal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .filter((i) => i.status_bayar !== 'Draft')
                      .map((inv) => (
                        <tr key={inv.id_invoice}>
                          <td className="font-mono text-xs font-bold text-blue-700">{inv.nomor_invoice}</td>
                          <td className="text-xs">{inv.periode_tagihan}</td>
                          <td className="text-xs">{formatDateId(inv.tgl_jatuh_tempo)}</td>
                          <td className="text-xs font-bold">{formatRupiah(inv.total_tagihan)}</td>
                          <td>
                            <StatusBadge status={inv.status_bayar} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Kolom Kanan: Penawaran, Kontrak, Rekening, Log */}
        <aside className="space-y-5">
          {kontrak && (
            <section className="tera-dark-card p-5 space-y-2">
              <span className="text-[11px] uppercase font-bold text-sky-300">Kontrak Sewa Resmi</span>
              <p className="font-mono text-sm font-bold text-white">{kontrak.nomor_kontrak}</p>
              <p className="text-xs text-slate-300">
                Periode: {formatDateId(kontrak.tgl_mulai)} s/d {formatDateId(kontrak.tgl_selesai)}
              </p>
              <p className="text-xl font-extrabold text-emerald-400 pt-1">
                {formatRupiah(kontrak.nilai_kontrak)}
              </p>
            </section>
          )}

          <section className="tera-card p-5 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Penawaran & Instalasi Lapangan</h2>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">No. Penawaran Resmi</span>
              <strong className="font-mono text-slate-900">
                {penawaran?.nomor_penawaran_resmi || 'Menunggu Penerbitan'}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Status Evaluasi Tender</span>
              <StatusBadge status={penawaran?.status_lelang || 'Menunggu'} />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Progres Instalasi Site</span>
              <StatusBadge status={instalasi?.status_instalasi || 'Belum Dimulai'} />
            </div>
          </section>

          <section className="tera-card p-5 bg-blue-50/50 border-blue-200 space-y-2 text-xs">
            <h2 className="text-sm font-bold text-blue-950">Rekening Pembayaran Resmi</h2>
            <p className="text-slate-600">
              Pembayaran faktur sewa B2B ditujukan ke rekening korporat resmi:
            </p>
            <div className="p-3 rounded-xl bg-white border border-blue-200 font-mono">
              <strong className="block text-slate-900">Bank Mandiri Corporate</strong>
              <span className="text-sm font-extrabold text-blue-700">124-00-0988776-5</span>
              <span className="block text-[11px] text-slate-500">a.n. PT Utama Telekomindo</span>
            </div>
          </section>

          <section className="tera-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Riwayat Aktivitas Proyek</h2>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada catatan aktivitas.</p>
            ) : (
              <ol className="space-y-3 border-l-2 border-blue-200 pl-3.5">
                {activityLogs.map((log) => (
                  <li key={log.id_log} className="text-xs">
                    <p className="font-bold text-slate-900">{log.aksi}</p>
                    <p className="text-slate-600 mt-0.5">{log.deskripsi}</p>
                    <span className="text-[11px] text-slate-400">{formatDateTimeId(log.created_at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

