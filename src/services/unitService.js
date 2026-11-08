/**
 * @file unitService.js
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Layanan pengelolaan data inventaris unit perangkat radio telekomunikasi,
 * filter & pencarian, auto-generate kode unit, audit mutasi status, dan integrasi Mock API.
 */

import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';

const CATEGORY_PREFIX = {
  Repeater: 'RPT',
  'Radio Base': 'RBS',
  'Radio HT': 'RHT',
  'Radio HF SSB': 'SSB',
};

const DEFAULT_IMAGE_BY_CATEGORY = {
  Repeater: '/images/units/repeater-slr5300.svg',
  'Radio Base': '/images/units/radiobase-m8668i.svg',
  'Radio HT': '/images/units/ht-p6620i.svg',
  'Radio HF SSB': '/images/units/hf-barrett4050.svg',
};

export const generateNextUnitCode = (units = [], kategori = 'Repeater') => {
  const prefix = CATEGORY_PREFIX[kategori] || 'UNT';
  const nextNum = nextId(units, 'id_unit');
  return `UTR-${prefix}-${String(nextNum).padStart(3, '0')}`;
};

export const getUnitsData = async ({ search = '', kategori = 'Semua', status = 'Semua' } = {}) => {
  const db = await ensureDbLoaded();
  const q = String(search || '').trim().toLowerCase();

  const summary = {
    total: db.units.length,
    tersedia: db.units.filter((u) => u.status_unit === 'Tersedia').length,
    disewa: db.units.filter((u) => u.status_unit === 'Disewa').length,
    maintenance: db.units.filter((u) => u.status_unit === 'Maintenance' || u.status_unit === 'Rusak').length,
    rusak: db.units.filter((u) => u.status_unit === 'Rusak').length,
  };

  const filtered = db.units
    .filter((u) => {
      if (kategori && kategori !== 'Semua' && u.kategori !== kategori) return false;
      if (status && status !== 'Semua' && u.status_unit !== status) return false;
      if (q) {
        const hay = `${u.kode_unit} ${u.nama_unit} ${u.merk} ${u.kategori} ${u.frekuensi || ''} ${u.lokasi || ''} ${u.klien || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.id_unit) - Number(a.id_unit));

  return {
    units: filtered,
    allUnits: db.units,
    summary,
  };
};

export const getUnitWithHistory = async (idUnit) => {
  const db = await ensureDbLoaded();
  const unit = db.units.find((u) => Number(u.id_unit) === Number(idUnit));
  if (!unit) throw new Error('Data unit perangkat tidak ditemukan.');

  const history = (db.unitHistory || [])
    .filter((h) => Number(h.id_unit) === Number(idUnit))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { unit, history };
};

export const createUnitItem = async (payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const cleanCode = String(payload.kode_unit || '').trim() || generateNextUnitCode(db.units, payload.kategori);

  if (db.units.some((u) => String(u.kode_unit).toLowerCase() === cleanCode.toLowerCase())) {
    throw new Error(`Kode unit "${cleanCode}" sudah terdaftar di inventaris.`);
  }

  const newUnit = {
    id_unit: nextId(db.units, 'id_unit'),
    kode_unit: cleanCode,
    nama_unit: String(payload.nama_unit).trim(),
    kategori: payload.kategori || 'Repeater',
    merk: String(payload.merk || 'Motorola').trim(),
    frekuensi: String(payload.frekuensi || 'VHF/UHF').trim(),
    harga_sewa: Number(payload.harga_sewa) || 0,
    harga_jual: Number(payload.harga_jual) || 0,
    status_unit: payload.status_unit || 'Tersedia',
    lokasi: String(payload.lokasi || 'Gudang Pusat Cilandak, Jakarta Selatan').trim(),
    klien: payload.status_unit === 'Disewa' ? String(payload.klien || '').trim() || null : null,
    foto_unit: payload.foto_unit || DEFAULT_IMAGE_BY_CATEGORY[payload.kategori] || '/images/units/repeater-slr5300.svg',
    spesifikasi: String(payload.spesifikasi || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.units.unshift(newUnit);
  db.unitHistory.unshift({
    id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
    id_unit: newUnit.id_unit,
    status_sebelum: 'Baru',
    status_sesudah: newUnit.status_unit,
    lokasi: newUnit.lokasi,
    klien: newUnit.klien,
    keterangan: 'Registrasi unit baru ke inventaris PT Utama Telekomindo',
    diubah_oleh: actorName,
    created_at: new Date().toISOString(),
  });

  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Penambahan Unit Inventaris',
    deskripsi: `Menambahkan perangkat baru [${newUnit.kode_unit}] ${newUnit.nama_unit}.`,
  });

  persistDb(db);
  return newUnit;
};

export const updateUnitItem = async (idUnit, payload, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const idx = db.units.findIndex((u) => Number(u.id_unit) === Number(idUnit));
  if (idx === -1) throw new Error('Unit tidak ditemukan.');

  const prev = db.units[idx];
  const cleanCode = String(payload.kode_unit || prev.kode_unit).trim();
  if (
    db.units.some(
      (u) => Number(u.id_unit) !== Number(idUnit) && String(u.kode_unit).toLowerCase() === cleanCode.toLowerCase()
    )
  ) {
    throw new Error(`Kode unit "${cleanCode}" sudah dipakai unit lain.`);
  }

  const nextStatus = payload.status_unit || prev.status_unit;
  const updated = {
    ...prev,
    kode_unit: cleanCode,
    nama_unit: String(payload.nama_unit ?? prev.nama_unit).trim(),
    kategori: payload.kategori || prev.kategori,
    merk: String(payload.merk ?? prev.merk).trim(),
    frekuensi: String(payload.frekuensi ?? prev.frekuensi).trim(),
    harga_sewa: Number(payload.harga_sewa ?? prev.harga_sewa) || 0,
    harga_jual: Number(payload.harga_jual ?? prev.harga_jual) || 0,
    status_unit: nextStatus,
    lokasi: String(payload.lokasi ?? prev.lokasi).trim(),
    klien: nextStatus === 'Disewa' ? String(payload.klien ?? prev.klien ?? '').trim() || null : null,
    foto_unit: payload.foto_unit || prev.foto_unit,
    spesifikasi: String(payload.spesifikasi ?? prev.spesifikasi ?? '').trim(),
    updated_at: new Date().toISOString(),
  };

  db.units[idx] = updated;

  if (prev.status_unit !== updated.status_unit || prev.lokasi !== updated.lokasi) {
    db.unitHistory.unshift({
      id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
      id_unit: updated.id_unit,
      status_sebelum: prev.status_unit,
      status_sesudah: updated.status_unit,
      lokasi: updated.lokasi,
      klien: updated.klien,
      keterangan: payload.keterangan || 'Pembaruan data & status perangkat melalui Kelola Unit.',
      diubah_oleh: actorName,
      created_at: new Date().toISOString(),
    });
  }

  persistDb(db);
  return updated;
};

export const updateQuickUnitStatus = async (
  idUnit,
  { status_unit, lokasi, klien, keterangan },
  actorName = 'Admin TERA'
) => {
  const db = await ensureDbLoaded();
  const idx = db.units.findIndex((u) => Number(u.id_unit) === Number(idUnit));
  if (idx === -1) throw new Error('Unit tidak ditemukan.');

  const prev = db.units[idx];
  const nextLokasi =
    status_unit === 'Tersedia' && (!lokasi || lokasi === prev.lokasi)
      ? 'Gudang Pusat Cilandak, Jakarta Selatan'
      : String(lokasi || prev.lokasi).trim();

  const updated = {
    ...prev,
    status_unit,
    lokasi: nextLokasi,
    klien: status_unit === 'Disewa' ? String(klien || prev.klien || '').trim() || null : null,
    updated_at: new Date().toISOString(),
  };

  db.units[idx] = updated;

  db.unitHistory.unshift({
    id_riwayat: nextId(db.unitHistory, 'id_riwayat'),
    id_unit: updated.id_unit,
    status_sebelum: prev.status_unit,
    status_sesudah: status_unit,
    lokasi: updated.lokasi,
    klien: updated.klien,
    keterangan: String(keterangan || `Perubahan status dari ${prev.status_unit} ke ${status_unit}`).trim(),
    diubah_oleh: actorName,
    created_at: new Date().toISOString(),
  });

  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Pembaruan Status Fisik Unit',
    deskripsi: `Unit [${updated.kode_unit}] diubah dari ${prev.status_unit} menjadi ${status_unit}.`,
  });

  persistDb(db);
  return updated;
};

export const deleteUnitItem = async (idUnit, actorName = 'Admin TERA') => {
  const db = await ensureDbLoaded();
  const found = db.units.find((u) => Number(u.id_unit) === Number(idUnit));
  if (!found) throw new Error('Unit tidak ditemukan.');
  if (found.status_unit === 'Disewa') {
    throw new Error('Unit sedang berstatus "Disewa" pada kontrak aktif. Selesaikan sewa terlebih dahulu sebelum menghapus.');
  }

  db.units = db.units.filter((u) => Number(u.id_unit) !== Number(idUnit));
  db.unitHistory = (db.unitHistory || []).filter((h) => Number(h.id_unit) !== Number(idUnit));

  appendActivityLog(db, {
    user_nama: actorName,
    aksi: 'Penghapusan Unit Inventaris',
    deskripsi: `Menghapus unit [${found.kode_unit}] ${found.nama_unit} dari inventaris.`,
  });

  persistDb(db);
  return true;
};

