/**
 * @file pelangganService.js
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Layanan pengelolaan Master Pelanggan Korporat B2B TERA.
 * Menangani direktori mitra bisnis (PT/CV), NPWP, PIC Procurement, sinkronisasi portofolio kontrak,
 * serta integrasi dengan Mock API dan penyimpanan lokal terisolasi.
 */

import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';

export const getPelangganDirectory = async ({ search = '', status = 'Semua' } = {}) => {
  const db = await ensureDbLoaded();
  const q = String(search || '').trim().toLowerCase();

  const enriched = (db.pelanggan || []).map((p) => {
    const kontrakKlien = (db.kontrak || []).filter((k) => Number(k.id_pelanggan) === Number(p.id_pelanggan));
    const kontrakAktif = kontrakKlien.filter((k) => k.status_kontrak === 'Aktif').length;
    const totalNilai = kontrakKlien.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0);
    return {
      ...p,
      jumlah_kontrak: kontrakKlien.length,
      kontrak_aktif: kontrakAktif,
      total_nilai_kontrak: totalNilai,
    };
  });

  const summary = {
    total: enriched.length,
    aktif: enriched.filter((p) => p.status_aktif === 'Aktif').length,
    tidakAktif: enriched.filter((p) => p.status_aktif !== 'Aktif').length,
  };

  const filtered = enriched
    .filter((p) => {
      if (status && status !== 'Semua' && p.status_aktif !== status) return false;
      if (q) {
        const hay = `${p.nama_perusahaan} ${p.npwp || ''} ${p.pic_nama} ${p.pic_email} ${p.pic_telepon} ${p.alamat_kantor || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.id_pelanggan) - Number(a.id_pelanggan));

  return { pelangganList: filtered, summary };
};

export const getPelangganDetailById = async (idPelanggan) => {
  const db = await ensureDbLoaded();
  const pelanggan = db.pelanggan.find((p) => Number(p.id_pelanggan) === Number(idPelanggan));
  if (!pelanggan) throw new Error('Data pelanggan korporat tidak ditemukan.');

  const kontrakList = (db.kontrak || []).filter((k) => Number(k.id_pelanggan) === Number(idPelanggan));
  const requestList = (db.rentalRequests || []).filter((r) => Number(r.id_pelanggan) === Number(idPelanggan));

  return { pelanggan, kontrakList, requestList };
};

export const createPelangganEntity = async (payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const cleanName = String(payload.nama_perusahaan || '').trim();
  if (!cleanName) throw new Error('Nama perusahaan wajib diisi.');

  const newItem = {
    id_pelanggan: nextId(db.pelanggan, 'id_pelanggan'),
    nama_perusahaan: cleanName,
    npwp: String(payload.npwp || '').trim(),
    pic_nama: String(payload.pic_nama || '').trim(),
    pic_jabatan: String(payload.pic_jabatan || 'Procurement Representative').trim(),
    pic_telepon: String(payload.pic_telepon || '').trim(),
    pic_email: String(payload.pic_email || '').trim(),
    alamat_kantor: String(payload.alamat_kantor || '').trim(),
    status_aktif: payload.status_aktif || 'Aktif',
    created_at: new Date().toISOString(),
  };

  db.pelanggan.unshift(newItem);
  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Registrasi Mitra Korporat B2B',
    deskripsi: `Mendaftarkan mitra korporat baru: ${newItem.nama_perusahaan}.`,
  });
  persistDb(db);
  return newItem;
};

export const updatePelangganEntity = async (idPelanggan, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = db.pelanggan.findIndex((p) => Number(p.id_pelanggan) === Number(idPelanggan));
  if (idx === -1) throw new Error('Pelanggan tidak ditemukan.');

  const updated = {
    ...db.pelanggan[idx],
    nama_perusahaan: String(payload.nama_perusahaan ?? db.pelanggan[idx].nama_perusahaan).trim(),
    npwp: String(payload.npwp ?? db.pelanggan[idx].npwp).trim(),
    pic_nama: String(payload.pic_nama ?? db.pelanggan[idx].pic_nama).trim(),
    pic_jabatan: String(payload.pic_jabatan ?? db.pelanggan[idx].pic_jabatan).trim(),
    pic_telepon: String(payload.pic_telepon ?? db.pelanggan[idx].pic_telepon).trim(),
    pic_email: String(payload.pic_email ?? db.pelanggan[idx].pic_email).trim(),
    alamat_kantor: String(payload.alamat_kantor ?? db.pelanggan[idx].alamat_kantor).trim(),
    status_aktif: payload.status_aktif || db.pelanggan[idx].status_aktif,
  };

  db.pelanggan[idx] = updated;
  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Pembaruan Data Mitra B2B',
    deskripsi: `Memperbarui profil korporat ${updated.nama_perusahaan}.`,
  });
  persistDb(db);
  return updated;
};

export const deletePelangganEntity = async (idPelanggan, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const found = db.pelanggan.find((p) => Number(p.id_pelanggan) === Number(idPelanggan));
  if (!found) throw new Error('Pelanggan tidak ditemukan.');

  const hasActiveContract = (db.kontrak || []).some(
    (k) => Number(k.id_pelanggan) === Number(idPelanggan) && k.status_kontrak === 'Aktif'
  );
  if (hasActiveContract) {
    throw new Error('Tidak dapat menghapus mitra yang masih memiliki Kontrak Aktif.');
  }

  db.pelanggan = db.pelanggan.filter((p) => Number(p.id_pelanggan) !== Number(idPelanggan));
  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Penghapusan Mitra B2B',
    deskripsi: `Menghapus entitas pelanggan ${found.nama_perusahaan}.`,
  });
  persistDb(db);
  return true;
};

