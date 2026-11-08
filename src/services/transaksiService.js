/**
 * @file transaksiService.js
 * @author Zakaria - Fitur Kelola Transaksi
 * @description Layanan komersial transaksi B2B TERA: kalkulasi otomatis PPh 23 (2%),
 * One-Time Charge (OTC), penyesuaian SLA, PPN 11% jual lepas, penerbitan invoice termin bertahap,
 * adendum multi-item perangkat, perpanjangan kontrak (renewal), dan pelacakan 8-tab proyek.
 */

import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';
import { addMonthsToDate, diffMonthsBetween, todayIsoDate } from '../utils/formatters';

const buildYearMonthStamp = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Daftar Transaksi Sewa & Jual Lepas beserta Permohonan Proyek Masuk
 */
export const getTransaksiList = async ({ tipe = 'sewa', search = '', status = 'Semua' } = {}) => {
  const db = await ensureDbLoaded();
  const q = String(search || '').trim().toLowerCase();

  const pelangganMap = new Map((db.pelanggan || []).map((p) => [Number(p.id_pelanggan), p]));
  const requestByKontrak = new Map(
    (db.rentalRequests || []).filter((r) => r.id_kontrak).map((r) => [Number(r.id_kontrak), r])
  );

  const allKontrakByType = (db.kontrak || [])
    .filter((k) => (k.tipe_transaksi || 'sewa') === tipe)
    .map((k) => {
      const pelanggan = pelangganMap.get(Number(k.id_pelanggan)) || null;
      const linkedReq = requestByKontrak.get(Number(k.id_kontrak)) || null;
      return {
        ...k,
        nama_perusahaan: pelanggan?.nama_perusahaan || 'Mitra Korporat B2B',
        npwp: pelanggan?.npwp || '—',
        id_request: linkedReq?.id_request || null,
        kode_request: linkedReq?.kode_request || null,
      };
    });

  const kpi = {
    totalTransaksi: allKontrakByType.length,
    aktif: allKontrakByType.filter((k) => k.status_kontrak === 'Aktif').length,
    totalUnit: allKontrakByType.reduce((sum, k) => sum + (Number(k.unit_terpasang) || 0), 0),
    totalNilai: allKontrakByType.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0),
  };

  const kontrakList = allKontrakByType
    .filter((k) => {
      if (status && status !== 'Semua' && k.status_kontrak !== status) return false;
      if (q) {
        const hay = `${k.nomor_kontrak} ${k.judul_proyek} ${k.nama_perusahaan} ${k.lokasi_site || ''} ${k.pic_lapangan || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.id_kontrak) - Number(a.id_kontrak));

  const requestList = (db.rentalRequests || [])
    .filter((r) => (r.tipe_transaksi || 'sewa') === tipe)
    .filter((r) => {
      if (!q) return true;
      const hay = `${r.kode_request} ${r.nama_klien} ${r.lokasi_site || ''} ${r.pic_nama || ''} ${r.status}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => Number(b.id_request) - Number(a.id_request));

  return {
    kontrakList,
    requestList,
    kpi,
    pelangganOptions: db.pelanggan || [],
  };
};

/**
 * Data referensi untuk halaman Buat Transaksi Baru
 */
export const getBuilderReferenceData = async () => {
  const db = await ensureDbLoaded();
  return {
    units: db.units || [],
    availableUnits: (db.units || []).filter((u) => u.status_unit === 'Tersedia'),
    katalogStandar: db.katalogStandar || [],
    pelangganList: (db.pelanggan || []).filter((p) => p.status_aktif === 'Aktif'),
  };
};

/**
 * Buat Transaksi Baru (Sewa B2B maupun Jual Lepas)
 */
export const createCommercialTransaction = async (payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const tipe = payload.tipe_transaksi === 'jual_lepas' ? 'jual_lepas' : 'sewa';
  const pelanggan = db.pelanggan.find((p) => Number(p.id_pelanggan) === Number(payload.id_pelanggan));
  if (!pelanggan) {
    throw new Error('Pilih entitas mitra korporat (pelanggan) terlebih dahulu.');
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    throw new Error('Tambahkan minimal 1 perangkat ke daftar transaksi.');
  }

  const stamp = buildYearMonthStamp();
  const nextKontrakId = nextId(db.kontrak, 'id_kontrak');
  const nextReqId = nextId(db.rentalRequests, 'id_request');

  const prefixKontrak = tipe === 'jual_lepas' ? 'TERA/SALE' : 'TERA/KONT';
  const nomorKontrak =
    String(payload.nomor_kontrak || '').trim() ||
    `${prefixKontrak}/${stamp}/${String(nextKontrakId).padStart(4, '0')}`;

  const kodeRequest = `REQ/${stamp}/${String(nextReqId).padStart(4, '0')}`;
  const totalUnit = items.reduce((s, it) => s + (Number(it.qty) || 1), 0);
  const durasiBulan = tipe === 'jual_lepas' ? 1 : Math.max(1, Number(payload.durasi_bulan) || 12);
  const durasiTahun = Math.max(1, Math.ceil(durasiBulan / 12));

  const newKontrak = {
    id_kontrak: nextKontrakId,
    nomor_kontrak: nomorKontrak,
    tipe_transaksi: tipe,
    id_pelanggan: pelanggan.id_pelanggan,
    judul_proyek: String(payload.judul_proyek).trim(),
    lokasi_site: String(payload.lokasi_site || pelanggan.alamat_kantor || '').trim(),
    tgl_mulai: payload.tgl_mulai || todayIsoDate(),
    tgl_selesai: payload.tgl_selesai || addMonthsToDate(payload.tgl_mulai || todayIsoDate(), durasiBulan),
    durasi_tahun: durasiTahun,
    durasi_bulan: durasiBulan,
    unit_terpasang: totalUnit,
    biaya_otc: tipe === 'sewa' ? Number(payload.biaya_otc) || 0 : 0,
    biaya_pengiriman: tipe === 'jual_lepas' ? Number(payload.biaya_pengiriman) || 0 : 0,
    nilai_kontrak: Number(payload.nilai_kontrak) || 0,
    skema_pembayaran: payload.skema_pembayaran || (tipe === 'sewa' ? 'Bulanan' : 'Cash 100%'),
    status_kontrak: payload.status_kontrak || 'Aktif',
    pic_lapangan: String(payload.pic_lapangan || pelanggan.pic_nama).trim(),
    kontak_pic: String(payload.kontak_pic || pelanggan.pic_telepon).trim(),
    catatan: String(payload.catatan || '').trim(),
    created_at: new Date().toISOString(),
  };

  const monthlyRoutine = Number(payload.tagihan_bulanan) || 0;

  const newRequest = {
    id_request: nextReqId,
    kode_request: kodeRequest,
    tipe_transaksi: tipe,
    id_user: null,
    id_pelanggan: pelanggan.id_pelanggan,
    id_kontrak: nextKontrakId,
    nama_klien: pelanggan.nama_perusahaan,
    pic_nama: newKontrak.pic_lapangan,
    pic_telepon: newKontrak.kontak_pic,
    pic_email: pelanggan.pic_email,
    lokasi_site: newKontrak.lokasi_site,
    durasi_sewa_bulan: durasiBulan,
    estimasi_biaya_bulanan: tipe === 'sewa' ? monthlyRoutine : newKontrak.nilai_kontrak,
    estimasi_total: newKontrak.nilai_kontrak,
    status: newKontrak.status_kontrak === 'Aktif' ? 'Aktif' : 'Instalasi',
    tahap_proses:
      tipe === 'jual_lepas'
        ? 'Pengadaan Jual Lepas Diterbitkan'
        : 'Kontrak Resmi Terbit & Unit Terkunci',
    catatan_pelanggan: '',
    catatan_internal: newKontrak.catatan,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.kontrak.unshift(newKontrak);
  db.rentalRequests.unshift(newRequest);

  // Simpan item perangkat & kunci status fisik unit jika berasal dari inventaris
  items.forEach((it) => {
    const newItemId = nextId(db.rentalItems, 'id_item');
    const unitId = it.id_unit ? Number(it.id_unit) : null;
    const qty = Math.max(1, Number(it.qty) || 1);
    const tarif = Number(it.harga_satuan) || 0;

    db.rentalItems.push({
      id_item: newItemId,
      id_request: nextReqId,
      id_addendum: null,
      id_unit: unitId,
      kode_unit_snapshot: it.kode_unit || 'TERA-PKG',
      nama_unit_snapshot: it.nama_unit,
      jumlah: qty,
      harga_sewa_snapshot: tarif,
      subtotal_per_bulan: tarif * qty,
      catatan: it.catatan || (tipe === 'jual_lepas' ? 'Pengadaan Jual Lepas' : 'Kontrak Utama'),
    });

    if (unitId) {
      const uIdx = db.units.findIndex((u) => Number(u.id_unit) === unitId);
      if (uIdx !== -1) {
        const prevStatus = db.units[uIdx].status_unit;
        db.units[uIdx] = {
          ...db.units[uIdx],
          status_unit: 'Disewa',
          lokasi: newKontrak.lokasi_site,
          klien: pelanggan.nama_perusahaan,
          updated_at: new Date().toISOString(),
        };
        db.unitHistory.unshift({
          id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
          id_unit: unitId,
          status_sebelum: prevStatus,
          status_sesudah: 'Disewa',
          lokasi: newKontrak.lokasi_site,
          klien: pelanggan.nama_perusahaan,
          keterangan: `Alokasi kontrak baru ${nomorKontrak}`,
          diubah_oleh: actorName,
          created_at: new Date().toISOString(),
        });
      }
    }
  });

  // Inisialisasi Penawaran & Instalasi Proyek
  db.penawaran.push({
    id_penawaran: nextId(db.penawaran, 'id_penawaran'),
    id_request: nextReqId,
    nomor_penawaran_internal: `INT/QUO/${stamp}/${String(nextReqId).padStart(3, '0')}`,
    tanggal_penawaran_internal: todayIsoDate(),
    nilai_penawaran_internal: newKontrak.nilai_kontrak,
    catatan_internal: 'Dibuat langsung melalui modul Buat Transaksi Komersial.',
    nomor_penawaran_resmi: `${String(nextReqId).padStart(3, '0')}/UT/QUO/${new Date().getFullYear()}`,
    tanggal_penawaran_resmi: todayIsoDate(),
    nilai_penawaran_resmi: newKontrak.nilai_kontrak,
    file_penawaran_resmi: '',
    status_lelang: 'Menang',
    tanggal_hasil_lelang: todayIsoDate(),
    file_hasil_lelang: '',
    catatan_lelang: 'Transaksi langsung B2B disetujui.',
  });

  db.instalasi.push({
    id_instalasi: nextId(db.instalasi, 'id_instalasi'),
    id_request: nextReqId,
    lokasi_instalasi: newKontrak.lokasi_site,
    tanggal_mulai_rencana: newKontrak.tgl_mulai,
    tanggal_selesai_rencana: addMonthsToDate(newKontrak.tgl_mulai, 0),
    tanggal_selesai_aktual: newKontrak.status_kontrak === 'Aktif' ? newKontrak.tgl_mulai : '',
    status_instalasi: newKontrak.status_kontrak === 'Aktif' ? 'Selesai' : 'Sedang Berlangsung',
    file_ba_instalasi: '',
    catatan_pekerjaan:
      tipe === 'jual_lepas'
        ? 'Persiapan pengiriman logistik perangkat jual lepas.'
        : 'Mobilisasi & instalasi perangkat sesuai jadwal kontrak.',
  });

  // Buat Invoice Awal Otomatis
  const dueStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  })();

  if (tipe === 'sewa') {
    if (newKontrak.biaya_otc > 0) {
      const invIdOtc = nextId(db.invoices, 'id_invoice');
      db.invoices.unshift({
        id_invoice: invIdOtc,
        nomor_invoice: `INV/${stamp}/${String(invIdOtc).padStart(4, '0')}`,
        id_kontrak: nextKontrakId,
        id_request: nextReqId,
        tipe: 'OTC',
        periode_tagihan: 'Biaya Instalasi & Mobilisasi Awal (OTC)',
        tgl_terbit: todayIsoDate(),
        tgl_jatuh_tempo: dueStr,
        total_tagihan: newKontrak.biaya_otc,
        status_bayar: 'Menunggu Pembayaran',
        catatan: 'Tagihan 1x di awal kontrak sewa.',
        created_at: new Date().toISOString(),
      });
    }
    if (monthlyRoutine > 0) {
      const invIdBln = nextId(db.invoices, 'id_invoice');
      db.invoices.unshift({
        id_invoice: invIdBln,
        nomor_invoice: `INV/${stamp}/${String(invIdBln).padStart(4, '0')}`,
        id_kontrak: nextKontrakId,
        id_request: nextReqId,
        tipe: 'Bulanan',
        periode_tagihan: 'Sewa Bulan Ke-1',
        tgl_terbit: todayIsoDate(),
        tgl_jatuh_tempo: dueStr,
        total_tagihan: monthlyRoutine,
        status_bayar: 'Menunggu Pembayaran',
        catatan: 'Tagihan rutin sewa bulan pertama (dipotong PPh 23 2%).',
        created_at: new Date().toISOString(),
      });
    }
  } else {
    const invIdSale = nextId(db.invoices, 'id_invoice');
    db.invoices.unshift({
      id_invoice: invIdSale,
      nomor_invoice: `INV/${stamp}/${String(invIdSale).padStart(4, '0')}`,
      id_kontrak: nextKontrakId,
      id_request: nextReqId,
      tipe: 'Pelunasan',
      periode_tagihan: `Pelunasan Pengadaan Jual Lepas (${newKontrak.skema_pembayaran})`,
      tgl_terbit: todayIsoDate(),
      tgl_jatuh_tempo: dueStr,
      total_tagihan: newKontrak.nilai_kontrak,
      status_bayar: 'Menunggu Pembayaran',
      catatan: 'Sudah termasuk PPN 11% dan biaya logistik pengiriman.',
      created_at: new Date().toISOString(),
    });
  }

  appendActivityLog(db, {
    id_request: nextReqId,
    user_nama: actorName,
    aksi: tipe === 'jual_lepas' ? 'Pembuatan Transaksi Jual Lepas' : 'Penerbitan Kontrak Sewa B2B',
    deskripsi: `Menerbitkan transaksi ${nomorKontrak} untuk ${pelanggan.nama_perusahaan} senilai Rp ${Number(
      newKontrak.nilai_kontrak
    ).toLocaleString('id-ID')}.`,
  });

  persistDb(db);
  return { kontrak: newKontrak, request: newRequest };
};

