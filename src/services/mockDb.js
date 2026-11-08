import { apiClient, simulateHttpLatency } from './apiClient';

const DB_STORAGE_KEY = 'tera_uts_b2b_db_v1';

const ENDPOINT_MAP = {
  users: '/api/users.json',
  units: '/api/units.json',
  unitHistory: '/api/unit-history.json',
  pelanggan: '/api/pelanggan.json',
  kontrak: '/api/kontrak.json',
  addendum: '/api/addendum.json',
  rentalRequests: '/api/rental-requests.json',
  rentalItems: '/api/rental-items.json',
  penawaran: '/api/penawaran.json',
  instalasi: '/api/instalasi.json',
  dokumen: '/api/dokumen.json',
  invoices: '/api/invoices.json',
  pembayaranDetail: '/api/pembayaran-detail.json',
  activityLogs: '/api/activity-logs.json',
  katalogStandar: '/api/katalog-standar.json',
};

let bootstrapPromise = null;

/**
 * Mengambil seluruh data awal melalui HTTP GET menggunakan Axios dari /api/*.json
 * (Tidak di-import langsung, sesuai spesifikasi Tugas Besar Pemrograman Web)
 */
const fetchAllSeedCollections = async () => {
  const entries = Object.entries(ENDPOINT_MAP);
  const responses = await Promise.all(
    entries.map(async ([key, url]) => {
      const response = await apiClient.get(url);
      return [key, response.data];
    })
  );

  const dbObject = Object.fromEntries(responses);
  dbObject._meta = {
    version: '1.0.0',
    seededAt: new Date().toISOString(),
  };
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbObject));
  return dbObject;
};

/**
 * Pastikan database lokal telah di-bootstrap dari Mock JSON API
 */
export const ensureDbLoaded = async ({ skipLatency = false } = {}) => {
  if (!skipLatency) {
    await simulateHttpLatency(220);
  }

  const raw = localStorage.getItem(DB_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.units && parsed.users) {
        // Sinkronisasi otomatis kredensial admin ke admin@tera.com / admin123
        const adminUser = parsed.users.find(
          (u) => u.username === 'admin.tera' || u.email === 'admin@tera.co.id' || u.email === 'admin@tera.com'
        );
        if (adminUser) {
          adminUser.email = 'admin@tera.com';
          adminUser.password = 'admin123';
          localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem(DB_STORAGE_KEY);
    }
  }

  if (!bootstrapPromise) {
    bootstrapPromise = fetchAllSeedCollections().finally(() => {
      bootstrapPromise = null;
    });
  }
  return bootstrapPromise;
};

/**
 * Simpan perubahan seluruh state database ke localStorage
 */
export const persistDb = (db) => {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  return db;
};

/**
 * Reset seluruh data kembali ke seed awal dengan fetch ulang /api/*.json via Axios
 */
export const resetMockDatabase = async () => {
  localStorage.removeItem(DB_STORAGE_KEY);
  return fetchAllSeedCollections();
};

/**
 * Generator Primary Key berurutan berikutnya
 */
export const nextId = (collection = [], idField = 'id') => {
  if (!Array.isArray(collection) || collection.length === 0) return 1;
  return collection.reduce((max, item) => Math.max(max, Number(item[idField]) || 0), 0) + 1;
};

/**
 * Tambahkan entri Audit Trail / Activity Log baru
 */
export const appendActivityLog = (db, { id_request = null, user_nama = 'Sistem TERA', aksi, deskripsi }) => {
  const newLog = {
    id_log: nextId(db.activityLogs, 'id_log'),
    id_request,
    user_nama,
    aksi,
    deskripsi,
    created_at: new Date().toISOString(),
  };
  db.activityLogs = [newLog, ...(db.activityLogs || [])];
  return newLog;
};

