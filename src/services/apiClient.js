import axios from 'axios';

const SIMULATE_ERROR_KEY = 'tera_simulate_api_error';

/**
 * Instance Axios terpusat untuk komunikasi HTTP ke Mock JSON API & External API
 */
export const apiClient = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Terjadi gangguan koneksi ke server API. Silakan periksa jaringan Anda dan coba kembali.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Helper pengaturan mode simulasi error jaringan (untuk pengujian Error State & Retry)
 */
export const isSimulatedApiErrorEnabled = () =>
  sessionStorage.getItem(SIMULATE_ERROR_KEY) === 'true';

export const setSimulatedApiError = (enabled) => {
  if (enabled) {
    sessionStorage.setItem(SIMULATE_ERROR_KEY, 'true');
  } else {
    sessionStorage.removeItem(SIMULATE_ERROR_KEY);
  }
};

/**
 * Simulasi latensi request HTTP async agar indikator Loading & Error State berjalan realistis
 */
export const simulateHttpLatency = async (ms = 240) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  if (isSimulatedApiErrorEnabled()) {
    throw new Error(
      'Gagal memuat data dari endpoint API (Simulasi Gangguan Jaringan Aktif). Klik "Coba Lagi" atau matikan mode simulasi error.'
    );
  }
};