export const updateKontrakRecord = async (idKontrak, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = db.kontrak.findIndex((k) => Number(k.id_kontrak) === Number(idKontrak));
  if (idx === -1) throw new Error('Kontrak tidak ditemukan.');

  db.kontrak[idx] = {
    ...db.kontrak[idx],
    judul_proyek: String(payload.judul_proyek ?? db.kontrak[idx].judul_proyek).trim(),
    lokasi_site: String(payload.lokasi_site ?? db.kontrak[idx].lokasi_site).trim(),
    tgl_mulai: payload.tgl_mulai || db.kontrak[idx].tgl_mulai,
    tgl_selesai: payload.tgl_selesai || db.kontrak[idx].tgl_selesai,
    nilai_kontrak: Number(payload.nilai_kontrak ?? db.kontrak[idx].nilai_kontrak) || 0,
    status_kontrak: payload.status_kontrak || db.kontrak[idx].status_kontrak,
    catatan: String(payload.catatan ?? db.kontrak[idx].catatan ?? '').trim(),
  };

  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Pembaruan Kontrak',
    deskripsi: `Memperbarui kontrak ${db.kontrak[idx].nomor_kontrak}.`,
  });
  persistDb(db);
  return db.kontrak[idx];
};

export const deleteKontrakRecord = async (idKontrak, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const found = db.kontrak.find((k) => Number(k.id_kontrak) === Number(idKontrak));
  if (!found) throw new Error('Kontrak tidak ditemukan.');

  db.kontrak = db.kontrak.filter((k) => Number(k.id_kontrak) !== Number(idKontrak));
  db.rentalRequests = (db.rentalRequests || []).map((r) =>
    Number(r.id_kontrak) === Number(idKontrak) ? { ...r, id_kontrak: null } : r
  );

  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Penghapusan Kontrak',
    deskripsi: `Menghapus data kontrak ${found.nomor_kontrak}.`,
  });
  persistDb(db);
  return true;
};

