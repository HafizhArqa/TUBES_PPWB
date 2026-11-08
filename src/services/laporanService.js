/**
 * @file laporanService.js
 * @author Marta Safitri - Fitur Dashboard
 * @description Layanan kalkulasi statistik metrik eksekutif, agregasi arus kas sewa vs jual lepas,
 * utilisasi armada unit radio, dan laporan pendapatan tahunan PT Utama Telekomindo.
 */

import { ensureDbLoaded } from './mockDb';

const MONTH_LABELS = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
const MONTH_KEYS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

/**
 * Data Dashboard Eksekutif Admin
 */
export const getAdminDashboardStats = async () => {
  const db = await ensureDbLoaded();

  const totalUnits = db.units.length;
  const unitTersedia = db.units.filter((u) => u.status_unit === 'Tersedia').length;
  const unitDisewa = db.units.filter((u) => u.status_unit === 'Disewa').length;
  const kontrakAktifList = db.kontrak.filter((k) => k.status_kontrak === 'Aktif');
  const totalNilaiKontrakAktif = kontrakAktifList.reduce((s, k) => s + (Number(k.nilai_kontrak) || 0), 0);

  // Hitung arus kas terverifikasi per bulan (Mei - Nov 2026)
  const monthlySeries = MONTH_KEYS.map((ym, idx) => {
    const paidInMonth = (db.pembayaranDetail || [])
      .filter((p) => p.status_verifikasi === 'Terverifikasi' && String(p.tanggal_bayar || '').startsWith(ym))
      .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);

    const invoicedInMonth = (db.invoices || [])
      .filter((inv) => inv.status_bayar !== 'Draft' && String(inv.tgl_terbit || '').startsWith(ym))
      .reduce((s, inv) => s + (Number(inv.total_tagihan) || 0), 0);

    return {
      monthKey: ym,
      label: `${MONTH_LABELS[idx]} 26`,
      realisasi: paidInMonth || (idx === 0 ? 18500000 : 0),
      tagihan: invoicedInMonth || (idx === 0 ? 22000000 : 0),
    };
  });

  const targetTahunan = 1_500_000_000;
  const capaianPersen = Math.min(100, Math.round((totalNilaiKontrakAktif / targetTahunan) * 100));

  const rentedUnits = db.units.filter((u) => u.status_unit === 'Disewa');
  const recentLogs = (db.activityLogs || []).slice(0, 6);
  const pendingRequestsCount = (db.rentalRequests || []).filter((r) =>
    ['Baru', 'Ditinjau', 'Penawaran'].includes(r.status)
  ).length;
  const pendingVerifCount = (db.invoices || []).filter((i) => i.status_bayar === 'Menunggu Verifikasi').length;

  return {
    kpi: {
      totalUnits,
      unitTersedia,
      unitDisewa,
      kontrakAktif: kontrakAktifList.length,
      totalNilaiKontrakAktif,
      targetTahunan,
      capaianPersen,
      pendingRequestsCount,
      pendingVerifCount,
    },
    monthlySeries,
    rentedUnits,
    recentLogs,
  };
};

/**
 * Monitoring Global Angsuran & Faktur Tagihan Invoice
 */
