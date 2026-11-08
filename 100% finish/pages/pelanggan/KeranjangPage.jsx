import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCartItems,
  updateCartItemQty,
  removeCartItem,
  submitCustomerRentalProposal,
} from '../../services/portalPelangganService';
import WilayahSelector from '../../components/WilayahSelector';
import { EmptyState } from '../../components/StatusStates';
import Icon from '../../components/Icon';
import { formatRupiah } from '../../utils/formatters';

export default function KeranjangPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    nama_klien: user?.name?.includes('PT') ? user.name : 'PT Bukit Energi Nusantara',
    npwp: '01.842.519.4-304.000',
    pic_nama: user?.name || '',
    pic_telepon: '081284509911',
    pic_email: user?.email || '',
    lokasi_site: '',
    durasi_sewa_bulan: 12,
    catatan_pelanggan: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(getCartItems(user?.id));
  }, [user?.id]);

  const handleQtyChange = (idUnit, qty) => {
    const next = updateCartItemQty(user?.id, idUnit, qty);
    setCart([...next]);
  };

  const handleRemove = (idUnit) => {
    const next = removeCartItem(user?.id, idUnit);
    setCart([...next]);
    showToast('Item dihapus dari keranjang sewa.', 'info');
  };

  const handleRegionPicked = ({ province, city }) => {
    const suffix = city ? `${city}, ${province}` : province;
    setForm((prev) => ({
      ...prev,
      lokasi_site: prev.lokasi_site.split('—')[0].trim()
        ? `${prev.lokasi_site.split('—')[0].trim()} — ${suffix}`
        : `Site Operasional — ${suffix}`,
    }));
  };

  const validate = () => {
    const next = {};
    if (!form.nama_klien.trim()) next.nama_klien = 'Nama perusahaan (PT/CV) wajib diisi.';
    if (!form.pic_nama.trim()) next.pic_nama = 'Nama PIC pengadaan wajib diisi.';
    if (!/^[0-9+ -]{8,20}$/.test(form.pic_telepon.trim())) {
      next.pic_telepon = 'Nomor telepon/WhatsApp PIC tidak valid.';
    }
    if (!form.lokasi_site.trim() || form.lokasi_site.trim().length < 6) {
      next.lokasi_site = 'Titik lokasi site pemasangan wajib diisi lengkap.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await submitCustomerRentalProposal(user, form);
      showToast(`Permohonan sewa ${created.kode_request} berhasil dikirim!`, 'success');
      navigate(`/pelanggan/permintaan/${created.id_request}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const monthlySubtotal = cart.reduce((s, c) => s + (Number(c.harga_sewa) || 0) * (Number(c.qty) || 1), 0);
  const totalProjectEstimate = monthlySubtotal * Number(form.durasi_sewa_bulan || 12);

  if (cart.length === 0) {
    return (
      <div className="tera-card p-6">
        <EmptyState
          icon="cart"
          title="Keranjang Pengajuan Sewa Masih Kosong"
          description="Pilih perangkat Repeater, Base Station, atau Handy Talkie di halaman Katalog terlebih dahulu."
          action={
            <Link
              to="/pelanggan/katalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <Icon name="radio" size={16} />
              <span>Buka Katalog Perangkat</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Keranjang & Pengajuan Proposal Sewa</h1>
        <p className="text-xs text-slate-500 mt-1">
          Periksa daftar perangkat dan lengkapi detail lokasi site operasional untuk mendapatkan penawaran resmi TERA
        </p>
      </header>

      <div className="builder-split-grid">
        {/* Tabel Item Keranjang */}
        <section className="space-y-5">
          <div className="tera-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Perangkat yang Diajukan ({cart.length} Jenis)
              </h2>
              <Link to="/pelanggan/katalog" className="text-xs font-bold text-blue-600 hover:underline">
                + Tambah Unit Lain
              </Link>
            </div>

            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>Tarif / Bln</th>
                    <th>Jumlah</th>
                    <th>Subtotal / Bln</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id_unit}>
                      <td>
                        <div className="font-bold text-slate-900 text-xs">{item.nama_unit}</div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.kode_unit} &bull; {item.kategori}
                        </span>
                      </td>
                      <td className="text-xs font-medium">{formatRupiah(item.harga_sewa)}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          aria-label={`Ubah jumlah ${item.nama_unit}`}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.id_unit, e.target.value)}
                          className="w-16 text-center rounded-lg border border-slate-300 py-1 text-xs font-bold"
                        />
                      </td>
                      <td className="text-xs font-bold text-blue-600">
                        {formatRupiah(item.harga_sewa * item.qty)}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id_unit)}
                          aria-label={`Hapus ${item.nama_unit}`}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulir Data Site & Perusahaan */}
          <form id="checkout-proposal-form" onSubmit={handleSubmit} noValidate className="tera-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Informasi Perusahaan & Lokasi Site</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="ck-pt" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan (PT / CV) <span className="text-red-600">*</span>
                </label>
                <input
                  id="ck-pt"
                  type="text"
                  value={form.nama_klien}
                  onChange={(e) => setForm({ ...form, nama_klien: e.target.value })}
                  aria-invalid={Boolean(errors.nama_klien)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                />
                {errors.nama_klien && <p className="text-xs text-red-600 mt-1">{errors.nama_klien}</p>}
              </div>

              <div>
                <label htmlFor="ck-npwp" className="block text-xs font-semibold text-slate-700 mb-1">
                  NPWP Perusahaan
                </label>
                <input
                  id="ck-npwp"
                  type="text"
                  value={form.npwp}
                  onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                  placeholder="01.xxx.xxx.x-xxx.000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor="ck-pic" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama PIC Pengadaan <span className="text-red-600">*</span>
                </label>
                <input
                  id="ck-pic"
                  type="text"
                  value={form.pic_nama}
                  onChange={(e) => setForm({ ...form, pic_nama: e.target.value })}
                  aria-invalid={Boolean(errors.pic_nama)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                />
                {errors.pic_nama && <p className="text-xs text-red-600 mt-1">{errors.pic_nama}</p>}
              </div>

              <div>
                <label htmlFor="ck-tel" className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / Telepon PIC <span className="text-red-600">*</span>
                </label>
                <input
                  id="ck-tel"
                  type="tel"
                  value={form.pic_telepon}
                  onChange={(e) => setForm({ ...form, pic_telepon: e.target.value })}
                  aria-invalid={Boolean(errors.pic_telepon)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                />
                {errors.pic_telepon && <p className="text-xs text-red-600 mt-1">{errors.pic_telepon}</p>}
              </div>
            </div>

            {/* Integrasi Public API Wilayah Indonesia */}
            <WilayahSelector onSelectRegion={handleRegionPicked} />

            <div>
              <label htmlFor="ck-site" className="block text-xs font-semibold text-slate-700 mb-1">
                Detail Titik Lokasi Site Pemasangan <span className="text-red-600">*</span>
              </label>
              <input
                id="ck-site"
                type="text"
                value={form.lokasi_site}
                onChange={(e) => setForm({ ...form, lokasi_site: e.target.value })}
                aria-invalid={Boolean(errors.lokasi_site)}
                placeholder="Contoh: Tower Bukit Utara Pit 3 — KABUPATEN MUARA ENIM, SUMATERA SELATAN"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium"
              />
              {errors.lokasi_site && <p className="text-xs text-red-600 mt-1">{errors.lokasi_site}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="ck-durasi" className="block text-xs font-semibold text-slate-700 mb-1">
                  Durasi Kontrak Sewa <span className="text-red-600">*</span>
                </label>
                <select
                  id="ck-durasi"
                  value={form.durasi_sewa_bulan}
                  onChange={(e) => setForm({ ...form, durasi_sewa_bulan: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={6}>6 Bulan (Proyek Jangka Menengah)</option>
                  <option value={12}>12 Bulan (1 Tahun Standar)</option>
                  <option value={24}>24 Bulan (2 Tahun Korporat)</option>
                  <option value={36}>36 Bulan (3 Tahun Prioritas)</option>
                  <option value={60}>60 Bulan (5 Tahun Strategis)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ck-note" className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Teknis / Kebutuhan Frekuensi
              </label>
              <textarea
                id="ck-note"
                rows={3}
                value={form.catatan_pelanggan}
                onChange={(e) => setForm({ ...form, catatan_pelanggan: e.target.value })}
                placeholder="Sebutkan alokasi kanal frekuensi, ketinggian tower, atau jadwal target instalasi..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
              />
            </div>
          </form>
        </section>

        {/* Ringkasan Kalkulasi Sewa */}
        <aside className="tera-card p-5 space-y-4 sticky top-24">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Ringkasan Estimasi Proposal
          </h2>
          <dl className="space-y-2.5 text-xs border-b border-slate-200 pb-4">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Unit Diajukan</dt>
              <dd className="font-bold text-slate-900">
                {cart.reduce((s, c) => s + Number(c.qty), 0)} Unit
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Estimasi Sewa Bulanan</dt>
              <dd className="font-bold text-slate-900">{formatRupiah(monthlySubtotal)} / bln</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Durasi Komitmen</dt>
              <dd className="font-bold text-slate-900">{form.durasi_sewa_bulan} Bulan</dd>
            </div>
          </dl>

          <div className="p-4 rounded-xl bg-slate-900 text-white text-center">
            <span className="text-[11px] uppercase tracking-wider text-sky-300 font-semibold">
              Estimasi Nilai Kontrak Proyek
            </span>
            <p className="text-2xl font-extrabold mt-1">{formatRupiah(totalProjectEstimate)}</p>
            <span className="text-[11px] text-slate-400">
              Harga final ditetapkan melalui Surat Penawaran Resmi TERA
            </span>
          </div>

          <button
            type="submit"
            form="checkout-proposal-form"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-md transition-colors"
          >
            {submitting ? 'Mengirim Permohonan...' : 'Ajukan Permohonan Penawaran Sewa'}
          </button>
        </aside>
      </div>
    </div>
  );
}