export const deleteRequestRecord = async (idRequest, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const found = db.rentalRequests.find((r) => Number(r.id_request) === Number(idRequest));
  if (!found) throw new Error('Data permohonan proyek tidak ditemukan.');

  db.rentalRequests = db.rentalRequests.filter((r) => Number(r.id_request) !== Number(idRequest));
  db.rentalItems = (db.rentalItems || []).filter((i) => Number(i.id_request) !== Number(idRequest));
  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Penghapusan Permohonan Sewa',
    deskripsi: `Menghapus permohonan ${found.kode_request} (${found.nama_klien}).`,
  });
  persistDb(db);
  return true;
};

/**
 * Ambil seluruh data terintegrasi untuk Pusat Kendali Proyek B2B (8 Tab)
 */
export const getProyekDetailComplete = async (idRequest) => {
  const db = await ensureDbLoaded();
  const proyek = db.rentalRequests.find((r) => Number(r.id_request) === Number(idRequest));
  if (!proyek) {
    throw new Error('Proyek B2B tidak ditemukan.');
  }

  const pelanggan = db.pelanggan.find((p) => Number(p.id_pelanggan) === Number(proyek.id_pelanggan)) || null;
  const kontrak = proyek.id_kontrak
    ? db.kontrak.find((k) => Number(k.id_kontrak) === Number(proyek.id_kontrak)) || null
    : null;
  const penawaran = db.penawaran.find((p) => Number(p.id_request) === Number(idRequest)) || null;
  const instalasi = db.instalasi.find((i) => Number(i.id_request) === Number(idRequest)) || null;

  const unitsMap = new Map((db.units || []).map((u) => [Number(u.id_unit), u]));
  const allProjectItems = (db.rentalItems || [])
    .filter((it) => Number(it.id_request) === Number(idRequest))
    .map((it) => ({
      ...it,
      unit: it.id_unit ? unitsMap.get(Number(it.id_unit)) || null : null,
    }));

  const mainItems = allProjectItems.filter((it) => !it.id_addendum);
  const addenda = (db.addendum || [])
    .filter((a) => Number(a.id_request) === Number(idRequest))
    .map((a) => ({
      ...a,
      items: allProjectItems.filter((it) => Number(it.id_addendum) === Number(a.id_addendum)),
    }));

  const rawInvoices = (db.invoices || []).filter(
    (inv) =>
      Number(inv.id_request) === Number(idRequest) ||
      (kontrak && Number(inv.id_kontrak) === Number(kontrak.id_kontrak))
  );

  const invoices = rawInvoices
    .map((inv) => {
      const payments = (db.pembayaranDetail || []).filter((p) => Number(p.id_invoice) === Number(inv.id_invoice));
      const terbayarVerified = payments
        .filter((p) => p.status_verifikasi === 'Terverifikasi')
        .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);
      const sisaPiutang = Math.max(0, (Number(inv.total_tagihan) || 0) - terbayarVerified);
      return {
        ...inv,
        payments,
        terbayar: terbayarVerified,
        sisa_piutang: sisaPiutang,
      };
    })
    .sort((a, b) => Number(b.id_invoice) - Number(a.id_invoice));

  const allPayments = invoices.flatMap((inv) =>
    inv.payments.map((p) => ({
      ...p,
      nomor_invoice: inv.nomor_invoice,
      periode_tagihan: inv.periode_tagihan,
      total_tagihan: inv.total_tagihan,
    }))
  );

  const dokumenList = (db.dokumen || [])
    .filter((d) => Number(d.id_request) === Number(idRequest))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const activityLogs = (db.activityLogs || [])
    .filter((l) => Number(l.id_request) === Number(idRequest))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const nilaiKomitmen = Number(kontrak?.nilai_kontrak || penawaran?.nilai_penawaran_resmi || proyek.estimasi_total) || 0;
  const totalTertagih = invoices
    .filter((i) => i.status_bayar !== 'Draft')
    .reduce((s, i) => s + (Number(i.total_tagihan) || 0), 0);
  const totalTerbayarLunas = invoices.reduce((s, i) => s + i.terbayar, 0);
  const sisaKomitmen = Math.max(0, nilaiKomitmen - totalTerbayarLunas);

  return {
    proyek,
    pelanggan,
    kontrak,
    penawaran,
    instalasi,
    mainItems,
    addenda,
    invoices,
    allPayments,
    dokumenList,
    activityLogs,
    availableUnits: db.units || [],
    finansial: {
      nilaiKomitmen,
      totalTertagih,
      totalTerbayarLunas,
      sisaKomitmen,
      perluRenewal: Boolean(kontrak && (sisaKomitmen === 0 || kontrak.status_kontrak === 'Berakhir')),
    },
  };
};

