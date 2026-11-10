# TERA — Telecommunication Equipment Rental Application
### Sistem Informasi Manajemen Perangkat Telekomunikasi PT Utama Telekomindo


## 1. Identitas Kelompok & Pembagian Modul Fitur

Aplikasi ini dibangun menggunakan arsitektur modular dengan pembagian modul antarmuka:

| No | Modul / Fitur Utama | Halaman & Rute Aktif | File & Komponen Kunci | Deskripsi Teknis |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Autentikasi & Reset Sandi** | `/login`<br>`/forgot-password` | • `src/pages/LoginPage.jsx`<br>• `src/pages/ForgotPasswordPage.jsx`<br>• `public/api/users.json` | Validasi client-side, verifikasi Mock API users via Axios, dan notifikasi email real-time via REST API. |
| **2** | **Executive Dashboard & Visualisasi** | `/admin/dashboard` | • `src/pages/AdminDashboardPage.jsx`<br>• `src/components/BankCard.jsx`<br>• `src/components/WeeklyActivityChart.jsx`<br>• `src/components/ExpenseStatisticsChart.jsx`<br>• `src/components/BalanceHistoryChart.jsx`<br>• 5 Mock API Endpoints | Multi-fetch asinkron via `Promise.all` Axios, Ringkasan Finansial, Utilisasi Armada, 3 Grafik SVG Interaktif, Quick Transfer, dan Monitoring Site Mitra. |
| **3** | **Kelola & Monitoring Unit Radio** | `/admin/units` | • `src/pages/UnitsPage.jsx`<br>• `src/components/MyExpenseBarChart.jsx`<br>• `src/components/Pagination.jsx`<br>• `src/components/Modal.jsx`<br>• `public/api/units.json` | Filter multi-kategori, status tabulasi dinamis, pencarian instan, paginasi data tabel, bar chart bulanan biaya armada, dan modal inspeksi teknis. |
| **4** | **Master Data Mitra Korporat B2B** | `/admin/pelanggan` | • `src/pages/PelangganPage.jsx`<br>• `src/components/WilayahSelector.jsx`<br>• `public/api/pelanggan.json` | Integrasi Public API Wilayah Indonesia (EMSIFA) cascade 4 level (Provinsi, Kabupaten, Kecamatan, Kelurahan) via Fetch API, data tabel mitra B2B, status badge, dan detail modal. |
| **5** | **Navigation & Error Boundary** | Navigasi Global & Fallback | • `src/components/Navbar.jsx`<br>• `src/components/StatusStates.jsx`<br>• `src/pages/NotFoundPage.jsx` | Fixed responsive sidebar, topbar search & setting, dark/light theme switch, loading skeleton, error retry state, dan fallback 404. |

---

## 2. Struktur Direktori Proyek (Standar Vite React 18)

Struktur direktori 100% bersih mengikuti standar resmi Vite React tanpa modul atau pustaka di luar kriteria:

```text
TUBES_PPWEB/
├── node_modules/              # Dependensi pustaka npm
├── public/                    # Aset statis & Mock API JSON
│   ├── favicon.svg            # Favicon sistem TERA
│   ├── icons.svg              # SVG Icon sprite
│   └── api/                   # Endpoint Mock API (100% Dynamic Fetch via Axios)
│       ├── users.json         # Data pengguna & autentikasi
│       ├── units.json         # Master inventaris perangkat radio
│       ├── pelanggan.json     # Master data mitra korporat B2B
│       ├── kontrak.json       # Kontrak aktif penyewaan
│       ├── activity-logs.json # Log aktivitas sistem
│       └── invoices.json      # Arus kas faktur tagihan bulanan
├── src/                       # Source code React
│   ├── assets/                # Aset gambar & ilustrasi
│   ├── components/            # Komponen modular antarmuka
│   │   ├── BalanceHistoryChart.jsx     # Grafik SVG Smooth Spline Saldo & Arus Kas
│   │   ├── BankCard.jsx                # Kartu Ringkasan Operasional BankFlash Style
│   │   ├── ExpenseStatisticsChart.jsx  # Grafik SVG Pie/Donut Alokasi Operasional
│   │   ├── Icon.jsx                    # Komponen Icon SVG presisi
│   │   ├── Modal.jsx                   # Accessible dialog modal
│   │   ├── MyExpenseBarChart.jsx       # Grafik SVG Bar Bulanan Pemeliharaan
│   │   ├── Navbar.jsx                  # Header & 3 Nav Links Sidebar BankFlash
│   │   ├── Pagination.jsx              # Navigasi paginasi data tabel
│   │   ├── StatusBadge.jsx             # Indikator status visual
│   │   ├── StatusStates.jsx            # Loading Skeleton & Error State dengan Retry & Simulasi
│   │   ├── WeeklyActivityChart.jsx     # Grafik SVG Bar Mingguan Aktivitas Kas
│   │   └── WilayahSelector.jsx         # Integrasi Public API EMSIFA via Fetch API
│   ├── pages/                 # Halaman utama aplikasi (6 Halaman Terkoneksi)
│   │   ├── AdminDashboardPage.jsx      # Overview Dashboard
│   │   ├── ForgotPasswordPage.jsx      # Reset Sandi & Notifikasi Email
│   │   ├── LoginPage.jsx               # Autentikasi Pengguna
│   │   ├── NotFoundPage.jsx            # Fallback 404
│   │   ├── PelangganPage.jsx           # Master Data Pelanggan & EMSIFA API
│   │   └── UnitsPage.jsx               # Katalog & Kelola Unit Radio
│   ├── App.css                # CSS Flexbox, Grid, Media Queries & Custom Classes
│   ├── App.jsx                # Root Router aplikasi (React Router v6)
│   ├── index.css              # Variabel warna & Tailwind CSS directives
│   └── main.jsx               # Entry point aplikasi React 18
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

## 3. Panduan Menjalankan & Pengujian

### A. Langkah Instalasi & Menjalankan:
1. Masuk ke direktori proyek:
   ```bash
   cd TUBES_PPWEB
   ```
2. Pasang seluruh dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
4. Buka browser pada alamat `http://localhost:5173`.

### B. Kredensial Pengujian Autentikasi:
* **Email:** `admin@tera.com` (atau username `admin.tera`)
* **Kata Sandi:** `admin123`
* *(Tersedia tombol satu klik "Gunakan Akun Ini" pada kartu login untuk kemudahan pengujian).*

### C. Fitur Pengujian Error Handling (Untuk Kemudahan Penilaian Dosen):
Pada setiap halaman modul utama (Dashboard, Kelola Unit, Pelanggan, dan Login), terdapat tombol interaktif **"Tes Simulasi Error"**:
1. Klik tombol **"Tes Simulasi Error"** untuk mengaktifkan skenario galat API.
2. Halaman akan menampilkan **Error State UI** dengan banner pesan kesalahan yang jelas dan ramah pengguna (bukan layar blank).
3. Klik tombol **"Coba Lagi"** atau klik kembali tombol simulasi untuk memulihkan koneksi data normal secara instan.
