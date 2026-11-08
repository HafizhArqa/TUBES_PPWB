/**
 * Format angka ke mata uang Rupiah Indonesia (contoh: Rp 13.600.000)
 */
export const formatRupiah = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format ringkas Rupiah untuk sumbu grafik & badge (contoh: Rp 334,9 Jt / Rp 1,2 M)
 */
export const formatCompactRupiah = (value) => {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} Jt`;
  }
  if (Math.abs(num) >= 1_000) {
    return `Rp ${Math.round(num / 1_000)} Rb`;
  }
  return formatRupiah(num);
};

/**
 * Format tanggal YYYY-MM-DD atau ISO ke format Indonesia (contoh: 08 Nov 2026)
 */
export const formatDateId = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format tanggal & jam lengkap (contoh: 08 Nov 2026, 14:20)
 */
export const formatDateTimeId = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Ambil 2 huruf inisial korporat tanpa awalan PT / CV / TBK
 */
export const getCorporateInitials = (name = '') => {
  const cleaned = String(name)
    .replace(/\b(PT\.?|CV\.?|TBK\.?|PERSERO|UD\.?)\b/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

/**
 * Tambah bulan ke string tanggal YYYY-MM-DD
 */
export const addMonthsToDate = (dateStr, months) => {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString().slice(0, 10);
  const d = new Date(base);
  d.setMonth(d.getMonth() + Number(months || 0));
  return d.toISOString().slice(0, 10);
};

/**
 * Hitung selisih bulan antara dua tanggal YYYY-MM-DD (minimal 1)
 */
export const diffMonthsBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return 12;
  const s = new Date(`${startStr}T00:00:00`);
  const e = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 12;
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return Math.max(1, months);
};

/**
 * Tanggal hari ini dalam format YYYY-MM-DD
 */
export const todayIsoDate = () => new Date().toISOString().slice(0, 10);

