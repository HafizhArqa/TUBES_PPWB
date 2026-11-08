import { apiClient } from './apiClient';

const EMSIFA_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const FALLBACK_REGENCIES = {
  '16': [
    { id: '1603', name: 'KABUPATEN MUARA ENIM' },
    { id: '1604', name: 'KABUPATEN LAHAT' },
    { id: '1671', name: 'KOTA PALEMBANG' },
  ],
  '31': [
    { id: '3171', name: 'KOTA JAKARTA SELATAN' },
    { id: '3172', name: 'KOTA JAKARTA TIMUR' },
    { id: '3173', name: 'KOTA JAKARTA PUSAT' },
    { id: '3175', name: 'KOTA JAKARTA UTARA' },
  ],
  '32': [
    { id: '3216', name: 'KABUPATEN BEKASI' },
    { id: '3273', name: 'KOTA BANDUNG' },
    { id: '3275', name: 'KOTA BEKASI' },
  ],
  '33': [
    { id: '3301', name: 'KABUPATEN CILACAP' },
    { id: '3374', name: 'KOTA SEMARANG' },
  ],
  '35': [
    { id: '3578', name: 'KOTA SURABAYA' },
    { id: '3525', name: 'KABUPATEN GRESIK' },
  ],
  '36': [
    { id: '3672', name: 'KOTA CILEGON' },
    { id: '3671', name: 'KOTA TANGERANG' },
  ],
  '62': [
    { id: '6202', name: 'KABUPATEN KOTAWARINGIN TIMUR' },
    { id: '6271', name: 'KOTA PALANGKA RAYA' },
  ],
  '64': [
    { id: '6402', name: 'KABUPATEN KUTAI KARTANEGARA' },
    { id: '6471', name: 'KOTA BALIKPAPAN' },
  ],
  '72': [
    { id: '7206', name: 'KABUPATEN MOROWALI' },
    { id: '7271', name: 'KOTA PALU' },
  ],
  '73': [
    { id: '7324', name: 'KABUPATEN LUWU TIMUR' },
    { id: '7371', name: 'KOTA MAKASSAR' },
  ],
  '91': [
    { id: '9109', name: 'KABUPATEN MIMIKA' },
    { id: '9171', name: 'KOTA JAYAPURA' },
  ],
};

/**
 * Mengambil daftar Provinsi Indonesia dari Public API Eksternal (EMSIFA)
 * menggunakan Fetch API dengan fallback otomatis ke Mock JSON API via Axios.
 */
export const fetchProvincesPublicApi = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(`${EMSIFA_BASE}/provinces.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { data, source: 'Public API (emsifa.com)' };
  } catch {
    const fallback = await apiClient.get('/api/provinces-fallback.json');
    return { data: fallback.data || [], source: 'Mock JSON Fallback (/api/provinces-fallback.json)' };
  }
};

/**
 * Mengambil daftar Kabupaten/Kota berdasarkan ID Provinsi dari Public API Eksternal
 */
export const fetchRegenciesPublicApi = async (provinceId) => {
  if (!provinceId) return { data: [], source: 'idle' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(`${EMSIFA_BASE}/regencies/${provinceId}.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { data, source: 'Public API (emsifa.com)' };
  } catch {
    return {
      data: FALLBACK_REGENCIES[String(provinceId)] || [
        { id: `${provinceId}01`, name: 'KAWASAN INDUSTRI / SITE UTAMA' },
      ],
      source: 'Offline Fallback',
    };
  }
};

