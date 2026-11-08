/**
 * @file masterDataService.js
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Layanan pengelolaan Master Data TERA: Master Pelanggan Korporat B2B,
 * Master Paket Standar & Tarif Acuan Sewa/Jual B2B, serta Master Parameter Komersial (Pajak PPh 23 / PPN 11% & SLA).
 */

import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';
export * from './pelangganService';

/**
 * Mengambil daftar master paket standar & tarif acuan
 */
export const getMasterKatalogStandar = async ({ search = '', kategori = 'Semua' } = {}) => {
  const db = await ensureDbLoaded();
  const q = String(search || '').trim().toLowerCase();

  const list = (db.katalogStandar || []).filter((item) => {
    if (kategori !== 'Semua' && item.kategori !== kategori) return false;
    if (q) {
      const hay = `${item.kode} ${item.nama} ${item.kategori} ${item.deskripsi || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return list;
};

/**
 * Menambahkan master paket standar baru
 */
export const createMasterKatalogItem = async (payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const nama = String(payload.nama || '').trim();
  if (!nama) throw new Error('Nama paket standar wajib diisi.');

  const nextKode = payload.kode && payload.kode.trim()
    ? payload.kode.trim()
    : `STD-${String(db.katalogStandar.length + 1).padStart(2, '0')}`;

  const newItem = {
    kode: nextKode,
    nama,
    kategori: payload.kategori || 'Repeater',
    harga_sewa: Number(payload.harga_sewa) || 0,
    harga_jual: Number(payload.harga_jual) || 0,
    otc: Number(payload.otc) || 0,
    deskripsi: String(payload.deskripsi || '').trim(),
  };

  db.katalogStandar.push(newItem);
  persistDb(db);

  appendActivityLog(
    'Tambah Master Tarif',
    `Paket standar ${newItem.kode} - ${newItem.nama} ditambahkan ke Master Data oleh ${actorName}.`,
    actorName
  );

  return newItem;
};

/**
 * Memperbarui data master paket standar
 */
export const updateMasterKatalogItem = async (kodeTarget, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = (db.katalogStandar || []).findIndex((k) => k.kode === kodeTarget);
  if (idx === -1) throw new Error('Data paket standar tidak ditemukan.');

  db.katalogStandar[idx] = {
    ...db.katalogStandar[idx],
    nama: String(payload.nama || db.katalogStandar[idx].nama).trim(),
    kategori: payload.kategori || db.katalogStandar[idx].kategori,
    harga_sewa: Number(payload.harga_sewa) >= 0 ? Number(payload.harga_sewa) : db.katalogStandar[idx].harga_sewa,
    harga_jual: Number(payload.harga_jual) >= 0 ? Number(payload.harga_jual) : db.katalogStandar[idx].harga_jual,
    otc: Number(payload.otc) >= 0 ? Number(payload.otc) : db.katalogStandar[idx].otc,
    deskripsi: String(payload.deskripsi || db.katalogStandar[idx].deskripsi).trim(),
  };

  persistDb(db);

  appendActivityLog(
    'Ubah Master Tarif',
    `Paket standar ${kodeTarget} diperbarui oleh ${actorName}.`,
    actorName
  );

  return db.katalogStandar[idx];
};

/**
 * Menghapus master paket standar
 */
export const deleteMasterKatalogItem = async (kodeTarget, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = (db.katalogStandar || []).findIndex((k) => k.kode === kodeTarget);
  if (idx === -1) throw new Error('Data paket standar tidak ditemukan.');

  const [removed] = db.katalogStandar.splice(idx, 1);
  persistDb(db);

  appendActivityLog(
    'Hapus Master Tarif',
    `Paket standar ${removed.kode} (${removed.nama}) dihapus dari Master Data oleh ${actorName}.`,
    actorName
  );

  return removed;
};