/**
 * Tab 2: Simpan Data Penawaran & Hasil Lelang/Tender
 */
export const saveProyekPenawaran = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');

  const pIdx = db.penawaran.findIndex((p) => Number(p.id_request) === Number(idRequest));
  const record = {
    id_penawaran: pIdx !== -1 ? db.penawaran[pIdx].id_penawaran : nextId(db.penawaran, 'id_penawaran'),
    id_request: Number(idRequest),
    nomor_penawaran_internal: String(payload.nomor_penawaran_internal || '').trim(),
    tanggal_penawaran_internal: payload.tanggal_penawaran_internal || todayIsoDate(),
    nilai_penawaran_internal: Number(payload.nilai_penawaran_internal) || 0,
    catatan_internal: String(payload.catatan_internal || '').trim(),
    nomor_penawaran_resmi: String(payload.nomor_penawaran_resmi || '').trim(),
    tanggal_penawaran_resmi: payload.tanggal_penawaran_resmi || todayIsoDate(),
    nilai_penawaran_resmi: Number(payload.nilai_penawaran_resmi) || 0,
    file_penawaran_resmi: payload.file_penawaran_resmi || (pIdx !== -1 ? db.penawaran[pIdx].file_penawaran_resmi : ''),
    status_lelang: payload.status_lelang || 'Menunggu',
    tanggal_hasil_lelang: payload.tanggal_hasil_lelang || '',
    file_hasil_lelang: payload.file_hasil_lelang || (pIdx !== -1 ? db.penawaran[pIdx].file_hasil_lelang : ''),
    catatan_lelang: String(payload.catatan_lelang || '').trim(),
  };

  if (pIdx !== -1) {
    db.penawaran[pIdx] = record;
  } else {
    db.penawaran.push(record);
  }

  // Otomasi status proyek berdasarkan hasil lelang
  if (record.status_lelang === 'Menang' && ['Baru', 'Ditinjau', 'Penawaran', 'Kalah'].includes(db.rentalRequests[rIdx].status)) {
    db.rentalRequests[rIdx].status = 'Menang';
    db.rentalRequests[rIdx].tahap_proses = 'Ditetapkan Sebagai Pemenang Tender — Siap Instalasi';
  } else if (record.status_lelang === 'Kalah') {
    db.rentalRequests[rIdx].status = 'Kalah';
    db.rentalRequests[rIdx].tahap_proses = 'Tidak Lolos Evaluasi Tender';
  } else if (['Baru', 'Ditinjau'].includes(db.rentalRequests[rIdx].status)) {
    db.rentalRequests[rIdx].status = 'Penawaran';
    db.rentalRequests[rIdx].tahap_proses = 'Surat Penawaran Resmi Dikirim ke Klien';
  }
  if (record.nilai_penawaran_resmi > 0) {
    db.rentalRequests[rIdx].estimasi_total = record.nilai_penawaran_resmi;
  }
  db.rentalRequests[rIdx].updated_at = new Date().toISOString();

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Pembaruan Penawaran & Status Lelang',
    deskripsi: `Status lelang proyek diperbarui menjadi "${record.status_lelang}" (Nilai Resmi: Rp ${Number(
      record.nilai_penawaran_resmi
    ).toLocaleString('id-ID')}).`,
  });

  persistDb(db);
  return record;
};

