import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';
import { todayIsoDate } from '../utils/formatters';

const CART_KEY_PREFIX = 'tera_pelanggan_cart_v1_';

export const getCartItems = (userId) => {
  try {
    const raw = localStorage.getItem(`${CART_KEY_PREFIX}${userId || 'guest'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCartItems = (userId, items) => {
  localStorage.setItem(`${CART_KEY_PREFIX}${userId || 'guest'}`, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('tera-cart-updated'));
  return items;
};

export const addUnitToCart = (userId, unit, qty = 1) => {
  const current = getCartItems(userId);
  const existingIdx = current.findIndex((c) => Number(c.id_unit) === Number(unit.id_unit));
  const cleanQty = Math.max(1, Number(qty) || 1);

  if (existingIdx !== -1) {
    current[existingIdx].qty += cleanQty;
  } else {
    current.push({
      id_unit: unit.id_unit,
      kode_unit: unit.kode_unit,
      nama_unit: unit.nama_unit,
      kategori: unit.kategori,
      merk: unit.merk,
      harga_sewa: Number(unit.harga_sewa) || 0,
      foto_unit: unit.foto_unit,
      qty: cleanQty,
    });
  }
  return saveCartItems(userId, current);
};

export const updateCartItemQty = (userId, idUnit, qty) => {
  const current = getCartItems(userId);
  const cleanQty = Math.max(1, Number(qty) || 1);
  const next = current.map((item) =>
    Number(item.id_unit) === Number(idUnit) ? { ...item, qty: cleanQty } : item
  );
  return saveCartItems(userId, next);
};

export const removeCartItem = (userId, idUnit) => {
  const current = getCartItems(userId).filter((item) => Number(item.id_unit) !== Number(idUnit));
  return saveCartItems(userId, current);
};

export const clearCart = (userId) => saveCartItems(userId, []);

/**
 * Ambil daftar permohonan sewa milik pelanggan yang sedang login
 */
export const getCustomerRentalRequests = async (user) => {
  const db = await ensureDbLoaded();
  if (!user) return [];

  const list = (db.rentalRequests || [])
    .filter(
      (r) =>
        Number(r.id_user) === Number(user.id) ||
        (user.id_pelanggan && Number(r.id_pelanggan) === Number(user.id_pelanggan)) ||
        String(r.pic_email || '').toLowerCase() === String(user.email || '').toLowerCase()
    )
    .map((r) => {
      const items = (db.rentalItems || []).filter((it) => Number(it.id_request) === Number(r.id_request));
      return {
        ...r,
        total_unit: items.reduce((s, it) => s + (Number(it.jumlah) || 0), 0),
        jumlah_jenis: items.length,
      };
    })
    .sort((a, b) => Number(b.id_request) - Number(a.id_request));

  return list;
};

/**
 * Checkout Keranjang Sewa Pelanggan -> Buat Permohonan Sewa B2B Baru
 */
export const submitCustomerRentalProposal = async (user, payload) => {
  const db = await ensureDbLoaded();
  const cart = getCartItems(user?.id);
  if (cart.length === 0) {
    throw new Error('Keranjang pengajuan sewa masih kosong. Pilih perangkat di Katalog terlebih dahulu.');
  }

  let idPelanggan = user?.id_pelanggan || null;
  if (!idPelanggan) {
    const existingPelanggan = (db.pelanggan || []).find(
      (p) => p.nama_perusahaan.toLowerCase() === String(payload.nama_klien || '').trim().toLowerCase()
    );
    if (existingPelanggan) {
      idPelanggan = existingPelanggan.id_pelanggan;
    } else {
      idPelanggan = nextId(db.pelanggan, 'id_pelanggan');
      db.pelanggan.unshift({
        id_pelanggan: idPelanggan,
        nama_perusahaan: String(payload.nama_klien).trim(),
        npwp: String(payload.npwp || '').trim(),
        pic_nama: String(payload.pic_nama).trim(),
        pic_jabatan: 'Perwakilan Pengadaan Portal',
        pic_telepon: String(payload.pic_telepon).trim(),
        pic_email: String(payload.pic_email || user?.email || '').trim(),
        alamat_kantor: String(payload.lokasi_site).trim(),
        status_aktif: 'Aktif',
        created_at: new Date().toISOString(),
      });
    }
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const newReqId = nextId(db.rentalRequests, 'id_request');
  const kodeRequest = `REQ/${stamp}/${String(newReqId).padStart(4, '0')}`;

  const durasiBulan = Math.max(1, Number(payload.durasi_sewa_bulan) || 12);
  const biayaBulanan = cart.reduce((s, c) => s + (Number(c.harga_sewa) || 0) * (Number(c.qty) || 1), 0);
  const estimasiTotal = biayaBulanan * durasiBulan;

  const newRequest = {
    id_request: newReqId,
    kode_request: kodeRequest,
    tipe_transaksi: 'sewa',
    id_user: user?.id || null,
    id_pelanggan: idPelanggan,
    id_kontrak: null,
    nama_klien: String(payload.nama_klien).trim(),
    pic_nama: String(payload.pic_nama).trim(),
    pic_telepon: String(payload.pic_telepon).trim(),
    pic_email: String(payload.pic_email || user?.email || '').trim(),
    lokasi_site: String(payload.lokasi_site).trim(),
    durasi_sewa_bulan: durasiBulan,
    estimasi_biaya_bulanan: biayaBulanan,
    estimasi_total: estimasiTotal,
    status: 'Baru',
    tahap_proses: 'Permohonan Sewa Masuk — Menunggu Tinjauan Engineering & Komersial TERA',
    catatan_pelanggan: String(payload.catatan_pelanggan || '').trim(),
    catatan_internal: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.rentalRequests.unshift(newRequest);

  cart.forEach((c) => {
    db.rentalItems.push({
      id_item: nextId(db.rentalItems, 'id_item'),
      id_request: newReqId,
      id_addendum: null,
      id_unit: c.id_unit,
      kode_unit_snapshot: c.kode_unit,
      nama_unit_snapshot: c.nama_unit,
      jumlah: c.qty,
      harga_sewa_snapshot: c.harga_sewa,
      subtotal_per_bulan: c.harga_sewa * c.qty,
      catatan: 'Pengajuan via Portal Pelanggan',
    });
  });

  db.penawaran.push({
    id_penawaran: nextId(db.penawaran, 'id_penawaran'),
    id_request: newReqId,
    nomor_penawaran_internal: `INT/QUO/${stamp}/${String(newReqId).padStart(3, '0')}`,
    tanggal_penawaran_internal: todayIsoDate(),
    nilai_penawaran_internal: estimasiTotal,
    catatan_internal: 'Draft otomatis dari permohonan portal pelanggan.',
    nomor_penawaran_resmi: '',
    tanggal_penawaran_resmi: '',
    nilai_penawaran_resmi: estimasiTotal,
    file_penawaran_resmi: '',
    status_lelang: 'Menunggu',
    tanggal_hasil_lelang: '',
    file_hasil_lelang: '',
    catatan_lelang: '',
  });

  db.instalasi.push({
    id_instalasi: nextId(db.instalasi, 'id_instalasi'),
    id_request: newReqId,
    lokasi_instalasi: newRequest.lokasi_site,
    tanggal_mulai_rencana: '',
    tanggal_selesai_rencana: '',
    tanggal_selesai_aktual: '',
    status_instalasi: 'Belum Dimulai',
    file_ba_instalasi: '',
    catatan_pekerjaan: '',
  });

  appendActivityLog(db, {
    id_request: newReqId,
    user_nama: newRequest.pic_nama,
    aksi: 'Pengajuan Permohonan Sewa Baru',
    deskripsi: `${newRequest.nama_klien} mengajukan permohonan sewa ${kodeRequest} (${durasiBulan} bulan) untuk lokasi ${newRequest.lokasi_site}.`,
  });

  persistDb(db);
  clearCart(user?.id);
  return newRequest;
};

