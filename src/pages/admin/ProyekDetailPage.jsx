/**
 * @file ProyekDetailPage.jsx
 * @author Zakaria - Fitur Kelola Transaksi
 * @description Pusat Kendali Proyek B2B TERA (8-Tab Project Control Center).
 * Tab 1: Ringkasan Proyek & Progress Bar, Tab 2: Negosiasi Penawaran & Tender,
 * Tab 3: Berita Acara Instalasi BTS & Lokasi Site, Tab 4: Manajemen Kontrak, Adendum Multi-Unit & Renewal,
 * Tab 5: Terbit Faktur Invoice & Termin, Tab 6: Rekonsiliasi Pembayaran Bank,
 * Tab 7: Repository Dokumen BAST/Legalitas, Tab 8: Decommissioning Unit & Gudang.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  getProyekDetailComplete,
  saveProyekPenawaran,
  saveProyekInstalasi,
  saveOrIssueProyekKontrak,
  addProyekAddendum,
  renewProyekKontrak,
  createProyekInvoiceDraft,
  publishProyekInvoice,
  recordProyekPayment,
  verifyProyekPayment,
  uploadProyekDocument,
  updateQuickProyekStatus,
  decommissionAndCompleteProyek,
} from '../../services/transaksiService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import {
  formatRupiah,
  formatDateId,
  formatDateTimeId,
  todayIsoDate,
  addMonthsToDate,
  diffMonthsBetween,
} from '../../utils/formatters';

const TABS = [
  { id: 'ringkasan', label: '1. Ringkasan' },
  { id: 'penawaran', label: '2. Penawaran & Lelang' },
  { id: 'instalasi', label: '3. Instalasi Site' },
  { id: 'kontrak', label: '4. Kontrak & Adendum' },
  { id: 'tagihan', label: '5. Faktur Tagihan' },
  { id: 'pembayaran', label: '6. Pembayaran' },
  { id: 'dokumen', label: '7. Dokumen & Log' },
  { id: 'akhir-kontrak', label: '8. Akhir Kontrak' },
];

export default function ProyekDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const activeTab = searchParams.get('tab') || 'ringkasan';
  const setTab = (tabId) => setSearchParams({ tab: tabId });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Forms per tab
  const [penawaranForm, setPenawaranForm] = useState({});
  const [instalasiForm, setInstalasiForm] = useState({});
  const [kontrakForm, setKontrakForm] = useState({});
  const [showDraftInvForm, setShowDraftInvForm] = useState(false);
  const [draftInvForm, setDraftInvForm] = useState({
    tipe: 'Bulanan',
    periode_tagihan: '',
    tgl_jatuh_tempo: addMonthsToDate(todayIsoDate(), 1),
    total_tagihan: 0,
    catatan: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    id_invoice: '',
    tanggal_bayar: todayIsoDate(),
    jumlah_bayar: 0,
    metode_bayar: 'Transfer Bank Mandiri Corporate',
    referensi_bayar: '',
    catatan: '',
  });
  const [docForm, setDocForm] = useState({
    jenis_dokumen: 'Kontrak',
    nama_file: '',
    ukuran_kb: 480,
    keterangan: '',
  });
  const [bongkarForm, setBongkarForm] = useState({
    tanggal_bongkar: todayIsoDate(),
    kondisi_perangkat: 'Normal & Lengkap',
    catatan_bongkar: '',
  });

  // Modals: Quick Status, Addendum, Renewal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [quickStatus, setQuickStatus] = useState({ status: 'Aktif', tahap_proses: '', catatan: '' });

  const [addendumOpen, setAddendumOpen] = useState(false);
  const [addendumMeta, setAddendumMeta] = useState({
    nomor_addendum: '',
    tanggal_efektif: todayIsoDate(),
    judul_addendum: '',
    catatan: '',
  });
  const [addendumRows, setAddendumRows] = useState([
    { id_unit: '', nama_manual: '', qty: 1, harga: 450000 },
  ]);

  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalForm, setRenewalForm] = useState({
    durasi_tahun: 2,
    tgl_mulai: todayIsoDate(),
    tgl_selesai: addMonthsToDate(todayIsoDate(), 24),
    tarif_bulanan_baru: 10000000,
    nilai_kontrak_baru: 240000000,
    catatan: '',
  });

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProyekDetailComplete(id);
      setData(res);

      setPenawaranForm({
        nomor_penawaran_internal: res.penawaran?.nomor_penawaran_internal || '',
        tanggal_penawaran_internal: res.penawaran?.tanggal_penawaran_internal || todayIsoDate(),
        nilai_penawaran_internal: res.penawaran?.nilai_penawaran_internal || res.proyek.estimasi_total,
        catatan_internal: res.penawaran?.catatan_internal || '',
        status_lelang: res.penawaran?.status_lelang || 'Menunggu',
        nomor_penawaran_resmi: res.penawaran?.nomor_penawaran_resmi || '',
        tanggal_penawaran_resmi: res.penawaran?.tanggal_penawaran_resmi || todayIsoDate(),
        nilai_penawaran_resmi: res.penawaran?.nilai_penawaran_resmi || res.proyek.estimasi_total,
        tanggal_hasil_lelang: res.penawaran?.tanggal_hasil_lelang || '',
        catatan_lelang: res.penawaran?.catatan_lelang || '',
      });

      setInstalasiForm({
        status_instalasi: res.instalasi?.status_instalasi || 'Belum Dimulai',
        lokasi_instalasi: res.instalasi?.lokasi_instalasi || res.proyek.lokasi_site,
        tanggal_mulai_rencana: res.instalasi?.tanggal_mulai_rencana || todayIsoDate(),
        tanggal_selesai_rencana: res.instalasi?.tanggal_selesai_rencana || todayIsoDate(),
        tanggal_selesai_aktual: res.instalasi?.tanggal_selesai_aktual || '',
        catatan_pekerjaan: res.instalasi?.catatan_pekerjaan || '',
      });

      const defaultMulai = res.kontrak?.tgl_mulai || todayIsoDate();
      const defaultSelesai =
        res.kontrak?.tgl_selesai || addMonthsToDate(defaultMulai, res.proyek.durasi_sewa_bulan || 12);

      setKontrakForm({
        judul_proyek:
          res.kontrak?.judul_proyek || `Penyewaan Sistem Radio ${res.proyek.nama_klien}`,
        lokasi_site: res.kontrak?.lokasi_site || res.proyek.lokasi_site,
        tgl_mulai: defaultMulai,
        tgl_selesai: defaultSelesai,
        durasi_tahun: res.kontrak?.durasi_tahun || Math.max(1, Math.round((res.proyek.durasi_sewa_bulan || 12) / 12)),
        status_kontrak: res.kontrak?.status_kontrak || 'Aktif',
        biaya_otc: res.kontrak?.biaya_otc || 0,
        nilai_kontrak:
          res.kontrak?.nilai_kontrak ||
          res.penawaran?.nilai_penawaran_resmi ||
          res.proyek.estimasi_total,
        catatan: res.kontrak?.catatan || '',
      });

      setQuickStatus({
        status: res.proyek.status,
        tahap_proses: res.proyek.tahap_proses || '',
        catatan: res.proyek.catatan_internal || '',
      });

      const unpaidInv = res.invoices.find((i) => i.status_bayar !== 'Lunas' && i.status_bayar !== 'Draft');
      if (unpaidInv) {
        setPaymentForm((prev) => ({
          ...prev,
          id_invoice: String(unpaidInv.id_invoice),
          jumlah_bayar: unpaidInv.sisa_piutang || unpaidInv.total_tagihan,
        }));
      }

      if (res.kontrak) {
        const nextAddNo = `${res.kontrak.nomor_kontrak}/ADD-${String(res.addenda.length + 1).padStart(
          2,
          '0'
        )}`;
        setAddendumMeta({
          nomor_addendum: nextAddNo,
          tanggal_efektif: todayIsoDate(),
          judul_addendum: `Adendum No. ${res.addenda.length + 1} - Penambahan Unit Operasional`,
          catatan: '',
        });

        const baseMonthly = res.proyek.estimasi_biaya_bulanan || 10000000;
        const startRenew = res.kontrak.tgl_selesai || todayIsoDate();
        setRenewalForm({
          durasi_tahun: 2,
          tgl_mulai: startRenew,
          tgl_selesai: addMonthsToDate(startRenew, 24),
          tarif_bulanan_baru: baseMonthly,
          nilai_kontrak_baru: baseMonthly * 24,
          catatan: '',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleSavePenawaran = async (e) => {
    e.preventDefault();
    try {
      await saveProyekPenawaran(id, penawaranForm, user?.name);
      showToast('Data Penawaran & Evaluasi Lelang berhasil disimpan.', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveInstalasi = async (e) => {
    e.preventDefault();
    try {
      await saveProyekInstalasi(id, instalasiForm, user?.name);
      showToast('Progres instalasi lapangan berhasil disimpan.', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveKontrak = async (e) => {
    e.preventDefault();
    try {
      await saveOrIssueProyekKontrak(id, kontrakForm, user?.name);
      showToast('Kontrak resmi proyek berhasil disimpan & diterbitkan!', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateAddendum = async (e) => {
    e.preventDefault();
    try {
      await addProyekAddendum(
        id,
        {
          ...addendumMeta,
          items: addendumRows,
        },
        user?.name
      );
      showToast('Adendum penambahan unit berhasil disahkan!', 'success');
      setAddendumOpen(false);
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateRenewal = async (e) => {
    e.preventDefault();
    try {
      await renewProyekKontrak(id, renewalForm, user?.name);
      showToast('Perpanjangan kontrak (Renewal) berhasil diaktifkan!', 'success');
      setRenewalOpen(false);
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!draftInvForm.periode_tagihan.trim() || Number(draftInvForm.total_tagihan) <= 0) {
      showToast('Periode dan nominal tagihan wajib diisi.', 'error');
      return;
    }
    try {
      await createProyekInvoiceDraft(id, draftInvForm, user?.name);
      showToast('Draft faktur invoice baru berhasil dibuat.', 'success');
      setShowDraftInvForm(false);
      setDraftInvForm({
        tipe: 'Bulanan',
        periode_tagihan: '',
        tgl_jatuh_tempo: addMonthsToDate(todayIsoDate(), 1),
        total_tagihan: 0,
        catatan: '',
      });
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePublishInv = async (idInvoice) => {
    try {
      await publishProyekInvoice(idInvoice, user?.name);
      showToast('Faktur resmi diterbitkan ke portal pelanggan!', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.id_invoice || Number(paymentForm.jumlah_bayar) <= 0) {
      showToast('Pilih faktur dan isi nominal pembayaran yang valid.', 'error');
      return;
    }
    try {
      await recordProyekPayment(id, paymentForm, user?.name);
      showToast('Bukti pembayaran berhasil dicatat! Silakan verifikasi mutasi.', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleVerifyPayment = async (idDetail, decision) => {
    try {
      await verifyProyekPayment(idDetail, decision, user?.name);
      showToast(
        decision === 'Terima' ? 'Pembayaran terverifikasi LUNAS!' : 'Pembayaran ditolak.',
        decision === 'Terima' ? 'success' : 'warning'
      );
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docForm.nama_file.trim()) {
      showToast('Pilih atau ketik nama file dokumen terlebih dahulu.', 'error');
      return;
    }
    try {
      await uploadProyekDocument(id, docForm, user?.name);
      showToast('Dokumen berhasil diunggah ke repository proyek.', 'success');
      setDocForm({ jenis_dokumen: 'Kontrak', nama_file: '', ukuran_kb: 480, keterangan: '' });
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveQuickStatus = async (e) => {
    e.preventDefault();
    try {
      await updateQuickProyekStatus(id, quickStatus, user?.name);
      showToast(`Status proyek diperbarui ke ${quickStatus.status}.`, 'success');
      setStatusModalOpen(false);
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDecommission = async (e) => {
    e.preventDefault();
    try {
      await decommissionAndCompleteProyek(id, bongkarForm, user?.name);
      showToast('Masa sewa selesai! Seluruh unit dikembalikan ke Gudang Pusat.', 'success');
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState message="Memuat Pusat Kendali Proyek B2B (8 Tab)..." rows={5} />;
  if (error || !data) return <ErrorState message={error} onRetry={loadDetail} />;

  const {
    proyek,
    kontrak,
    mainItems,
    addenda,
    invoices,
    allPayments,
    dokumenList,
    activityLogs,
    availableUnits,
    finansial,
  } = data;

  const sisaBulanAddendum = kontrak
    ? diffMonthsBetween(addendumMeta.tanggal_efektif, kontrak.tgl_selesai)
    : 12;
  const tambahanBulananPreview = addendumRows.reduce(
    (s, r) => s + (Number(r.qty) || 1) * (Number(r.harga) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Project Header */}
      <header className="tera-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-blue-700">
              {proyek.kode_request}
            </span>
            <StatusBadge status={proyek.status} />
            {kontrak && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                {kontrak.nomor_kontrak}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {proyek.nama_klien}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lokasi Site: <strong className="text-slate-700">{proyek.lokasi_site}</strong> &bull; PIC:{' '}
            {proyek.pic_nama} ({proyek.pic_telepon})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold"
          >
            Ubah Status Tahapan
          </button>
          <Link
            to="/admin/transaksi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            <Icon name="arrowLeft" size={15} />
            <span>Daftar Transaksi</span>
          </Link>
        </div>
      </header>

      {/* Accessible 8-Tab Navigation */}
      <div
        role="tablist"
        aria-label="Tahapan manajemen proyek B2B"
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {TABS.map((t) => {
          const selected = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selected
                  ? 'bg-tera-navy text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: RINGKASAN FINANSIAL & PROYEK
      ===================================================================== */}
      {activeTab === 'ringkasan' && (
        <section role="tabpanel" className="space-y-6">
          {finansial.perluRenewal && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-amber-950">
                <strong className="block text-sm font-bold">
                  Komitmen Kontrak Telah Selesai / Siap Diperpanjang (Renewal)
                </strong>
                Sisa komitmen berjalan Rp 0 atau masa kontrak berakhir. Lakukan Kontrak Ulang atau Pembongkaran di Tab 8.
              </div>
              <button
                type="button"
                onClick={() => setRenewalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold"
              >
                Kontrak Ulang / Renewal
              </button>
            </div>
          )}

          <div className="kpi-grid-4">
            <div className="tera-card p-4 border-l-4 border-l-blue-600">
              <span className="text-xs font-semibold text-slate-500">Nilai Komitmen Kontrak</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatRupiah(finansial.nilaiKomitmen)}
              </p>
            </div>
            <div className="tera-card p-4 border-l-4 border-l-indigo-500">
              <span className="text-xs font-semibold text-slate-500">Faktur Telah Diterbitkan</span>
              <p className="text-xl font-extrabold text-indigo-700 mt-1">
                {formatRupiah(finansial.totalTertagih)}
              </p>
            </div>
            <div className="tera-card p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-500">Pembayaran Terverifikasi</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {formatRupiah(finansial.totalTerbayarLunas)}
              </p>
            </div>
            <div className="tera-card p-4 border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-500">Sisa Komitmen Berjalan</span>
              <p className="text-xl font-extrabold text-amber-700 mt-1">
                {formatRupiah(finansial.sisaKomitmen)}
              </p>
            </div>
          </div>

          <div className="dashboard-split-grid">
            <div className="tera-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Perangkat Kontrak Utama & Adendum
                </h2>
                <button
                  type="button"
                  onClick={() => setTab('kontrak')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Kelola Unit & Adendum &rarr;
                </button>
              </div>
              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>Perangkat</th>
                      <th>Kode</th>
                      <th>Jml</th>
                      <th>Subtotal / Bln</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainItems.map((it) => (
                      <tr key={it.id_item}>
                        <td className="text-xs font-bold text-slate-900">{it.nama_unit_snapshot}</td>
                        <td className="font-mono text-xs text-slate-500">{it.kode_unit_snapshot}</td>
                        <td className="text-xs font-bold">{it.jumlah}</td>
                        <td className="text-xs font-bold text-blue-700">
                          {formatRupiah(it.subtotal_per_bulan)}
                        </td>
                      </tr>
                    ))}
                    {addenda.flatMap((a) =>
                      a.items.map((it) => (
                        <tr key={it.id_item} className="bg-amber-50/40">
                          <td className="text-xs font-bold text-slate-900">
                            {it.nama_unit_snapshot}{' '}
                            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px] ml-1">
                              {a.nomor_addendum.split('/').pop()}
                            </span>
                          </td>
                          <td className="font-mono text-xs text-slate-500">{it.kode_unit_snapshot}</td>
                          <td className="text-xs font-bold text-emerald-700">+{it.jumlah}</td>
                          <td className="text-xs font-bold text-emerald-700">
                            +{formatRupiah(it.subtotal_per_bulan)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tera-card p-5 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900">Informasi Kontrak & Klien</h2>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tahapan Aktif</span>
                <strong className="text-slate-900 text-right">{proyek.tahap_proses}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Durasi Komitmen</span>
                <strong className="text-slate-900">{proyek.durasi_sewa_bulan} Bulan</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nomor Kontrak</span>
                <strong className="font-mono text-blue-700">{kontrak?.nomor_kontrak || 'Belum Terbit'}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Catatan Pelanggan</span>
                <span className="text-slate-700 max-w-[220px] text-right">
                  {proyek.catatan_pelanggan || '—'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 2: PENAWARAN & LELANG
      ===================================================================== */}
      {activeTab === 'penawaran' && (
        <section role="tabpanel">
          <form onSubmit={handleSavePenawaran} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="tera-card p-5 space-y-3.5">
              <h2 className="text-sm font-bold text-slate-900">
                Kalkulasi Penawaran Internal (Engineering & Margin)
              </h2>
              <div>
                <label htmlFor="pn-int-no" className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Referensi Internal
                </label>
                <input
                  id="pn-int-no"
                  type="text"
                  value={penawaranForm.nomor_penawaran_internal || ''}
                  onChange={(e) =>
                    setPenawaranForm({ ...penawaranForm, nomor_penawaran_internal: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pn-int-tgl" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kalkulasi
                  </label>
                  <input
                    id="pn-int-tgl"
                    type="date"
                    value={penawaranForm.tanggal_penawaran_internal || ''}
                    onChange={(e) =>
                      setPenawaranForm({ ...penawaranForm, tanggal_penawaran_internal: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="pn-int-val" className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimasi Internal (Rp)
                  </label>
                  <input
                    id="pn-int-val"
                    type="number"
                    value={penawaranForm.nilai_penawaran_internal || 0}
                    onChange={(e) =>
                      setPenawaranForm({
                        ...penawaranForm,
                        nilai_penawaran_internal: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pn-int-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tim Komersial Internal
                </label>
                <textarea
                  id="pn-int-cat"
                  rows={3}
                  value={penawaranForm.catatan_internal || ''}
                  onChange={(e) =>
                    setPenawaranForm({ ...penawaranForm, catatan_internal: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="tera-card p-5 space-y-3.5">
              <h2 className="text-sm font-bold text-slate-900">
                Surat Penawaran Resmi & Hasil Evaluasi Tender Klien
              </h2>
              <div>
                <label htmlFor="pn-lelang" className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Hasil Lelang / Evaluasi Tender
                </label>
                <select
                  id="pn-lelang"
                  value={penawaranForm.status_lelang || 'Menunggu'}
                  onChange={(e) =>
                    setPenawaranForm({ ...penawaranForm, status_lelang: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="Menunggu">Menunggu Hasil Evaluasi Klien</option>
                  <option value="Menang">Ditetapkan Sebagai Pemenang (Menang Tender)</option>
                  <option value="Kalah">Tidak Lolos / Kalah Tender</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pn-res-no" className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Surat Penawaran Resmi
                  </label>
                  <input
                    id="pn-res-no"
                    type="text"
                    value={penawaranForm.nomor_penawaran_resmi || ''}
                    onChange={(e) =>
                      setPenawaranForm({ ...penawaranForm, nomor_penawaran_resmi: e.target.value })
                    }
                    placeholder="042/UT/QUO/X/2026"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="pn-res-val" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Resmi Final (Rp)
                  </label>
                  <input
                    id="pn-res-val"
                    type="number"
                    value={penawaranForm.nilai_penawaran_resmi || 0}
                    onChange={(e) =>
                      setPenawaranForm({
                        ...penawaranForm,
                        nilai_penawaran_resmi: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pn-res-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Berita Acara Tender / Nomor PO Klien
                </label>
                <textarea
                  id="pn-res-cat"
                  rows={2}
                  value={penawaranForm.catatan_lelang || ''}
                  onChange={(e) =>
                    setPenawaranForm({ ...penawaranForm, catatan_lelang: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  Simpan Data Penawaran & Lelang
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* =====================================================================
          TAB 3: INSTALASI LAPANGAN
      ===================================================================== */}
      {activeTab === 'instalasi' && (
        <section role="tabpanel" className="dashboard-split-grid">
          <form onSubmit={handleSaveInstalasi} className="tera-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Jadwal & Catatan Teknis Instalasi Lapangan (ATP)
            </h2>

            <div>
              <label htmlFor="ins-stat" className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pekerjaan Instalasi
              </label>
              <select
                id="ins-stat"
                value={instalasiForm.status_instalasi || 'Belum Dimulai'}
                onChange={(e) =>
                  setInstalasiForm({ ...instalasiForm, status_instalasi: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              >
                <option value="Belum Dimulai">Belum Dimulai</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung (Tim di Lokasi Site)</option>
                <option value="Selesai">Selesai (Uji Terima & Commissioning Berhasil)</option>
              </select>
            </div>

            <div>
              <label htmlFor="ins-lok" className="block text-xs font-semibold text-slate-700 mb-1">
                Titik Spesifik Instalasi Site
              </label>
              <input
                id="ins-lok"
                type="text"
                value={instalasiForm.lokasi_instalasi || ''}
                onChange={(e) =>
                  setInstalasiForm({ ...instalasiForm, lokasi_instalasi: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="ins-m" className="block text-xs font-semibold text-slate-700 mb-1">
                  Rencana Mulai
                </label>
                <input
                  id="ins-m"
                  type="date"
                  value={instalasiForm.tanggal_mulai_rencana || ''}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, tanggal_mulai_rencana: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="ins-s" className="block text-xs font-semibold text-slate-700 mb-1">
                  Rencana Selesai
                </label>
                <input
                  id="ins-s"
                  type="date"
                  value={instalasiForm.tanggal_selesai_rencana || ''}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, tanggal_selesai_rencana: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="ins-a" className="block text-xs font-semibold text-slate-700 mb-1">
                  Selesai Aktual
                </label>
                <input
                  id="ins-a"
                  type="date"
                  value={instalasiForm.tanggal_selesai_aktual || ''}
                  onChange={(e) =>
                    setInstalasiForm({ ...instalasiForm, tanggal_selesai_aktual: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ins-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                Laporan Teknis Lapangan (VSWR, Grounding, Test Call)
              </label>
              <textarea
                id="ins-cat"
                rows={3}
                value={instalasiForm.catatan_pekerjaan || ''}
                onChange={(e) =>
                  setInstalasiForm({ ...instalasiForm, catatan_pekerjaan: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Simpan Progres Instalasi
              </button>
            </div>
          </form>

          <aside className="tera-card p-5 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Standar Checklist Commissioning RF</h2>
            <ul className="space-y-2.5 text-slate-700">
              {[
                'Pemeriksaan fisik transceiver, duplexer, dan rectifier backup power',
                'Pengukuran VSWR kabel Heliax (< 1.25) & grounding surge arrester',
                'Pemrograman kanal frekuensi sesuai alokasi izin ISR SDPPI Kominfo',
                'Uji panggil (Test Call) jangkauan radius area tambang / pelabuhan',
                'Penandatanganan Berita Acara Serah Terima (BAST) bersama PIC Klien',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Icon name="check" size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}

      {/* =====================================================================
          TAB 4: KONTRAK SEWA, UNIT & ADENDUM BERJALAN
      ===================================================================== */}
      {activeTab === 'kontrak' && (
        <section role="tabpanel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveKontrak} className="lg:col-span-5 tera-card p-5 space-y-3.5 h-fit">
            <h2 className="text-sm font-bold text-slate-900">Penerbitan / Pembaruan Kontrak Resmi</h2>

            <div>
              <label htmlFor="kt-judul" className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Proyek Kontrak
              </label>
              <input
                id="kt-judul"
                type="text"
                required
                value={kontrakForm.judul_proyek || ''}
                onChange={(e) => setKontrakForm({ ...kontrakForm, judul_proyek: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="kt-m" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  id="kt-m"
                  type="date"
                  required
                  value={kontrakForm.tgl_mulai || ''}
                  onChange={(e) => setKontrakForm({ ...kontrakForm, tgl_mulai: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="kt-s" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  id="kt-s"
                  type="date"
                  required
                  value={kontrakForm.tgl_selesai || ''}
                  onChange={(e) => setKontrakForm({ ...kontrakForm, tgl_selesai: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="kt-otc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Biaya OTC (Rp)
                </label>
                <input
                  id="kt-otc"
                  type="number"
                  value={kontrakForm.biaya_otc || 0}
                  onChange={(e) => setKontrakForm({ ...kontrakForm, biaya_otc: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="kt-nilai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Total Kontrak (Rp)
                </label>
                <input
                  id="kt-nilai"
                  type="number"
                  required
                  value={kontrakForm.nilai_kontrak || 0}
                  onChange={(e) =>
                    setKontrakForm({ ...kontrakForm, nilai_kontrak: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold text-blue-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kt-stat" className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kontrak
              </label>
              <select
                id="kt-stat"
                value={kontrakForm.status_kontrak || 'Aktif'}
                onChange={(e) => setKontrakForm({ ...kontrakForm, status_kontrak: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              >
                <option value="Aktif">Aktif</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Berakhir">Berakhir</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
            >
              {kontrak ? 'Perbarui Kontrak Resmi' : 'Terbitkan Kontrak Resmi Baru'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-5">
            {/* Kontrak Utama */}
            <div className="tera-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Perangkat Kontrak Utama</h3>
                  <span className="text-xs text-slate-500">
                    Nomor: <strong className="font-mono">{kontrak?.nomor_kontrak || '—'}</strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!kontrak}
                    onClick={() => setAddendumOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold"
                  >
                    + Buat Adendum Unit
                  </button>
                  <button
                    type="button"
                    disabled={!kontrak}
                    onClick={() => setRenewalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-950 text-xs font-bold"
                  >
                    Kontrak Ulang
                  </button>
                </div>
              </div>

              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>Perangkat</th>
                      <th>Kode</th>
                      <th>Jml</th>
                      <th>Subtotal / Bln</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainItems.map((it) => (
                      <tr key={it.id_item}>
                        <td className="text-xs font-bold text-slate-900">{it.nama_unit_snapshot}</td>
                        <td className="font-mono text-xs text-slate-500">{it.kode_unit_snapshot}</td>
                        <td className="text-xs font-bold">{it.jumlah}</td>
                        <td className="text-xs font-bold text-blue-700">
                          {formatRupiah(it.subtotal_per_bulan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daftar Adendum */}
            <div className="tera-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Adendum Penambahan Unit di Tengah Kontrak ({addenda.length})
              </h3>
              {addenda.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Belum ada adendum penambahan unit pada kontrak ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {addenda.map((add) => (
                    <div
                      key={add.id_addendum}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-700 block">
                            {add.nomor_addendum}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {add.judul_addendum}
                          </span>
                        </div>
                        <StatusBadge status={add.status_addendum} />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Efektif: {formatDateId(add.tanggal_efektif)} ({add.durasi_bulan} Bulan) &bull;
                        Tambahan: <strong className="text-emerald-700">+{formatRupiah(add.tambahan_bulanan)}/bln</strong> &bull;
                        Nilai Adendum: <strong className="text-slate-900">{formatRupiah(add.total_nilai_addendum)}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 5: FAKTUR TAGIHAN (INVOICES)
      ===================================================================== */}
      {activeTab === 'tagihan' && (
        <section role="tabpanel" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Daftar Faktur Tagihan Proyek ({invoices.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowDraftInvForm((v) => !v)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              {showDraftInvForm ? 'Tutup Formulir' : '+ Buat Draft Invoice Baru'}
            </button>
          </div>

          {showDraftInvForm && (
            <form onSubmit={handleCreateInvoice} className="tera-card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3.5 bg-blue-50/40 border-blue-200">
              <div>
                <label htmlFor="iv-tipe" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Tagihan
                </label>
                <select
                  id="iv-tipe"
                  value={draftInvForm.tipe}
                  onChange={(e) => setDraftInvForm({ ...draftInvForm, tipe: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="Bulanan">Bulanan</option>
                  <option value="OTC">OTC</option>
                  <option value="Termin">Termin</option>
                  <option value="Pelunasan">Pelunasan</option>
                </select>
              </div>
              <div>
                <label htmlFor="iv-per" className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode Tagihan
                </label>
                <input
                  id="iv-per"
                  type="text"
                  required
                  value={draftInvForm.periode_tagihan}
                  onChange={(e) =>
                    setDraftInvForm({ ...draftInvForm, periode_tagihan: e.target.value })
                  }
                  placeholder="Sewa Bulan Ke-7"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="iv-jt" className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo
                </label>
                <input
                  id="iv-jt"
                  type="date"
                  required
                  value={draftInvForm.tgl_jatuh_tempo}
                  onChange={(e) =>
                    setDraftInvForm({ ...draftInvForm, tgl_jatuh_tempo: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="iv-nom" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  id="iv-nom"
                  type="number"
                  required
                  value={draftInvForm.total_tagihan}
                  onChange={(e) =>
                    setDraftInvForm({ ...draftInvForm, total_tagihan: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Simpan Draft Faktur
                </button>
              </div>
            </form>
          )}

          <div className="tera-card overflow-hidden">
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>No. Invoice</th>
                    <th>Tipe & Periode</th>
                    <th>Jatuh Tempo</th>
                    <th>Total Tagihan</th>
                    <th>Terbayar</th>
                    <th>Sisa</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id_invoice}>
                      <td className="font-mono text-xs font-bold text-blue-700">
                        {inv.nomor_invoice}
                      </td>
                      <td className="text-xs">
                        <span className="font-bold text-slate-800 block">{inv.tipe}</span>
                        <span className="text-slate-500">{inv.periode_tagihan}</span>
                      </td>
                      <td className="text-xs">{formatDateId(inv.tgl_jatuh_tempo)}</td>
                      <td className="text-xs font-bold">{formatRupiah(inv.total_tagihan)}</td>
                      <td className="text-xs font-bold text-emerald-700">
                        {formatRupiah(inv.terbayar)}
                      </td>
                      <td className="text-xs font-bold text-amber-700">
                        {formatRupiah(inv.sisa_piutang)}
                      </td>
                      <td>
                        <StatusBadge status={inv.status_bayar} />
                      </td>
                      <td className="text-right space-x-1.5">
                        {inv.status_bayar === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => handlePublishInv(inv.id_invoice)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
                          >
                            Terbitkan
                          </button>
                        )}
                        {inv.status_bayar !== 'Lunas' && inv.status_bayar !== 'Draft' && (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentForm((prev) => ({
                                ...prev,
                                id_invoice: String(inv.id_invoice),
                                jumlah_bayar: inv.sisa_piutang,
                              }));
                              setTab('pembayaran');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
                          >
                            Catat Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 6: PENCATATAN & VERIFIKASI PEMBAYARAN
      ===================================================================== */}
      {activeTab === 'pembayaran' && (
        <section role="tabpanel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleRecordPayment} className="lg:col-span-5 tera-card p-5 space-y-3.5 h-fit">
            <h2 className="text-sm font-bold text-slate-900">Catat Penerimaan Pembayaran Klien</h2>

            <div>
              <label htmlFor="py-inv" className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Faktur Tagihan
              </label>
              <select
                id="py-inv"
                value={paymentForm.id_invoice}
                onChange={(e) => {
                  const chosen = invoices.find((x) => String(x.id_invoice) === e.target.value);
                  setPaymentForm({
                    ...paymentForm,
                    id_invoice: e.target.value,
                    jumlah_bayar: chosen ? chosen.sisa_piutang || chosen.total_tagihan : 0,
                  });
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              >
                <option value="">-- Pilih Faktur --</option>
                {invoices
                  .filter((i) => i.status_bayar !== 'Draft')
                  .map((i) => (
                    <option key={i.id_invoice} value={i.id_invoice}>
                      {i.nomor_invoice} — Sisa {formatRupiah(i.sisa_piutang)} ({i.status_bayar})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="py-tgl" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Transfer
                </label>
                <input
                  id="py-tgl"
                  type="date"
                  value={paymentForm.tanggal_bayar}
                  onChange={(e) => setPaymentForm({ ...paymentForm, tanggal_bayar: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="py-jml" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Diterima (Rp)
                </label>
                <input
                  id="py-jml"
                  type="number"
                  value={paymentForm.jumlah_bayar}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, jumlah_bayar: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="py-ref" className="block text-xs font-semibold text-slate-700 mb-1">
                No. Referensi Mutasi Bank / RTGS
              </label>
              <input
                id="py-ref"
                type="text"
                value={paymentForm.referensi_bayar}
                onChange={(e) => setPaymentForm({ ...paymentForm, referensi_bayar: e.target.value })}
                placeholder="MDR-TRX-..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              Simpan Bukti Pembayaran
            </button>
          </form>

          <div className="lg:col-span-7 tera-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Verifikasi Pembayaran Masuk ({allPayments.length})
              </h2>
            </div>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Invoice & Tanggal</th>
                    <th>Nominal</th>
                    <th>Metode / Ref</th>
                    <th>Status</th>
                    <th className="text-right">Verifikasi Finance</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((p) => (
                    <tr key={p.id_detail}>
                      <td>
                        <span className="font-mono text-xs font-bold text-blue-700 block">
                          {p.nomor_invoice}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateId(p.tanggal_bayar)}
                        </span>
                      </td>
                      <td className="text-xs font-extrabold">{formatRupiah(p.jumlah_bayar)}</td>
                      <td className="text-xs">
                        <span className="block">{p.metode_bayar}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {p.referensi_bayar || '—'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={p.status_verifikasi} />
                      </td>
                      <td className="text-right space-x-1">
                        {p.status_verifikasi === 'Menunggu' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(p.id_detail, 'Terima')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                            >
                              Terima
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(p.id_detail, 'Tolak')}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Oleh: {p.diverifikasi_oleh || 'Finance'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 7: REPOSITORY DOKUMEN & AUDIT LOG
      ===================================================================== */}
      {activeTab === 'dokumen' && (
        <section role="tabpanel" className="dashboard-split-grid">
          <div className="space-y-4">
            <form onSubmit={handleUploadDoc} className="tera-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Unggah Dokumen Proyek Baru</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dk-jenis" className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Dokumen
                  </label>
                  <select
                    id="dk-jenis"
                    value={docForm.jenis_dokumen}
                    onChange={(e) => setDocForm({ ...docForm, jenis_dokumen: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="Penawaran">Surat Penawaran</option>
                    <option value="PO">Purchase Order (PO) Klien</option>
                    <option value="Instalasi">Berita Acara Serah Terima (BAST)</option>
                    <option value="Kontrak">Kontrak Sewa Bertandatangan</option>
                    <option value="Bukti Transfer">Bukti Transfer Pembayaran</option>
                    <option value="Pembongkaran">Berita Acara Pembongkaran</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dk-file" className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih File Dokumen
                  </label>
                  <input
                    id="dk-file"
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setDocForm({
                          ...docForm,
                          nama_file: f.name,
                          ukuran_kb: Math.max(12, Math.round(f.size / 1024)),
                        });
                      }
                    }}
                    className="text-xs text-slate-600"
                  />
                </div>
              </div>
              <input
                type="text"
                aria-label="Keterangan dokumen"
                value={docForm.keterangan}
                onChange={(e) => setDocForm({ ...docForm, keterangan: e.target.value })}
                placeholder="Keterangan singkat dokumen..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Unggah ke Repository
                </button>
              </div>
            </form>

            <div className="tera-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Arsip Dokumen Proyek ({dokumenList.length})
                </h3>
              </div>
              <div className="tera-table-wrap">
                <table className="tera-table">
                  <thead>
                    <tr>
                      <th>Nama File</th>
                      <th>Kategori</th>
                      <th>Ukuran</th>
                      <th>Pengunggah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dokumenList.map((d) => (
                      <tr key={d.id_dokumen}>
                        <td>
                          <span className="text-xs font-bold text-slate-900 block">
                            {d.nama_file}
                          </span>
                          <span className="text-[11px] text-slate-500">{d.keterangan}</span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold">
                            {d.jenis_dokumen}
                          </span>
                        </td>
                        <td className="text-xs">{d.ukuran_kb} KB</td>
                        <td className="text-xs text-slate-600">{d.diunggah_oleh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="tera-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Audit Trail & Log Aktivitas Proyek</h2>
            <ol className="space-y-3 border-l-2 border-blue-200 pl-3.5 max-h-[480px] overflow-y-auto">
              {activityLogs.map((l) => (
                <li key={l.id_log} className="text-xs">
                  <div className="flex justify-between gap-2">
                    <strong className="text-slate-900">{l.aksi}</strong>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTimeId(l.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{l.deskripsi}</p>
                  <span className="text-[11px] text-blue-600">Oleh: {l.user_nama}</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      )}

      {/* =====================================================================
          TAB 8: AKHIR KONTRAK & PEMBONGKARAN SITE
      ===================================================================== */}
      {activeTab === 'akhir-kontrak' && (
        <section role="tabpanel" className="dashboard-split-grid">
          <form onSubmit={handleDecommission} className="tera-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-red-700">
              Penyelesaian Masa Sewa & Pembongkaran Site (Decommissioning)
            </h2>

            {proyek.status === 'Selesai' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                Proyek ini telah diselesaikan dan seluruh unit telah dikembalikan ke Gudang Pusat PT Utama Telekomindo.
              </div>
            )}

            <div>
              <label htmlFor="bg-tgl" className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pelaksanaan Pembongkaran
              </label>
              <input
                id="bg-tgl"
                type="date"
                required
                value={bongkarForm.tanggal_bongkar}
                onChange={(e) =>
                  setBongkarForm({ ...bongkarForm, tanggal_bongkar: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor="bg-kon" className="block text-xs font-semibold text-slate-700 mb-1">
                Kondisi Fisik Perangkat Saat Dikembalikan
              </label>
              <select
                id="bg-kon"
                value={bongkarForm.kondisi_perangkat}
                onChange={(e) =>
                  setBongkarForm({ ...bongkarForm, kondisi_perangkat: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              >
                <option value="Normal & Lengkap">Normal & Komponen Lengkap (&rarr; Tersedia)</option>
                <option value="Perlu Perawatan / Kalibrasi">
                  Perlu Perawatan / Kalibrasi (&rarr; Maintenance)
                </option>
                <option value="Ada Kerusakan Fisik">Ada Kerusakan Fisik (&rarr; Rusak)</option>
              </select>
            </div>

            <div>
              <label htmlFor="bg-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tim Teknis Pembongkaran
              </label>
              <textarea
                id="bg-cat"
                rows={3}
                value={bongkarForm.catatan_bongkar}
                onChange={(e) =>
                  setBongkarForm({ ...bongkarForm, catatan_bongkar: e.target.value })
                }
                placeholder="Dismantle antena, pelepasan kabel feeder, packing unit ke hardcase..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
            >
              Selesaikan Sewa & Kembalikan Unit ke Gudang Pusat
            </button>
          </form>

          <aside className="tera-card p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Dampak Otomasi Sistem</h2>
            <ul className="space-y-2 text-slate-600">
              <li>&bull; Status proyek otomatis diperbarui menjadi <strong>Selesai</strong>.</li>
              <li>&bull; Status kontrak resmi berubah menjadi <strong>Berakhir</strong>.</li>
              <li>
                &bull; Seluruh unit perangkat otomatis dilepas dari klien dan dikembalikan ke{' '}
                <strong>Gudang Pusat Cilandak, Jakarta Selatan</strong> beserta log auditnya.
              </li>
            </ul>
            {kontrak && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <strong className="block text-amber-950">Ingin Memperpanjang Sewa Tanpa Bongkar?</strong>
                <p className="text-amber-900">
                  Gunakan fitur Kontrak Ulang / Renewal untuk memperbarui masa sewa dan nilai kontrak.
                </p>
                <button
                  type="button"
                  onClick={() => setRenewalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  Lakukan Kontrak Ulang / Renewal
                </button>
              </div>
            )}
          </aside>
        </section>
      )}

      {/* =====================================================================
          MODALS: UBAH STATUS, ADENDUM MULTI-ITEM, RENEWAL
      ===================================================================== */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Ubah Status Tahapan Proyek"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="quick-proyek-status-form"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Simpan Status
            </button>
          </>
        }
      >
        <form id="quick-proyek-status-form" onSubmit={handleSaveQuickStatus} className="space-y-3">
          <div>
            <label htmlFor="ps-st" className="block text-xs font-semibold text-slate-700 mb-1">
              Status Proyek
            </label>
            <select
              id="ps-st"
              value={quickStatus.status}
              onChange={(e) => setQuickStatus({ ...quickStatus, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
            >
              {['Baru', 'Ditinjau', 'Penawaran', 'Menang', 'Kalah', 'Instalasi', 'Aktif', 'Selesai', 'Dibatalkan'].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="ps-th" className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Tahap Proses
            </label>
            <input
              id="ps-th"
              type="text"
              value={quickStatus.tahap_proses}
              onChange={(e) => setQuickStatus({ ...quickStatus, tahap_proses: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Adendum */}
      <Modal
        open={addendumOpen}
        onClose={() => setAddendumOpen(false)}
        title="Formulir Adendum Penambahan Unit di Tengah Kontrak"
        subtitle={`Mengacu ke Kontrak Utama: ${kontrak?.nomor_kontrak || ''}`}
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddendumOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="addendum-form"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Terapkan & Sahkan Adendum
            </button>
          </>
        }
      >
        <form id="addendum-form" onSubmit={handleCreateAddendum} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ad-no" className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Adendum Resmi
              </label>
              <input
                id="ad-no"
                type="text"
                required
                value={addendumMeta.nomor_addendum}
                onChange={(e) =>
                  setAddendumMeta({ ...addendumMeta, nomor_addendum: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-blue-700"
              />
            </div>
            <div>
              <label htmlFor="ad-ef" className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai Efektif
              </label>
              <input
                id="ad-ef"
                type="date"
                required
                value={addendumMeta.tanggal_efektif}
                onChange={(e) =>
                  setAddendumMeta({ ...addendumMeta, tanggal_efektif: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ad-jd" className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Adendum
              </label>
              <input
                id="ad-jd"
                type="text"
                required
                value={addendumMeta.judul_addendum}
                onChange={(e) =>
                  setAddendumMeta({ ...addendumMeta, judul_addendum: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Rincian Unit Tambahan</span>
              <button
                type="button"
                onClick={() =>
                  setAddendumRows([...addendumRows, { id_unit: '', nama_manual: '', qty: 1, harga: 450000 }])
                }
                className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
              >
                + Baris Unit
              </button>
            </div>

            {addendumRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <select
                  aria-label="Pilih perangkat adendum"
                  value={row.id_unit}
                  onChange={(e) => {
                    const val = e.target.value;
                    const u = availableUnits.find((x) => String(x.id_unit) === val);
                    const next = [...addendumRows];
                    next[idx].id_unit = val;
                    if (u) next[idx].harga = u.harga_sewa;
                    setAddendumRows(next);
                  }}
                  className="col-span-6 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs"
                >
                  <option value="">-- Pilih dari Inventaris --</option>
                  {availableUnits.map((u) => (
                    <option key={u.id_unit} value={u.id_unit}>
                      [{u.kode_unit}] {u.nama_unit}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  aria-label="Jumlah unit adendum"
                  value={row.qty}
                  onChange={(e) => {
                    const next = [...addendumRows];
                    next[idx].qty = Math.max(1, Number(e.target.value) || 1);
                    setAddendumRows(next);
                  }}
                  className="col-span-2 rounded-xl border border-slate-300 px-2 py-2 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  min={0}
                  aria-label="Tarif bulanan adendum"
                  value={row.harga}
                  onChange={(e) => {
                    const next = [...addendumRows];
                    next[idx].harga = Number(e.target.value) || 0;
                    setAddendumRows(next);
                  }}
                  className="col-span-3 rounded-xl border border-slate-300 px-2 py-2 text-xs font-bold"
                />
                <button
                  type="button"
                  disabled={addendumRows.length <= 1}
                  onClick={() => setAddendumRows(addendumRows.filter((_, i) => i !== idx))}
                  aria-label="Hapus baris"
                  className="col-span-1 text-red-500 disabled:opacity-30"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 text-xs flex flex-wrap justify-between gap-2">
            <span>
              Sisa Masa Kontrak: <strong>{sisaBulanAddendum} Bulan</strong>
            </span>
            <span>
              Tambahan Rutin: <strong className="text-emerald-700">+{formatRupiah(tambahanBulananPreview)}/bln</strong>
            </span>
            <span>
              Total Nilai Adendum:{' '}
              <strong className="text-blue-700">
                {formatRupiah(tambahanBulananPreview * sisaBulanAddendum)}
              </strong>
            </span>
          </div>
        </form>
      </Modal>

      {/* Modal Kontrak Ulang / Renewal */}
      <Modal
        open={renewalOpen}
        onClose={() => setRenewalOpen(false)}
        title="Kontrak Ulang / Perpanjangan Masa Sewa (Renewal)"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRenewalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="renewal-form"
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
            >
              Aktifkan Kontrak Ulang
            </button>
          </>
        }
      >
        <form id="renewal-form" onSubmit={handleCreateRenewal} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rn-dur" className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi Baru (Tahun)
              </label>
              <select
                id="rn-dur"
                value={renewalForm.durasi_tahun}
                onChange={(e) => {
                  const yrs = Number(e.target.value);
                  setRenewalForm((prev) => ({
                    ...prev,
                    durasi_tahun: yrs,
                    tgl_selesai: addMonthsToDate(prev.tgl_mulai, yrs * 12),
                    nilai_kontrak_baru: prev.tarif_bulanan_baru * yrs * 12,
                  }));
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    {y} Tahun ({y * 12} Bulan)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rn-trf" className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif Bulanan Baru (Rp)
              </label>
              <input
                id="rn-trf"
                type="number"
                value={renewalForm.tarif_bulanan_baru}
                onChange={(e) => {
                  const trf = Number(e.target.value) || 0;
                  setRenewalForm((prev) => ({
                    ...prev,
                    tarif_bulanan_baru: trf,
                    nilai_kontrak_baru: trf * prev.durasi_tahun * 12,
                  }));
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
            Total Komitmen Periode Baru ({renewalForm.tgl_mulai} s/d {renewalForm.tgl_selesai}):{' '}
            <strong className="text-blue-700 text-sm block mt-1">
              {formatRupiah(renewalForm.nilai_kontrak_baru)}
            </strong>
          </div>
        </form>
      </Modal>
    </div>
  );
}