/**
 * Tab 3: Simpan Jadwal & Catatan Instalasi Lapangan
 */
export const saveProyekInstalasi = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');

  const iIdx = db.instalasi.findIndex((i) => Number(i.id_request) === Number(idRequest));
  const record = {
    id_instalasi: iIdx !== -1 ? db.instalasi[iIdx].id_instalasi : nextId(db.instalasi, 'id_instalasi'),
    id_request: Number(idRequest),
    lokasi_instalasi: String(payload.lokasi_instalasi || db.rentalRequests[rIdx].lokasi_site).trim(),
    tanggal_mulai_rencana: payload.tanggal_mulai_rencana || '',
    tanggal_selesai_rencana: payload.tanggal_selesai_rencana || '',
    tanggal_selesai_aktual: payload.tanggal_selesai_aktual || '',
    status_instalasi: payload.status_instalasi || 'Belum Dimulai',
    file_ba_instalasi: payload.file_ba_instalasi || (iIdx !== -1 ? db.instalasi[iIdx].file_ba_instalasi : ''),
    catatan_pekerjaan: String(payload.catatan_pekerjaan || '').trim(),
  };

  if (iIdx !== -1) {
    db.instalasi[iIdx] = record;
  } else {
    db.instalasi.push(record);
  }

  if (record.status_instalasi === 'Sedang Berlangsung') {
    db.rentalRequests[rIdx].status = 'Instalasi';
    db.rentalRequests[rIdx].tahap_proses = 'Tim Engineering Melakukan Instalasi di Site';
  } else if (record.status_instalasi === 'Selesai') {
    db.rentalRequests[rIdx].status = db.rentalRequests[rIdx].id_kontrak ? 'Aktif' : 'Instalasi';
    db.rentalRequests[rIdx].tahap_proses = 'Uji Terima (ATP) & Instalasi Lapangan Selesai';
  }
  db.rentalRequests[rIdx].updated_at = new Date().toISOString();

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Pembaruan Progres Instalasi Site',
    deskripsi: `Status instalasi lapangan: ${record.status_instalasi} di ${record.lokasi_instalasi}.`,
  });

  persistDb(db);
  return record;
};

/**
 * Tab 4: Terbitkan atau Perbarui Kontrak Resmi Proyek
 */
export const saveOrIssueProyekKontrak = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');

  const req = db.rentalRequests[rIdx];
  const stamp = buildYearMonthStamp();
  const durasiTahun = Math.max(1, Number(payload.durasi_tahun) || 1);
  const durasiBulan = diffMonthsBetween(payload.tgl_mulai, payload.tgl_selesai) || durasiTahun * 12;

  const projectItems = (db.rentalItems || []).filter((it) => Number(it.id_request) === Number(idRequest));
  const totalUnits = projectItems.reduce((s, it) => s + (Number(it.jumlah) || 1), 0);

  let kontrakRecord;
  if (req.id_kontrak) {
    const kIdx = db.kontrak.findIndex((k) => Number(k.id_kontrak) === Number(req.id_kontrak));
    if (kIdx !== -1) {
      db.kontrak[kIdx] = {
        ...db.kontrak[kIdx],
        judul_proyek: String(payload.judul_proyek).trim(),
        lokasi_site: String(payload.lokasi_site || req.lokasi_site).trim(),
        tgl_mulai: payload.tgl_mulai,
        tgl_selesai: payload.tgl_selesai,
        durasi_tahun: durasiTahun,
        durasi_bulan: durasiBulan,
        biaya_otc: Number(payload.biaya_otc) || 0,
        nilai_kontrak: Number(payload.nilai_kontrak) || 0,
        status_kontrak: payload.status_kontrak || 'Aktif',
        catatan: String(payload.catatan || '').trim(),
      };
      kontrakRecord = db.kontrak[kIdx];
    }
  }

  if (!kontrakRecord) {
    const newId = nextId(db.kontrak, 'id_kontrak');
    kontrakRecord = {
      id_kontrak: newId,
      nomor_kontrak: `TERA/KONT/${stamp}/${String(newId).padStart(4, '0')}`,
      tipe_transaksi: req.tipe_transaksi || 'sewa',
      id_pelanggan: req.id_pelanggan || 301,
      judul_proyek: String(payload.judul_proyek).trim(),
      lokasi_site: String(payload.lokasi_site || req.lokasi_site).trim(),
      tgl_mulai: payload.tgl_mulai,
      tgl_selesai: payload.tgl_selesai,
      durasi_tahun: durasiTahun,
      durasi_bulan: durasiBulan,
      unit_terpasang: totalUnits,
      biaya_otc: Number(payload.biaya_otc) || 0,
      biaya_pengiriman: 0,
      nilai_kontrak: Number(payload.nilai_kontrak) || 0,
      skema_pembayaran: 'Bulanan',
      status_kontrak: payload.status_kontrak || 'Aktif',
      pic_lapangan: req.pic_nama,
      kontak_pic: req.pic_telepon,
      catatan: String(payload.catatan || '').trim(),
      created_at: new Date().toISOString(),
    };
    db.kontrak.unshift(kontrakRecord);
    db.rentalRequests[rIdx].id_kontrak = newId;
  }

  if (kontrakRecord.status_kontrak === 'Aktif') {
    db.rentalRequests[rIdx].status = 'Aktif';
    db.rentalRequests[rIdx].tahap_proses = 'Kontrak Sewa Resmi Aktif & Berjalan';
    projectItems.forEach((it) => {
      if (it.id_unit) {
        const uIdx = db.units.findIndex((u) => Number(u.id_unit) === Number(it.id_unit));
        if (uIdx !== -1) {
          db.units[uIdx] = {
            ...db.units[uIdx],
            status_unit: 'Disewa',
            lokasi: kontrakRecord.lokasi_site,
            klien: req.nama_klien,
            updated_at: new Date().toISOString(),
          };
        }
      }
    });
  }

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Penerbitan / Pembaruan Kontrak Resmi',
    deskripsi: `Kontrak ${kontrakRecord.nomor_kontrak} disimpan dengan nilai Rp ${Number(
      kontrakRecord.nilai_kontrak
    ).toLocaleString('id-ID')}.`,
  });

  persistDb(db);
  return kontrakRecord;
};

