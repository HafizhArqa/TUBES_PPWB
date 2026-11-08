/**
 * @file emailService.js
 * @description Layanan integrasi REST API pengiriman email notifikasi kode verifikasi OTP.
 * Menggunakan FormSubmit AJAX Endpoint (Public REST API tanpa perlu API key).
 */

export const sendOtpEmailApi = async ({ email, otp, purpose = 'register', name = 'Pengguna' }) => {
  const isRegister = purpose === 'register';
  const subject = isRegister
    ? `[TERA B2B] Kode Verifikasi OTP Pendaftaran Akun: ${otp}`
    : `[TERA B2B] Kode OTP Pemulihan Kata Sandi: ${otp}`;

  const purposeText = isRegister ? 'verifikasi pendaftaran akun baru' : 'pemulihan kata sandi akun Anda';

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'box',
        app_name: 'PT Utama Telekomindo (TERA B2B Portal)',
        nama_penerima: name,
        email_tujuan: email,
        kode_otp: otp,
        keperluan: purposeText,
        berlaku_hingga: '10 Menit',
        pesan: `Halo ${name},\n\nKode verifikasi OTP Anda untuk ${purposeText} adalah: ${otp}.\n\nKode ini berlaku selama 10 menit. Harap jaga kerahasiaan kode ini.\n\nSalam,\nPT Utama Telekomindo (TERA)`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { success: true, apiUsed: 'FormSubmit REST API', data };
    } else {
      return {
        success: false,
        apiUsed: 'FormSubmit REST API',
        error: data.message || `HTTP ${response.status}`,
      };
    }
  } catch (err) {
    console.warn('[EmailAPI] Pengiriman email via REST API:', err.message);
    return {
      success: false,
      apiUsed: 'FormSubmit REST API (Fallback Simulasi)',
      error: err.message,
    };
  }
};

