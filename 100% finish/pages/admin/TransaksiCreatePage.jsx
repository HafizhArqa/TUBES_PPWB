/**
 * @file TransaksiCreatePage.jsx
 * @author Zakaria - Fitur Kelola Transaksi
 * @description Kalkulator Komersial & Pembuatan Transaksi B2B Multi-Seksi TERA.
 * Menghitung perpajakan B2B: Sewa (PPh 23 2% potongan, One-Time Charge instalasi, denda SLA)
 * vs Jual Lepas (PPN 11% pertambahan, ongkir dinamis wilayah), integrasi pemilihan klien cepat,
 * dan validasi client-side multi-item perangkat.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getBuilderReferenceData,
  createCommercialTransaction,
} from '../../services/transaksiService';
import { createPelangganEntity } from '../../services/pelangganService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import WilayahSelector from '../../components/WilayahSelector';
import { LoadingState, ErrorState } from '../../components/StatusStates';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import {
  formatRupiah,
  todayIsoDate,
  addMonthsToDate,
  diffMonthsBetween,
} from '../../utils/formatters';

export default function TransaksiCreatePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [refData, setRefData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tipe, setTipe] = useState('sewa');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [items, setItems] = useState([]);

  // Sewa specific
  const [durasiBulan, setDurasiBulan] = useState(24);
  const [biayaOtc, setBiayaOtc] = useState(5000000);
  const [slaPenaltyPct, setSlaPenaltyPct] = useState(0);

  // Jual lepas specific
  const [skemaJual, setSkemaJual] = useState('Cash 100%');
  const [biayaPengiriman, setBiayaPengiriman] = useState(2500000);
  const [diskonNominal, setDiskonNominal] = useState(0);

  // Shared commercial fields
  const [idPelanggan, setIdPelanggan] = useState('');
  const [tglMulai, setTglMulai] = useState(() => todayIsoDate());
  const [tglSelesai, setTglSelesai] = useState(() => addMonthsToDate(todayIsoDate(), 24));
  const [statusKontrak, setStatusKontrak] = useState('Aktif');
  const [nomorKontrak, setNomorKontrak] = useState('');
  const [judulProyek, setJudulProyek] = useState('');
  const [lokasiSite, setLokasiSite] = useState('');
  const [picLapangan, setPicLapangan] = useState('');
  const [kontakPic, setKontakPic] = useState('');
  const [catatan, setCatatan] = useState('');
  const [legalChecked, setLegalChecked] = useState(true);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Quick Add Pelanggan Modal
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientForm, setQuickClientForm] = useState({
    nama_perusahaan: '',
    npwp: '',
    pic_nama: '',
    pic_telepon: '',
    pic_email: '',
    alamat_kantor: '',
  });

  const loadRef = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBuilderReferenceData();
      setRefData(res);
      if (res.pelangganList.length > 0) {
        const first = res.pelangganList[0];
        setIdPelanggan(String(first.id_pelanggan));
        setPicLapangan(first.pic_nama);
        setKontakPic(first.pic_telepon);
      }
      if (res.availableUnits.length > 0) {
        const u = res.availableUnits[0];
        setSelectedUnitId(String(u.id_unit));
        setItems([
          {
            rowId: Date.now(),
            id_unit: u.id_unit,
            kode_unit: u.kode_unit,
            nama_unit: u.nama_unit,
            qty: 2,
            harga_sewa: u.harga_sewa,
            harga_jual: u.harga_jual,
          },
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRef();
  }, [loadRef]);

  const handleDurationSelect = (months) => {
    const m = Math.max(1, Number(months) || 12);
    setDurasiBulan(m);
    setTglSelesai(addMonthsToDate(tglMulai, m));
  };

  const handleAddInventoryUnit = () => {
    if (!selectedUnitId || !refData) return;
    const u = refData.units.find((x) => String(x.id_unit) === String(selectedUnitId));
    if (!u) return;
    setItems((prev) => [
      ...prev,
      {
        rowId: `${Date.now()}-${Math.random()}`,
        id_unit: u.id_unit,
        kode_unit: u.kode_unit,
        nama_unit: u.nama_unit,
        qty: 1,
        harga_sewa: u.harga_sewa,
        harga_jual: u.harga_jual,
      },
    ]);
  };

  const handleAddExhibitPackage = (pkg) => {
    setItems((prev) => [
      ...prev,
      {
        rowId: `${Date.now()}-${Math.random()}`,
        id_unit: null,
        kode_unit: pkg.kode,
        nama_unit: pkg.nama,
        qty: 1,
        harga_sewa: pkg.harga_sewa,
        harga_jual: pkg.harga_jual,
      },
    ]);
    if (tipe === 'sewa' && pkg.otc > 0) {
      setBiayaOtc((prev) => prev + pkg.otc);
    }
  };

  const handleSelectClient = (plg) => {
    setIdPelanggan(String(plg.id_pelanggan));
    setPicLapangan(plg.pic_nama);
    setKontakPic(plg.pic_telepon);
  };

  const handleQuickCreateClient = async (e) => {
    e.preventDefault();
    try {
      const created = await createPelangganEntity(quickClientForm, user?.name);
      setRefData((prev) => ({
        ...prev,
        pelangganList: [created, ...(prev?.pelangganList || [])],
      }));
      handleSelectClient(created);
      setQuickClientOpen(false);
      setQuickClientForm({
        nama_perusahaan: '',
        npwp: '',
        pic_nama: '',
        pic_telepon: '',
        pic_email: '',
        alamat_kantor: '',
      });
      showToast(`Mitra ${created.nama_perusahaan} berhasil ditambahkan & dipilih!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Live financial calculations matching PT Utama Telekomindo rules:
  // SEWA: PPh 23 (2%) deduction, OTC, SLA penalty, NO PPN, NO shipping
  // JUAL LEPAS: PPN 11% addition, Dynamic Shipping, Discount, NO PPh 23, NO OTC
  const totalUnitCount = items.reduce((s, it) => s + (Number(it.qty) || 1), 0);
  const pokokBulananSewa = items.reduce(
    (s, it) => s + (Number(it.harga_sewa) || 0) * (Number(it.qty) || 1),
    0
  );
  const potonganSla = Math.round(pokokBulananSewa * (Number(slaPenaltyPct) / 100));
  const rutinBulananNetSla = Math.max(0, pokokBulananSewa - potonganSla);
  const potonganPph23Bulanan = Math.round(rutinBulananNetSla * 0.02);
  const tagihanPertamaSewa = rutinBulananNetSla - potonganPph23Bulanan + (Number(biayaOtc) || 0);
  const grandTotalKontrakSewa = rutinBulananNetSla * durasiBulan + (Number(biayaOtc) || 0);

  const pokokJualLepas = items.reduce(
    (s, it) => s + (Number(it.harga_jual) || 0) * (Number(it.qty) || 1),
    0
  );
  const subtotalJualSetelahDiskon = Math.max(0, pokokJualLepas - (Number(diskonNominal) || 0));
  const ppn11Nominal = Math.round(subtotalJualSetelahDiskon * 0.11);
  const grandTotalJualLepas = subtotalJualSetelahDiskon + ppn11Nominal + (Number(biayaPengiriman) || 0);

  const validate = () => {
    const next = {};
    if (items.length === 0) next.items = 'Pilih minimal 1 perangkat atau paket standar.';
    if (!idPelanggan) next.idPelanggan = 'Pilih mitra korporat penyewa/pembeli.';
    if (!judulProyek.trim()) next.judulProyek = 'Judul proyek kontrak wajib diisi.';
    if (!lokasiSite.trim()) next.lokasiSite = 'Titik lokasi site operasional wajib diisi.';
    if (!picLapangan.trim()) next.picLapangan = 'Nama PIC lapangan wajib diisi.';
    if (!legalChecked) next.legal = 'Setujui pernyataan ketentuan SLA & legalitas.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Periksa kembali kolom wajib pada formulir transaksi.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tipe_transaksi: tipe,
        id_pelanggan: Number(idPelanggan),
        nomor_kontrak: nomorKontrak,
        judul_proyek: judulProyek,
        lokasi_site: lokasiSite,
        tgl_mulai: tglMulai,
        tgl_selesai: tglSelesai,
        durasi_bulan: durasiBulan,
        biaya_otc: tipe === 'sewa' ? biayaOtc : 0,
        biaya_pengiriman: tipe === 'jual_lepas' ? biayaPengiriman : 0,
        nilai_kontrak: tipe === 'sewa' ? grandTotalKontrakSewa : grandTotalJualLepas,
        tagihan_bulanan: rutinBulananNetSla,
        skema_pembayaran: tipe === 'sewa' ? 'Bulanan' : skemaJual,
        status_kontrak: statusKontrak,
        pic_lapangan: picLapangan,
        kontak_pic: kontakPic,
        catatan,
        items: items.map((it) => ({
          id_unit: it.id_unit,
          kode_unit: it.kode_unit,
          nama_unit: it.nama_unit,
          qty: it.qty,
          harga_satuan: tipe === 'sewa' ? it.harga_sewa : it.harga_jual,
        })),
      };

      const created = await createCommercialTransaction(payload, user?.name);
      showToast(`Transaksi ${created.kontrak.nomor_kontrak} berhasil diterbitkan!`, 'success');
      navigate(`/admin/proyek/${created.request.id_request}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Menyiapkan kalkulator transaksi B2B..." rows={4} />;
  if (error || !refData) return <ErrorState message={error} onRetry={loadRef} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Buat Transaksi Komersial B2B Baru</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kalkulator kontrak otomatis untuk Sewa Operasional (PPh 23 2%) dan Pengadaan Jual Lepas (PPN 11%)
          </p>
        </div>
        <Link
          to="/admin/transaksi"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Daftar Transaksi</span>
        </Link>
      </header>

      <form onSubmit={handleSubmit} noValidate className="builder-split-grid">
        {/* KOLOM KIRI: STEP-BY-STEP SECTIONS */}
        <div className="space-y-5">
          {/* 1. TIPE TRANSAKSI */}
          <section className="tera-card p-5 space-y-3">
            <div className="flex items-center">
              <span className="section-number">1</span>
              <h2 className="text-sm font-bold text-slate-900">Pilih Skema Transaksi Komersial</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipe('sewa')}
                className={`choice-card ${tipe === 'sewa' ? 'active' : ''}`}
              >
                <span className="text-xs font-extrabold uppercase text-blue-600">Skema Berlangganan</span>
                <span className="block text-sm font-extrabold text-slate-900 mt-0.5">
                  Sewa / Rental Operasional B2B
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  Dikenakan pemotongan PPh 23 (2%), jaminan SLA 99,5%, biaya OTC awal, bebas PPN & ongkir.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTipe('jual_lepas')}
                className={`choice-card ${tipe === 'jual_lepas' ? 'active' : ''}`}
              >
                <span className="text-xs font-extrabold uppercase text-emerald-600">Pembelian Putus</span>
                <span className="block text-sm font-extrabold text-slate-900 mt-0.5">
                  Pengadaan Jual Lepas (Asset Sale)
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  Dikenakan PPN 11% dan biaya antar barang (logistik dinamis), tanpa potongan PPh 23.
                </span>
              </button>
            </div>
          </section>

          {/* 2. DAFTAR PERANGKAT & PAKET STANDAR */}
          <section className="tera-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <span className="section-number">2</span>
                <h2 className="text-sm font-bold text-slate-900">Rincian Perangkat & Paket Standar (Exhibit C)</h2>
              </div>
            </div>

            {/* Tambah dari Inventaris */}
            <div className="flex flex-wrap gap-2">
              <label htmlFor="sel-inv-unit" className="sr-only">
                Pilih unit dari inventaris
              </label>
              <select
                id="sel-inv-unit"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="flex-1 min-w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
              >
                {refData.units.map((u) => (
                  <option key={u.id_unit} value={u.id_unit}>
                    [{u.kode_unit}] {u.nama_unit} ({u.status_unit}) —{' '}
                    {formatRupiah(tipe === 'sewa' ? u.harga_sewa : u.harga_jual)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddInventoryUnit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                + Tambah Unit
              </button>
            </div>

            {/* Paket Katalog Standar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">
                Pintasan Paket Standar Korporat (Klik untuk menambahkan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {refData.katalogStandar.map((pkg) => (
                  <button
                    key={pkg.kode}
                    type="button"
                    onClick={() => handleAddExhibitPackage(pkg)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    + {pkg.kode}: {pkg.kategori}
                  </button>
                ))}
              </div>
            </div>

            {errors.items && <p className="text-xs text-red-600 font-semibold">{errors.items}</p>}

            {/* Tabel Item Terpilih */}
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>Qty</th>
                    <th>{tipe === 'sewa' ? 'Tarif Sewa / Bln (Rp)' : 'Harga Satuan (Rp)'}</th>
                    <th>Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const price = tipe === 'sewa' ? it.harga_sewa : it.harga_jual;
                    return (
                      <tr key={it.rowId}>
                        <td>
                          <span className="font-mono text-[11px] text-blue-600 font-bold block">
                            {it.kode_unit}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{it.nama_unit}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            aria-label={`Jumlah ${it.nama_unit}`}
                            value={it.qty}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx].qty = Math.max(1, Number(e.target.value) || 1);
                              setItems(next);
                            }}
                            className="w-16 text-center rounded-lg border border-slate-300 py-1 text-xs font-bold"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            aria-label={`Harga ${it.nama_unit}`}
                            value={price}
                            onChange={(e) => {
                              const next = [...items];
                              if (tipe === 'sewa') {
                                next[idx].harga_sewa = Number(e.target.value) || 0;
                              } else {
                                next[idx].harga_jual = Number(e.target.value) || 0;
                              }
                              setItems(next);
                            }}
                            className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                          />
                        </td>
                        <td className="text-xs font-extrabold text-blue-700">
                          {formatRupiah(price * it.qty)}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            aria-label={`Hapus baris ${it.nama_unit}`}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. PARAMETER KOMERSIAL SESUAI TIPE */}
          {tipe === 'sewa' ? (
            <section className="tera-card p-5 space-y-4">
              <div className="flex items-center">
                <span className="section-number">3</span>
                <h2 className="text-sm font-bold text-slate-900">Durasi Kontrak Sewa, OTC & SLA</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {[6, 12, 24, 36, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleDurationSelect(m)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
                      durasiBulan === m
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {m} Bulan ({m >= 12 ? `${m / 12} Thn` : '0.5 Thn'})
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="sw-dur" className="block text-xs font-semibold text-slate-700 mb-1">
                    Durasi Kustom (Bulan)
                  </label>
                  <input
                    id="sw-dur"
                    type="number"
                    min={1}
                    max={120}
                    value={durasiBulan}
                    onChange={(e) => handleDurationSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="sw-otc" className="block text-xs font-semibold text-slate-700 mb-1">
                    Biaya OTC / Instalasi Awal (Rp)
                  </label>
                  <input
                    id="sw-otc"
                    type="number"
                    min={0}
                    value={biayaOtc}
                    onChange={(e) => setBiayaOtc(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="sw-sla" className="block text-xs font-semibold text-slate-700 mb-1">
                    Simulasi Penalti SLA (%)
                  </label>
                  <input
                    id="sw-sla"
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={slaPenaltyPct}
                    onChange={(e) => setSlaPenaltyPct(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="tera-card p-5 space-y-4">
              <div className="flex items-center">
                <span className="section-number">3</span>
                <h2 className="text-sm font-bold text-slate-900">
                  Skema Pembayaran, Diskon & Biaya Antar Barang (Logistik Dinamis)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="jl-skema" className="block text-xs font-semibold text-slate-700 mb-1">
                    Skema Pembayaran
                  </label>
                  <select
                    id="jl-skema"
                    value={skemaJual}
                    onChange={(e) => setSkemaJual(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="Cash 100%">Cash 100% Lunas</option>
                    <option value="Termin 50-30-20">Termin Bertahap 50-30-20</option>
                    <option value="Termin 30 Hari (Net 30)">Termin 30 Hari (Net 30)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="jl-ongkir" className="block text-xs font-semibold text-slate-700 mb-1">
                    Biaya Antar Barang / Kargo (Rp)
                  </label>
                  <input
                    id="jl-ongkir"
                    type="number"
                    min={0}
                    step={50000}
                    value={biayaPengiriman}
                    onChange={(e) => setBiayaPengiriman(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="jl-diskon" className="block text-xs font-semibold text-slate-700 mb-1">
                    Potongan Diskon Khusus (Rp)
                  </label>
                  <input
                    id="jl-diskon"
                    type="number"
                    min={0}
                    value={diskonNominal}
                    onChange={(e) => setDiskonNominal(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-red-600"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 4. MITRA KORPORAT */}
          <section className="tera-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center">
                <span className="section-number">4</span>
                <h2 className="text-sm font-bold text-slate-900">Entitas Mitra Penyewa / Pembeli (B2B)</h2>
              </div>
              <button
                type="button"
                onClick={() => setQuickClientOpen(true)}
                className="px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold"
              >
                + Daftarkan PT Baru Cepat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {refData.pelangganList.map((plg) => {
                const active = String(idPelanggan) === String(plg.id_pelanggan);
                return (
                  <button
                    key={plg.id_pelanggan}
                    type="button"
                    onClick={() => handleSelectClient(plg)}
                    className={`choice-card p-3 ${active ? 'active' : ''}`}
                  >
                    <span className="block text-xs font-extrabold text-slate-900">
                      {plg.nama_perusahaan}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-500">
                      NPWP: {plg.npwp || '—'}
                    </span>
                    <span className="block text-[11px] text-blue-700 mt-1">
                      PIC: {plg.pic_nama} ({plg.pic_telepon})
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. LOKASI SITE, JADWAL & DOKUMEN */}
          <section className="tera-card p-5 space-y-4">
            <div className="flex items-center">
              <span className="section-number">5</span>
              <h2 className="text-sm font-bold text-slate-900">
                Lokasi Site, Jadwal Kontrak & Penanggung Jawab
              </h2>
            </div>

            <WilayahSelector
              onSelectRegion={({ province, city }) => {
                const area = city ? `${city}, ${province}` : province;
                setLokasiSite((prev) =>
                  prev.includes('—') ? `${prev.split('—')[0].trim()} — ${area}` : `Site Utama — ${area}`
                );
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label htmlFor="tr-judul" className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Proyek / Kontrak <span className="text-red-600">*</span>
                </label>
                <input
                  id="tr-judul"
                  type="text"
                  value={judulProyek}
                  onChange={(e) => setJudulProyek(e.target.value)}
                  aria-invalid={Boolean(errors.judulProyek)}
                  placeholder="Contoh: Penyewaan Repeater SLR 5300 & HT Tambang Pit Timur"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
                {errors.judulProyek && <p className="text-xs text-red-600 mt-1">{errors.judulProyek}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="tr-site" className="block text-xs font-semibold text-slate-700 mb-1">
                  Titik Lokasi Site Pemasangan / Pengiriman <span className="text-red-600">*</span>
                </label>
                <input
                  id="tr-site"
                  type="text"
                  value={lokasiSite}
                  onChange={(e) => setLokasiSite(e.target.value)}
                  aria-invalid={Boolean(errors.lokasiSite)}
                  placeholder="Contoh: Shelter Tower Bukit Utara — KABUPATEN MUARA ENIM"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
                {errors.lokasiSite && <p className="text-xs text-red-600 mt-1">{errors.lokasiSite}</p>}
              </div>

              <div>
                <label htmlFor="tr-mulai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai Kontrak
                </label>
                <input
                  id="tr-mulai"
                  type="date"
                  value={tglMulai}
                  onChange={(e) => {
                    setTglMulai(e.target.value);
                    setTglSelesai(addMonthsToDate(e.target.value, durasiBulan));
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label htmlFor="tr-selesai" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai Kontrak (Auto-Sync)
                </label>
                <input
                  id="tr-selesai"
                  type="date"
                  value={tglSelesai}
                  onChange={(e) => {
                    setTglSelesai(e.target.value);
                    setDurasiBulan(diffMonthsBetween(tglMulai, e.target.value));
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label htmlFor="tr-pic" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama PIC Lapangan <span className="text-red-600">*</span>
                </label>
                <input
                  id="tr-pic"
                  type="text"
                  value={picLapangan}
                  onChange={(e) => setPicLapangan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label htmlFor="tr-tel" className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak WhatsApp PIC
                </label>
                <input
                  id="tr-tel"
                  type="text"
                  value={kontakPic}
                  onChange={(e) => setKontakPic(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label htmlFor="tr-no" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kontrak Kustom (Opsional)
                </label>
                <input
                  id="tr-no"
                  type="text"
                  value={nomorKontrak}
                  onChange={(e) => setNomorKontrak(e.target.value)}
                  placeholder="Kosongkan untuk nomor otomatis"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="tr-stat" className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Awal Kontrak
                </label>
                <select
                  id="tr-stat"
                  value={statusKontrak}
                  onChange={(e) => setStatusKontrak(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="Aktif">Aktif (Langsung Operasional)</option>
                  <option value="Menunggu">Menunggu (Fase Instalasi)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="tr-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Klausul Khusus / Perizinan ISR SDPPI
                </label>
                <textarea
                  id="tr-cat"
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={legalChecked}
                onChange={(e) => setLegalChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600"
              />
              <span>
                Saya menyatakan rincian perangkat, perhitungan pajak ({tipe === 'sewa' ? 'PPh 23 2%' : 'PPN 11%'}), dan ketentuan SLA PT Utama Telekomindo telah sesuai.
              </span>
            </label>
          </section>
        </div>

        {/* KOLOM KANAN: STICKY LIVE SUMMARY */}
        <aside className="tera-card p-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Ringkasan Estimasi
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase">
              {tipe === 'sewa' ? 'SEWA B2B' : 'JUAL LEPAS'}
            </span>
          </div>

          {tipe === 'sewa' ? (
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Unit</dt>
                <dd className="font-bold text-slate-900">
                  {items.length} Jenis ({totalUnitCount} Unit)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Durasi Sewa</dt>
                <dd className="font-bold text-slate-900">{durasiBulan} Bulan</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Tarif Pokok Bulanan</dt>
                <dd className="font-semibold">{formatRupiah(pokokBulananSewa)}</dd>
              </div>
              {potonganSla > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Potongan Penalti SLA ({slaPenaltyPct}%)</dt>
                  <dd className="font-bold">-{formatRupiah(potonganSla)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Biaya OTC (1x di Awal)</dt>
                <dd className="font-semibold">{formatRupiah(biayaOtc)}</dd>
              </div>
              <div className="flex justify-between text-red-600 pt-1 border-t border-slate-100">
                <dt>Potongan PPh 23 (Sewa 2%)</dt>
                <dd className="font-bold">-{formatRupiah(potonganPph23Bulanan)} / bln</dd>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <dt className="font-bold text-slate-800">Tagihan Pertama (Nett PPh 23)</dt>
                <dd className="font-extrabold text-blue-700">{formatRupiah(tagihanPertamaSewa)}</dd>
              </div>
            </dl>
          ) : (
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Perangkat</dt>
                <dd className="font-bold text-slate-900">{totalUnitCount} Unit</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Nilai Pokok Perangkat</dt>
                <dd className="font-semibold">{formatRupiah(pokokJualLepas)}</dd>
              </div>
              {diskonNominal > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Potongan Diskon Khusus</dt>
                  <dd className="font-bold">-{formatRupiah(diskonNominal)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <dt className="text-slate-600 font-semibold">Subtotal DPP</dt>
                <dd className="font-bold text-slate-900">{formatRupiah(subtotalJualSetelahDiskon)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">PPN 11%</dt>
                <dd className="font-semibold">{formatRupiah(ppn11Nominal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Biaya Antar Barang (Kargo)</dt>
                <dd className="font-semibold">{formatRupiah(biayaPengiriman)}</dd>
              </div>
            </dl>
          )}

          <div className="p-4 rounded-2xl bg-tera-navy text-white text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-sky-300 font-bold">
              {tipe === 'sewa'
                ? `Total Nilai Kontrak (${durasiBulan} Bulan)`
                : 'Total Tagihan Pengadaan (Incl. PPN & Ongkir)'}
            </span>
            <p className="text-2xl font-extrabold">
              {formatRupiah(tipe === 'sewa' ? grandTotalKontrakSewa : grandTotalJualLepas)}
            </p>
          </div>

          <div className="space-y-2 no-print">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-md"
            >
              {submitting
                ? 'Menerbitkan Kontrak...'
                : tipe === 'sewa'
                ? 'Terbitkan Kontrak Sewa Sekarang'
                : 'Terbitkan Transaksi Jual Lepas'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <Icon name="printer" size={15} />
              <span>Cetak Estimasi Penawaran (PDF)</span>
            </button>
          </div>
        </aside>
      </form>

      {/* Modal Quick Add Pelanggan */}
      <Modal
        open={quickClientOpen}
        onClose={() => setQuickClientOpen(false)}
        title="Daftarkan Mitra Korporat Baru"
        subtitle="Entitas langsung terpilih otomatis tanpa menghilangkan isian transaksi."
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setQuickClientOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              form="quick-client-form"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Simpan & Pilih Mitra
            </button>
          </>
        }
      >
        <form id="quick-client-form" onSubmit={handleQuickCreateClient} className="space-y-3">
          <div>
            <label htmlFor="qc-pt" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan (PT/CV) <span className="text-red-600">*</span>
            </label>
            <input
              id="qc-pt"
              type="text"
              required
              value={quickClientForm.nama_perusahaan}
              onChange={(e) =>
                setQuickClientForm({ ...quickClientForm, nama_perusahaan: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qc-pic" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama PIC <span className="text-red-600">*</span>
              </label>
              <input
                id="qc-pic"
                type="text"
                required
                value={quickClientForm.pic_nama}
                onChange={(e) => setQuickClientForm({ ...quickClientForm, pic_nama: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label htmlFor="qc-tel" className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon <span className="text-red-600">*</span>
              </label>
              <input
                id="qc-tel"
                type="tel"
                required
                value={quickClientForm.pic_telepon}
                onChange={(e) =>
                  setQuickClientForm({ ...quickClientForm, pic_telepon: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label htmlFor="qc-npwp" className="block text-xs font-semibold text-slate-700 mb-1">
              NPWP
            </label>
            <input
              id="qc-npwp"
              type="text"
              value={quickClientForm.npwp}
              onChange={(e) => setQuickClientForm({ ...quickClientForm, npwp: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

