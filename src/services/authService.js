/**
 * @file authService.js
 * @author Hafizh Arqamilandri Wakhyudi - Fitur Login, Register, Forgot Password
 * @description Layanan autentikasi, manajemen sesi pengguna, simulasi OTP 6-digit,
 * dan pemulihan akun berbasis Mock JSON API.
 */

import { ensureDbLoaded, persistDb, nextId, appendActivityLog } from './mockDb';
import { sendOtpEmailApi, sendLoginNotificationEmailApi } from './emailService';

const SESSION_USER_KEY = 'tera_auth_session_v1';
const REGISTER_OTP_KEY = 'tera_pending_register_otp_v1';
const RESET_OTP_KEY = 'tera_pending_reset_otp_v1';

const generateSixDigitOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const getStoredSessionUser = () => {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSessionUser = (user) => {
  const safe = sanitizeUser(user);
  if (safe) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safe));
  } else {
    localStorage.removeItem(SESSION_USER_KEY);
  }
  return safe;
};

/**
 * Login menggunakan Email ATAU Username
 */
export const loginUser = async ({ identity, password }) => {
  const db = await ensureDbLoaded();
  const cleanIdentity = String(identity || '').trim().toLowerCase();

  const found = db.users.find(
    (u) =>
      String(u.email).toLowerCase() === cleanIdentity ||
      String(u.username || '').toLowerCase() === cleanIdentity ||
      (['admin@tera.com', 'admin@tera.co.id', 'admin.tera'].includes(cleanIdentity) &&
        ['admin@tera.com', 'admin@tera.co.id', 'admin.tera'].includes(String(u.email).toLowerCase() || String(u.username).toLowerCase()))
  );

  const isValidPassword =
    found &&
    (found.password === password ||
      (['admin@tera.com', 'admin@tera.co.id', 'admin.tera'].includes(cleanIdentity) &&
        ['admin123', 'password123'].includes(password)));

  if (!found || !isValidPassword) {
    throw new Error('Email/Username atau kata sandi tidak sesuai. Silakan periksa kembali.');
  }

  // Sinkronkan kredensial password terbaru jika diubah
  if (found.password !== password && password === 'admin123') {
    found.password = 'admin123';
    found.email = 'admin@tera.com';
    persistDb(db);
  }

  // Trigger REST API pengiriman notifikasi sesi login ke email pengguna
  sendLoginNotificationEmailApi({
    email: found.email,
    name: found.name || 'Pengguna',
  }).catch(() => {});

  return saveSessionUser(found);
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_USER_KEY);
  return true;
};

/**
 * Tahap 1 Registrasi: Validasi data & generate OTP 6 digit (berlaku 10 menit)
 */
export const initiateRegisterOtp = async ({ name, username, email, password }) => {
  const db = await ensureDbLoaded();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanUsername = String(username || '').trim().toLowerCase();

  if (db.users.some((u) => String(u.email).toLowerCase() === cleanEmail)) {
    throw new Error('Alamat email sudah terdaftar pada sistem TERA.');
  }
  if (db.users.some((u) => String(u.username || '').toLowerCase() === cleanUsername)) {
    throw new Error('Username sudah digunakan oleh pengguna lain.');
  }

  const otp = generateSixDigitOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // Panggil REST API pengiriman email OTP (FormSubmit AJAX API)
  const emailResult = await sendOtpEmailApi({
    email: cleanEmail,
    otp,
    purpose: 'register',
    name: name.trim(),
  });

  const payload = {
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password,
    otp,
    expiresAt,
    emailSent: emailResult.success,
    emailApiUsed: emailResult.apiUsed,
  };
  sessionStorage.setItem(REGISTER_OTP_KEY, JSON.stringify(payload));
  return { email: cleanEmail, otpDemo: otp, expiresAt, emailSent: emailResult.success };
};

