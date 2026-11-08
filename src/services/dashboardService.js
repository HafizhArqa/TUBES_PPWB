/**
 * @file dashboardService.js
 * @author Marta Safitri - Fitur Dashboard
 * @description Layanan kalkulasi statistik dan metrik operasional untuk Dashboard Admin.
 */

import { ensureDbLoaded } from './mockDb';

const MONTH_LABELS = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
const MONTH_KEYS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

/**
 * Data Dashboard Eksekutif Admin
 */
export const getAdminDashboardStats = async () => {
  const db = await ensureDbLoaded();

  const totalUnits = (db.units || []).length;
  const unitTersedia = (db.units || []).filter((u) => u.status_unit === 'Tersedia').length;
  const unitDisewa = (db.units || []).filter((u) => u.status_unit === 'Disewa').length;
  const kontrakAktifList = (db.kontrak || []).filter((k) => k.status_kontrak === 'Aktif');
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

  const rentedUnits = (db.units || []).filter((u) => u.status_unit === 'Disewa');
  const recentLogs = (db.activityLogs || []).slice(0, 6);
  const pendingRequestsCount = (db.rentalRequests || []).filter((r) =>
    ['Baru', 'Ditinjau', 'Penawaran'].includes(r.status)
  ).length;

  return {
    kpi: {
      totalUnits,
      unitTersedia,
      unitDisewa,
      utilisasiPersen: totalUnits ? Math.round((unitDisewa / totalUnits) * 100) : 0,
      kontrakAktifCount: kontrakAktifList.length,
      totalNilaiKontrakAktif,
      targetTahunan,
      capaianPersen,
      pendingRequestsCount,
    },
    monthlySeries,
    rentedUnits: rentedUnits.slice(0, 5),
    recentLogs,
  };
};