/**
 * Tab 4 Modal: Tambah Adendum Multi-Unit di Tengah Kontrak Berjalan
 */
export const addProyekAddendum = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');
  const req = db.rentalRequests[rIdx];

  const kIdx = db.kontrak.findIndex((k) => Number(k.id_kontrak) === Number(req.id_kontrak));
  if (kIdx === -1) {
    throw new Error('Terbitkan Kontrak Utama terlebih dahulu sebelum membuat Adendum.');
  }

  const kontrak = db.kontrak[kIdx];
  const rows = Array.isArray(payload.items) ? payload.items : [];
  if (rows.length === 0) {
    throw new Error('Tambahkan minimal 1 baris perangkat pada Adendum.');
  }

  const sisaBulan = diffMonthsBetween(payload.tanggal_efektif || todayIsoDate(), kontrak.tgl_selesai);
  const tambahanBulanan = rows.reduce((s, r) => s + (Number(r.qty) || 1) * (Number(r.harga) || 0), 0);
  const totalQty = rows.reduce((s, r) => s + (Number(r.qty) || 1), 0);
  const totalNilaiAddendum = tambahanBulanan * sisaBulan;

  const newAddId = nextId(db.addendum, 'id_addendum');
  const existingCount = (db.addendum || []).filter((a) => Number(a.id_request) === Number(idRequest)).length;
  const nomorAddendum =
    String(payload.nomor_addendum || '').trim() ||
    `${kontrak.nomor_kontrak}/ADD-${String(existingCount + 1).padStart(2, '0')}`;

  const addendumRecord = {
    id_addendum: newAddId,
    id_request: Number(idRequest),
    id_kontrak: kontrak.id_kontrak,
    nomor_addendum: nomorAddendum,
    judul_addendum: String(payload.judul_addendum || `Adendum No. ${existingCount + 1}`).trim(),
    tanggal_efektif: payload.tanggal_efektif || todayIsoDate(),
    tanggal_selesai: kontrak.tgl_selesai,
    durasi_bulan: sisaBulan,
    total_unit: totalQty,
    tambahan_bulanan: tambahanBulanan,
    total_nilai_addendum: totalNilaiAddendum,
    status_addendum: 'Aktif',
    catatan: String(payload.catatan || '').trim(),
    created_at: new Date().toISOString(),
  };

  db.addendum.push(addendumRecord);

  rows.forEach((r) => {
    const unitId = r.id_unit && r.id_unit !== 'manual' ? Number(r.id_unit) : null;
    const unitObj = unitId ? db.units.find((u) => Number(u.id_unit) === unitId) : null;
    const qty = Math.max(1, Number(r.qty) || 1);
    const tarif = Number(r.harga) || 0;

    db.rentalItems.push({
      id_item: nextId(db.rentalItems, 'id_item'),
      id_request: Number(idRequest),
      id_addendum: newAddId,
      id_unit: unitId,
      kode_unit_snapshot: unitObj ? unitObj.kode_unit : 'ADD-UNIT',
      nama_unit_snapshot: unitObj ? unitObj.nama_unit : String(r.nama_manual || 'Unit Tambahan Adendum').trim(),
      jumlah: qty,
      harga_sewa_snapshot: tarif,
      subtotal_per_bulan: qty * tarif,
      catatan: `Adendum ${nomorAddendum}`,
    });

    if (unitId) {
      const uIdx = db.units.findIndex((u) => Number(u.id_unit) === unitId);
      if (uIdx !== -1) {
        const prevStatus = db.units[uIdx].status_unit;
        db.units[uIdx] = {
          ...db.units[uIdx],
          status_unit: 'Disewa',
          lokasi: kontrak.lokasi_site,
          klien: req.nama_klien,
          updated_at: new Date().toISOString(),
        };
        db.unitHistory.unshift({
          id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
          id_unit: unitId,
          status_sebelum: prevStatus,
          status_sesudah: 'Disewa',
          lokasi: kontrak.lokasi_site,
          klien: req.nama_klien,
          keterangan: `Penambahan unit via Adendum ${nomorAddendum}`,
          diubah_oleh: actorName,
          created_at: new Date().toISOString(),
        });
      }
    }
  });

  // Update komitmen kontrak utama
  db.kontrak[kIdx] = {
    ...kontrak,
    unit_terpasang: (Number(kontrak.unit_terpasang) || 0) + totalQty,
    nilai_kontrak: (Number(kontrak.nilai_kontrak) || 0) + totalNilaiAddendum,
  };
  db.rentalRequests[rIdx].estimasi_biaya_bulanan =
    (Number(req.estimasi_biaya_bulanan) || 0) + tambahanBulanan;
  db.rentalRequests[rIdx].estimasi_total = db.kontrak[kIdx].nilai_kontrak;

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Pengesahan Adendum Kontrak Berjalan',
    deskripsi: `Adendum ${nomorAddendum} disahkan (+${totalQty} unit, tambahan nilai kontrak Rp ${totalNilaiAddendum.toLocaleString(
      'id-ID'
    )}).`,
  });

  persistDb(db);
  return addendumRecord;
};

/**
 * Tab 4 / Tab 8 Modal: Kontrak Ulang / Renewal Masa Sewa
 */