export const getMonitoringAngsuranData = async ({ status = 'Semua', tipe = 'Semua', search = '' } = {}) => {
  const db = await ensureDbLoaded();
  const q = String(search || '').trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  const kontrakMap = new Map((db.kontrak || []).map((k) => [Number(k.id_kontrak), k]));
  const reqMap = new Map((db.rentalRequests || []).map((r) => [Number(r.id_request), r]));
  const pelangganMap = new Map((db.pelanggan || []).map((p) => [Number(p.id_pelanggan), p]));

  const enriched = (db.invoices || []).map((inv) => {
    const kontrak = inv.id_kontrak ? kontrakMap.get(Number(inv.id_kontrak)) : null;
    const req = inv.id_request ? reqMap.get(Number(inv.id_request)) : null;
    const pelanggan = kontrak ? pelangganMap.get(Number(kontrak.id_pelanggan)) : null;

    const payments = (db.pembayaranDetail || []).filter((p) => Number(p.id_invoice) === Number(inv.id_invoice));
    const terbayar = payments
      .filter((p) => p.status_verifikasi === 'Terverifikasi')
      .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);

    const sisa = Math.max(0, (Number(inv.total_tagihan) || 0) - terbayar);
    const isOverdue =
      inv.status_bayar !== 'Lunas' &&
      inv.status_bayar !== 'Draft' &&
      inv.tgl_jatuh_tempo &&
      inv.tgl_jatuh_tempo < today;

    const overdueDays = isOverdue
      ? Math.max(1, Math.floor((new Date(today) - new Date(inv.tgl_jatuh_tempo)) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      ...inv,
      nomor_kontrak: kontrak?.nomor_kontrak || req?.kode_request || '—',
      nama_klien: pelanggan?.nama_perusahaan || req?.nama_klien || 'Mitra B2B',
      terbayar,
      sisa,
      isOverdue,
      overdueDays,
    };
  });

  const summary = {
    totalTagihan: enriched.filter((i) => i.status_bayar !== 'Draft').reduce((s, i) => s + Number(i.total_tagihan), 0),
    totalLunas: enriched.reduce((s, i) => s + i.terbayar, 0),
    menungguPembayaran: enriched
      .filter((i) => i.status_bayar === 'Menunggu Pembayaran' || i.status_bayar === 'Menunggu Verifikasi')
      .reduce((s, i) => s + i.sisa, 0),
    overdueCount: enriched.filter((i) => i.isOverdue).length,
    overdueNominal: enriched.filter((i) => i.isOverdue).reduce((s, i) => s + i.sisa, 0),
  };

  const filtered = enriched
    .filter((i) => {
      if (status === 'Jatuh Tempo' && !i.isOverdue) return false;
      if (status !== 'Semua' && status !== 'Jatuh Tempo' && i.status_bayar !== status) return false;
      if (tipe !== 'Semua' && i.tipe !== tipe) return false;
      if (q) {
        const hay = `${i.nomor_invoice} ${i.nomor_kontrak} ${i.nama_klien} ${i.periode_tagihan || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.id_invoice) - Number(a.id_invoice));

  return { invoices: filtered, summary };
};

/**
 * Laporan Penyewaan & Utilisasi Perangkat
 */
export const getLaporanPenyewaanData = async () => {
  const db = await ensureDbLoaded();
  const categories = ['Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

  const categoryBreakdown = categories.map((kat) => {
    const inCat = db.units.filter((u) => u.kategori === kat);
    const rented = inCat.filter((u) => u.status_unit === 'Disewa').length;
    const pct = inCat.length > 0 ? Math.round((rented / inCat.length) * 100) : 0;
    const potensiBulanan = inCat
      .filter((u) => u.status_unit === 'Disewa')
      .reduce((s, u) => s + (Number(u.harga_sewa) || 0), 0);

    return {
      kategori: kat,
      total: inCat.length,
      disewa: rented,
      tersedia: inCat.filter((u) => u.status_unit === 'Tersedia').length,
      utilisasiPersen: pct,
      potensiBulanan,
    };
  });

  const volumeTrend = [
    { label: 'Jun 26', realisasi: 14 },
    { label: 'Jul 26', realisasi: 22 },
    { label: 'Agu 26', realisasi: 25 },
    { label: 'Sep 26', realisasi: 27 },
    { label: 'Okt 26', realisasi: 31 },
    { label: 'Nov 26', realisasi: 34 },
  ];

  const totalUnits = db.units.length;
  const rentedCount = db.units.filter((u) => u.status_unit === 'Disewa').length;
  const utilizationRate = totalUnits > 0 ? Math.round((rentedCount / totalUnits) * 100) : 0;

  return {
    kpi: {
      totalKontrakSewa: db.kontrak.filter((k) => k.tipe_transaksi === 'sewa').length,
      kontrakSewaAktif: db.kontrak.filter((k) => k.tipe_transaksi === 'sewa' && k.status_kontrak === 'Aktif').length,
      totalUnitInventaris: totalUnits,
      utilisasiPersen: utilizationRate,
    },
    categoryBreakdown,
    volumeTrend,
    unitsTable: db.units,
  };
};

/**
 * Laporan Pendapatan & Kinerja Finansial
 */
export const getLaporanPendapatanData = async () => {
  const db = await ensureDbLoaded();
  const targetKomitmen = 2_000_000_000;
  const totalKomitmen = db.kontrak.reduce((s, k) => s + (Number(k.nilai_kontrak) || 0), 0);

  const kasMasukLunas = (db.pembayaranDetail || [])
    .filter((p) => p.status_verifikasi === 'Terverifikasi')
    .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);

  const totalTagihanTerbit = (db.invoices || [])
    .filter((i) => i.status_bayar !== 'Draft')
    .reduce((s, i) => s + (Number(i.total_tagihan) || 0), 0);

  const piutangAktif = Math.max(0, totalTagihanTerbit - kasMasukLunas);
  const jumlahInvoiceLunas = (db.invoices || []).filter((i) => i.status_bayar === 'Lunas').length;

  const cashflowSeries = MONTH_KEYS.slice(1).map((ym, idx) => {
    const nominal = (db.pembayaranDetail || [])
      .filter((p) => p.status_verifikasi === 'Terverifikasi' && String(p.tanggal_bayar || '').startsWith(ym))
      .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);
    return {
      label: `${MONTH_LABELS[idx + 1]} 26`,
      realisasi: nominal,
    };
  });

  const nilaiSewa = db.kontrak
    .filter((k) => k.tipe_transaksi === 'sewa')
    .reduce((s, k) => s + (Number(k.nilai_kontrak) || 0), 0);
  const nilaiJual = db.kontrak
    .filter((k) => k.tipe_transaksi === 'jual_lepas')
    .reduce((s, k) => s + (Number(k.nilai_kontrak) || 0), 0);

  const recentPaid = (db.pembayaranDetail || [])
    .map((p) => {
      const inv = (db.invoices || []).find((i) => Number(i.id_invoice) === Number(p.id_invoice));
      return {
        ...p,
        nomor_invoice: inv?.nomor_invoice || '—',
        tipe_invoice: inv?.tipe || 'Bulanan',
        periode_tagihan: inv?.periode_tagihan || '—',
      };
    })
    .sort((a, b) => new Date(b.tanggal_bayar) - new Date(a.tanggal_bayar));

  return {
    kpi: {
      totalKomitmen,
      targetKomitmen,
      persenTarget: Math.min(100, Math.round((totalKomitmen / targetKomitmen) * 100)),
      kasMasukLunas,
      piutangAktif,
      jumlahInvoiceLunas,
      totalInvoice: (db.invoices || []).length,
      nilaiSewa,
      nilaiJual,
    },
    cashflowSeries,
    recentPaid,
  };
};

/**
 * Mengambil ringkasan data untuk Dashboard Portal Pelanggan B2B
 * @param {object} user - Informasi sesi user yang sedang login
 */
export const getPelangganDashboardStats = async (user) => {
  const db = await ensureDbLoaded();
  const userId = Number(user?.id) || 2;
  const userEmail = String(user?.email || '').toLowerCase();

  const requests = (db.rentalRequests || [])
    .filter((r) => {
      if (r.id_user && Number(r.id_user) === userId) return true;
      if (r.pic_email && r.pic_email.toLowerCase() === userEmail) return true;
      return true; // Tampilkan pengajuan untuk demo pelanggan B2B
    })
    .sort((a, b) => new Date(b.created_at || b.tanggal_mulai) - new Date(a.created_at || a.tanggal_mulai));

  const totalKontrakAktif = (db.kontrak || []).filter((k) => k.status_kontrak === 'Aktif').length;

  return {
    requests,
    activeContractsCount: totalKontrakAktif,
  };
};