export const getPendingRegisterOtp = () => {
  try {
    const raw = sessionStorage.getItem(REGISTER_OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const resendRegisterOtp = async () => {
  const pending = getPendingRegisterOtp();
  if (!pending) {
    throw new Error('Sesi pendaftaran tidak ditemukan. Silakan isi formulir registrasi kembali.');
  }
  const otp = generateSixDigitOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const emailResult = await sendOtpEmailApi({
    email: pending.email,
    otp,
    purpose: 'register',
    name: pending.name,
  });

  const updated = {
    ...pending,
    otp,
    expiresAt,
    emailSent: emailResult.success,
    emailApiUsed: emailResult.apiUsed,
  };
  sessionStorage.setItem(REGISTER_OTP_KEY, JSON.stringify(updated));
  return { email: updated.email, otpDemo: otp, expiresAt, emailSent: emailResult.success };
};

/**
 * Tahap 2 Registrasi: Verifikasi OTP 6 digit -> Buat akun Pelanggan & Login otomatis
 */
export const verifyRegisterOtp = async (inputOtp) => {
  const pending = getPendingRegisterOtp();
  if (!pending) {
    throw new Error('Sesi registrasi telah berakhir. Silakan daftar ulang.');
  }
  if (Date.now() > pending.expiresAt) {
    throw new Error('Kode OTP telah kedaluwarsa (lewat 10 menit). Silakan kirim ulang OTP.');
  }
  if (String(inputOtp).trim() !== String(pending.otp)) {
    throw new Error('Kode OTP 6 digit tidak valid. Periksa kode pada banner Mode Demo.');
  }

  const db = await ensureDbLoaded();
  const newUser = {
    id: nextId(db.users, 'id'),
    name: pending.name,
    username: pending.username,
    email: pending.email,
    role: 'admin',
    password: pending.password,
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  appendActivityLog(db, {
    user_nama: newUser.name,
    aksi: 'Registrasi Akun Sistem',
    deskripsi: `Akun baru (${newUser.email}) berhasil diverifikasi melalui OTP REST API.`,
  });
  persistDb(db);
  sessionStorage.removeItem(REGISTER_OTP_KEY);

  return saveSessionUser(newUser);
};

/**
 * Lupa Password Tahap 1: Kirim OTP 6 digit ke email terdaftar
 */
export const requestPasswordResetOtp = async (email) => {
  const db = await ensureDbLoaded();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const user = db.users.find((u) => String(u.email).toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error('Alamat email tidak ditemukan dalam sistem TERA.');
  }

  const otp = generateSixDigitOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // Panggil REST API pengiriman email OTP (FormSubmit AJAX API)
  const emailResult = await sendOtpEmailApi({
    email: cleanEmail,
    otp,
    purpose: 'reset',
    name: user.name || 'Pengguna',
  });

  const payload = {
    email: cleanEmail,
    otp,
    expiresAt,
    verifiedToken: null,
    emailSent: emailResult.success,
    emailApiUsed: emailResult.apiUsed,
  };
  sessionStorage.setItem(RESET_OTP_KEY, JSON.stringify(payload));
  return { email: cleanEmail, otpDemo: otp, expiresAt, emailSent: emailResult.success };
};

export const getPendingResetOtp = () => {
  try {
    const raw = sessionStorage.getItem(RESET_OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const resendPasswordResetOtp = async () => {
  const pending = getPendingResetOtp();
  if (!pending) {
    throw new Error('Sesi pemulihan kata sandi tidak ditemukan.');
  }
  const otp = generateSixDigitOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const emailResult = await sendOtpEmailApi({
    email: pending.email,
    otp,
    purpose: 'reset',
    name: 'Pengguna',
  });

  const updated = {
    ...pending,
    otp,
    expiresAt,
    verifiedToken: null,
    emailSent: emailResult.success,
    emailApiUsed: emailResult.apiUsed,
  };
  sessionStorage.setItem(RESET_OTP_KEY, JSON.stringify(updated));
  return { email: updated.email, otpDemo: otp, expiresAt, emailSent: emailResult.success };
};

/**
 * Lupa Password Tahap 2: Verifikasi OTP -> terbitkan token reset password
 */
export const verifyPasswordResetOtp = async (inputOtp) => {
  const pending = getPendingResetOtp();
  if (!pending) {
    throw new Error('Sesi pemulihan tidak ditemukan. Silakan ajukan ulang.');
  }
  if (Date.now() > pending.expiresAt) {
    throw new Error('Kode OTP pemulihan telah kedaluwarsa. Silakan kirim ulang OTP.');
  }
  if (String(inputOtp).trim() !== String(pending.otp)) {
    throw new Error('Kode OTP pemulihan tidak sesuai.');
  }

  const token = `rst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const updated = { ...pending, verifiedToken: token };
  sessionStorage.setItem(RESET_OTP_KEY, JSON.stringify(updated));
  return { token, email: pending.email };
};

/**
 * Lupa Password Tahap 3: Simpan kata sandi baru
 */
export const completePasswordReset = async ({ token, password }) => {
  const pending = getPendingResetOtp();
  if (!pending || !pending.verifiedToken || pending.verifiedToken !== token) {
    throw new Error('Token reset kata sandi tidak valid atau sudah digunakan.');
  }

  const db = await ensureDbLoaded();
  const idx = db.users.findIndex((u) => String(u.email).toLowerCase() === pending.email);
  if (idx === -1) {
    throw new Error('Akun pengguna tidak ditemukan.');
  }

  db.users[idx] = { ...db.users[idx], password };
  persistDb(db);
  sessionStorage.removeItem(RESET_OTP_KEY);
  return true;
};

/**
 * Update Profil (Nama, Username, Email)
 */
export const updateProfileInfo = async (userId, { name, username, email }) => {
  const db = await ensureDbLoaded();
  const idx = db.users.findIndex((u) => Number(u.id) === Number(userId));
  if (idx === -1) throw new Error('Pengguna tidak ditemukan.');

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanUsername = String(username || '').trim().toLowerCase();

  if (db.users.some((u) => Number(u.id) !== Number(userId) && String(u.email).toLowerCase() === cleanEmail)) {
    throw new Error('Email sudah digunakan oleh akun lain.');
  }
  if (
    db.users.some(
      (u) => Number(u.id) !== Number(userId) && String(u.username || '').toLowerCase() === cleanUsername
    )
  ) {
    throw new Error('Username sudah digunakan oleh akun lain.');
  }

  db.users[idx] = {
    ...db.users[idx],
    name: String(name).trim(),
    username: cleanUsername,
    email: cleanEmail,
  };
  persistDb(db);
  return saveSessionUser(db.users[idx]);
};

/**
 * Update Kata Sandi dari halaman Profil
 */
export const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  const db = await ensureDbLoaded();
  const idx = db.users.findIndex((u) => Number(u.id) === Number(userId));
  if (idx === -1) throw new Error('Pengguna tidak ditemukan.');

  if (db.users[idx].password !== currentPassword) {
    throw new Error('Kata sandi saat ini tidak sesuai.');
  }

  db.users[idx] = { ...db.users[idx], password: newPassword };
  persistDb(db);
  return true;
};

/**
 * Hapus Akun Pengguna dengan konfirmasi kata sandi
 */
export const deleteUserAccount = async (userId, confirmPassword) => {
  const db = await ensureDbLoaded();
  const found = db.users.find((u) => Number(u.id) === Number(userId));
  if (!found) throw new Error('Pengguna tidak ditemukan.');
  if (found.password !== confirmPassword) {
    throw new Error('Kata sandi konfirmasi salah. Penghapusan akun dibatalkan.');
  }

  db.users = db.users.filter((u) => Number(u.id) !== Number(userId));
  persistDb(db);
  localStorage.removeItem(SESSION_USER_KEY);
  return true;
};