export const renewProyekKontrak = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');
  const req = db.rentalRequests[rIdx];
  const kIdx = db.kontrak.findIndex((k) => Number(k.id_kontrak) === Number(req.id_kontrak));
  if (kIdx === -1) throw new Error('Kontrak belum diterbitkan.');

  const tambahanNilai = Number(payload.nilai_kontrak_baru) || 0;
  const durasiTahun = Math.max(1, Number(payload.durasi_tahun) || 1);

  db.kontrak[kIdx] = {
    ...db.kontrak[kIdx],
    tgl_mulai: payload.tgl_mulai,
    tgl_selesai: payload.tgl_selesai,
    durasi_tahun: durasiTahun,
    durasi_bulan: durasiTahun * 12,
    nilai_kontrak: (Number(db.kontrak[kIdx].nilai_kontrak) || 0) + tambahanNilai,
    status_kontrak: 'Aktif',
    catatan: String(payload.catatan || db.kontrak[kIdx].catatan || '').trim(),
  };

  db.rentalRequests[rIdx] = {
    ...req,
    status: 'Aktif',
    tahap_proses: `Kontrak Diperpanjang (Renewal ${durasiTahun} Tahun)`,
    estimasi_biaya_bulanan: Number(payload.tarif_bulanan_baru) || req.estimasi_biaya_bulanan,
    estimasi_total: db.kontrak[kIdx].nilai_kontrak,
    updated_at: new Date().toISOString(),
  };

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Perpanjangan Kontrak (Renewal)',
    deskripsi: `Kontrak diperpanjang hingga ${payload.tgl_selesai} dengan tambahan komitmen Rp ${tambahanNilai.toLocaleString(
      'id-ID'
    )}.`,
  });

  persistDb(db);
  return db.kontrak[kIdx];
};

/**
 * Tab 5: Buat Draft Tagihan Invoice & Terbitkan Invoice
 */
export const createProyekInvoiceDraft = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const req = db.rentalRequests.find((r) => Number(r.id_request) === Number(idRequest));
  if (!req) throw new Error('Proyek tidak ditemukan.');

  const stamp = buildYearMonthStamp();
  const newInvId = nextId(db.invoices, 'id_invoice');
  const invoice = {
    id_invoice: newInvId,
    nomor_invoice: `INV/${stamp}/${String(newInvId).padStart(4, '0')}`,
    id_kontrak: req.id_kontrak || null,
    id_request: Number(idRequest),
    tipe: payload.tipe || 'Bulanan',
    periode_tagihan: String(payload.periode_tagihan).trim(),
    tgl_terbit: todayIsoDate(),
    tgl_jatuh_tempo: payload.tgl_jatuh_tempo,
    total_tagihan: Number(payload.total_tagihan) || 0,
    status_bayar: 'Draft',
    catatan: String(payload.catatan || '').trim(),
    created_at: new Date().toISOString(),
  };

  db.invoices.unshift(invoice);
  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Pembuatan Draft Faktur Invoice',
    deskripsi: `Membuat draft faktur ${invoice.nomor_invoice} (${invoice.periode_tagihan}) senilai Rp ${invoice.total_tagihan.toLocaleString(
      'id-ID'
    )}.`,
  });

  persistDb(db);
  return invoice;
};

export const publishProyekInvoice = async (idInvoice, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = db.invoices.findIndex((i) => Number(i.id_invoice) === Number(idInvoice));
  if (idx === -1) throw new Error('Invoice tidak ditemukan.');

  db.invoices[idx] = {
    ...db.invoices[idx],
    status_bayar: 'Menunggu Pembayaran',
    tgl_terbit: todayIsoDate(),
  };

  appendActivityLog(db, {
    id_request: db.invoices[idx].id_request,
    user_nama: actorName,
    aksi: 'Penerbitan Faktur Tagihan Resmi',
    deskripsi: `Faktur ${db.invoices[idx].nomor_invoice} resmi diterbitkan ke klien.`,
  });

  persistDb(db);
  return db.invoices[idx];
};

/**
 * Tab 6: Catat Pembayaran & Verifikasi Mutasi Pembayaran
 */
export const recordProyekPayment = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const invIdx = db.invoices.findIndex((i) => Number(i.id_invoice) === Number(payload.id_invoice));
  if (invIdx === -1) throw new Error('Pilih faktur tagihan yang valid.');

  const payment = {
    id_detail: nextId(db.pembayaranDetail, 'id_detail'),
    id_invoice: Number(payload.id_invoice),
    tanggal_bayar: payload.tanggal_bayar || todayIsoDate(),
    jumlah_bayar: Number(payload.jumlah_bayar) || 0,
    metode_bayar: payload.metode_bayar || 'Transfer Bank Mandiri Corporate',
    referensi_bayar: String(payload.referensi_bayar || '').trim(),
    bukti_bayar: payload.bukti_bayar || 'Bukti_Transfer_Pelanggan.pdf',
    status_verifikasi: 'Menunggu',
    diverifikasi_oleh: null,
    catatan: String(payload.catatan || '').trim(),
  };

  db.pembayaranDetail.unshift(payment);
  if (db.invoices[invIdx].status_bayar !== 'Lunas') {
    db.invoices[invIdx].status_bayar = 'Menunggu Verifikasi';
  }

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Pencatatan Bukti Pembayaran',
    deskripsi: `Mencatat pembayaran Rp ${payment.jumlah_bayar.toLocaleString('id-ID')} untuk ${
      db.invoices[invIdx].nomor_invoice
    }.`,
  });

  persistDb(db);
  return payment;
};

export const verifyProyekPayment = async (idDetail, decision, actorName = 'Finance TERA') => {
  const db = await ensureDbLoaded();
  const dIdx = db.pembayaranDetail.findIndex((d) => Number(d.id_detail) === Number(idDetail));
  if (dIdx === -1) throw new Error('Data pembayaran tidak ditemukan.');

  const statusVerif = decision === 'Terima' ? 'Terverifikasi' : 'Ditolak';
  db.pembayaranDetail[dIdx] = {
    ...db.pembayaranDetail[dIdx],
    status_verifikasi: statusVerif,
    diverifikasi_oleh: actorName,
  };

  const idInvoice = db.pembayaranDetail[dIdx].id_invoice;
  const invIdx = db.invoices.findIndex((i) => Number(i.id_invoice) === Number(idInvoice));
  let idRequest = null;

  if (invIdx !== -1) {
    idRequest = db.invoices[invIdx].id_request;
    const totalVerified = db.pembayaranDetail
      .filter((p) => Number(p.id_invoice) === Number(idInvoice) && p.status_verifikasi === 'Terverifikasi')
      .reduce((s, p) => s + (Number(p.jumlah_bayar) || 0), 0);

    if (totalVerified >= Number(db.invoices[invIdx].total_tagihan)) {
      db.invoices[invIdx].status_bayar = 'Lunas';
    } else {
      const hasPending = db.pembayaranDetail.some(
        (p) => Number(p.id_invoice) === Number(idInvoice) && p.status_verifikasi === 'Menunggu'
      );
      db.invoices[invIdx].status_bayar = hasPending ? 'Menunggu Verifikasi' : 'Menunggu Pembayaran';
    }
  }

  appendActivityLog(db, {
    id_request: idRequest,
    user_nama: actorName,
    aksi: statusVerif === 'Terverifikasi' ? 'Pembayaran Diverifikasi Lunas' : 'Penolakan Bukti Pembayaran',
    deskripsi: `Pembayaran senilai Rp ${Number(db.pembayaranDetail[dIdx].jumlah_bayar).toLocaleString(
      'id-ID'
    )} berstatus ${statusVerif}.`,
  });

  persistDb(db);
  return db.pembayaranDetail[dIdx];
};

/**
 * Tab 7: Unggah Dokumen Proyek ke Repository
 */
export const uploadProyekDocument = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const doc = {
    id_dokumen: nextId(db.dokumen, 'id_dokumen'),
    id_request: Number(idRequest),
    jenis_dokumen: payload.jenis_dokumen || 'Lainnya',
    nama_file: String(payload.nama_file || 'Dokumen_Proyek_TERA.pdf').trim(),
    ukuran_kb: Number(payload.ukuran_kb) || 350,
    keterangan: String(payload.keterangan || '').trim(),
    diunggah_oleh: actorName,
    created_at: new Date().toISOString(),
  };

  db.dokumen.unshift(doc);
  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Unggah Dokumen Proyek',
    deskripsi: `Mengunggah dokumen [${doc.jenis_dokumen}] ${doc.nama_file}.`,
  });

  persistDb(db);
  return doc;
};

/**
 * Modal Ubah Status Tahapan Proyek Cepat
 */
export const updateQuickProyekStatus = async (idRequest, { status, tahap_proses, catatan }, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (idx === -1) throw new Error('Proyek tidak ditemukan.');

  db.rentalRequests[idx] = {
    ...db.rentalRequests[idx],
    status,
    tahap_proses: String(tahap_proses || `Tahapan: ${status}`).trim(),
    catatan_internal: String(catatan ?? db.rentalRequests[idx].catatan_internal ?? '').trim(),
    updated_at: new Date().toISOString(),
  };

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Perubahan Status Tahapan Proyek',
    deskripsi: `Status proyek diubah menjadi "${status}" (${db.rentalRequests[idx].tahap_proses}).`,
  });

  persistDb(db);
  return db.rentalRequests[idx];
};

/**
 * Tab 8: Pembongkaran Perangkat & Penyelesaian Masa Sewa
 */
export const decommissionAndCompleteProyek = async (idRequest, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const rIdx = db.rentalRequests.findIndex((r) => Number(r.id_request) === Number(idRequest));
  if (rIdx === -1) throw new Error('Proyek tidak ditemukan.');

  const req = db.rentalRequests[rIdx];
  db.rentalRequests[rIdx] = {
    ...req,
    status: 'Selesai',
    tahap_proses: `Pembongkaran Selesai (${payload.tanggal_bongkar || todayIsoDate()}) — Unit Kembali ke Gudang`,
    updated_at: new Date().toISOString(),
  };

  if (req.id_kontrak) {
    const kIdx = db.kontrak.findIndex((k) => Number(k.id_kontrak) === Number(req.id_kontrak));
    if (kIdx !== -1) {
      db.kontrak[kIdx] = {
        ...db.kontrak[kIdx],
        status_kontrak: 'Berakhir',
      };
    }
  }

  // Kembalikan seluruh unit fisik ke Gudang Pusat dengan status Tersedia / Maintenance sesuai kondisi
  const targetStatus =
    payload.kondisi_perangkat === 'Ada Kerusakan Fisik'
      ? 'Rusak'
      : payload.kondisi_perangkat === 'Perlu Perawatan / Kalibrasi'
      ? 'Maintenance'
      : 'Tersedia';

  const projectItems = (db.rentalItems || []).filter((it) => Number(it.id_request) === Number(idRequest));
  projectItems.forEach((it) => {
    if (it.id_unit) {
      const uIdx = db.units.findIndex((u) => Number(u.id_unit) === Number(it.id_unit));
      if (uIdx !== -1) {
        const prevStatus = db.units[uIdx].status_unit;
        db.units[uIdx] = {
          ...db.units[uIdx],
          status_unit: targetStatus,
          lokasi: 'Gudang Pusat Cilandak, Jakarta Selatan',
          klien: null,
          updated_at: new Date().toISOString(),
        };
        db.unitHistory.unshift({
          id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
          id_unit: it.id_unit,
          status_sebelum: prevStatus,
          status_sesudah: targetStatus,
          lokasi: 'Gudang Pusat Cilandak, Jakarta Selatan',
          klien: null,
          keterangan: `Pembongkaran akhir sewa ${req.kode_request}. Kondisi: ${payload.kondisi_perangkat}`,
          diubah_oleh: actorName,
          created_at: new Date().toISOString(),
        });
      }
    }
  });

  appendActivityLog(db, {
    id_request: Number(idRequest),
    user_nama: actorName,
    aksi: 'Penyelesaian Sewa & Pembongkaran Site',
    deskripsi: `Proyek diselesaikan pada ${payload.tanggal_bongkar}. Kondisi perangkat: ${payload.kondisi_perangkat}. Seluruh unit dikembalikan ke Gudang Pusat.`,
  });

  persistDb(db);
  return db.rentalRequests[rIdx];
};

