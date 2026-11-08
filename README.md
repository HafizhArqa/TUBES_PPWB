# TERA — Telecommunication Equipment Rental Application
### Sistem Informasi Penyewaan & Pengadaan Perangkat Telekomunikasi B2B PT Utama Telekomindo

> **Tugas Besar I (UTS) — Perancangan dan Pemrograman Web**  
> **Status Repository:** Public Access & Clean Modern Stack  
> **Total Nilai Target:** 100 Poin (25 Poin Kelompok + 75 Poin Individu)

---

## 1. Identitas Kelompok & Pembagian Tugas Resmi

Berdasarkan kesepakatan pembagian tugas anggota kelompok:

| No | Nama Anggota | Peran / Fitur Utama | Rute Halaman Aktif | File & Komponen Kunci |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Zakaria** | **Fitur Manajemen Master Data** | `/admin/pelanggan` | • `src/pages/admin/PelangganPage.jsx`<br>• `src/services/pelangganService.js`<br>• `src/components/WilayahSelector.jsx`<br>• `src/services/wilayahPublicApi.js` |
| **2** | **Hafizh Arqamilandri Wakhyudi** | **Fitur Login, Register, Forgot Password** | `/login`<br>`/register`<br>`/register/verify-otp`<br>`/forgot-password`<br>`/verify-otp`<br>`/reset-password/:token` | • `src/pages/auth/LoginPage.jsx`<br>• `src/pages/auth/RegisterPage.jsx`<br>• `src/pages/auth/VerifyRegisterOtpPage.jsx`<br>• `src/pages/auth/ForgotPasswordPage.jsx`<br>• `src/pages/auth/VerifyResetOtpPage.jsx`<br>• `src/pages/auth/ResetPasswordPage.jsx`<br>• `src/services/authService.js`<br>• `src/services/emailService.js` *(REST API Email)*<br>• `src/context/AuthContext.jsx` |
| **3** | **Marta Safitri** | **Fitur Dashboard** | `/admin/dashboard` | • `src/pages/admin/AdminDashboardPage.jsx`<br>• `src/components/AreaLineChart.jsx`<br>• `src/services/dashboardService.js` |
| **4** | **Steven Taufik Fajar** | **Kelola Unit** | `/admin/units` | • `src/pages/admin/UnitsPage.jsx`<br>• `src/services/unitService.js` |

*Catatan: Seluruh sistem difokuskan pada manajemen operasional Admin. Seluruh modul portal pelanggan, transaksi lanjutan, dan laporan tambahan diarsipkan dengan aman di dalam folder `100% finish/`.*

---

## 2. Struktur Folder Standar Vite

Struktur proyek mengikuti standar Vite React yang bersih dan modular:

```text
TUBES_PPWEB/
├── 100% finish/               # Arsip modul lanjutan & portal pelanggan
├── node_modules/              # Dependensi npm
├── public/                    # Aset statis & mock data
│   ├── favicon.svg            # Favicon aplikasi
│   ├── icons.svg              # SVG sprite icon set
│   └── api/                   # Seed endpoint JSON untuk Axios Mock API
├── src/                       # Source code React
│   ├── assets/                # Aset gambar & ilustrasi
│   │   └── react.svg
│   ├── components/            # Komponen UI modular
│   │   ├── AreaLineChart.jsx  # Grafik SVG murni (Marta Safitri)
│   │   ├── WilayahSelector.jsx# Integrasi Public API EMSIFA (Zakaria)
│   │   ├── Icon.jsx           # Render icon SVG
│   │   ├── Modal.jsx          # Accessible dialog modal
│   │   ├── Pagination.jsx     # Navigasi paginasi data
│   │   ├── StatusBadge.jsx    # Status indikator visual
│   │   └── StatusStates.jsx   # Loading Skeleton & Error State dengan tombol Retry
│   ├── context/               # React Context
│   │   └── AuthContext.jsx    # Sesi pengguna & feedback toast (Hafizh)
│   ├── layouts/               # Shell layout halaman
│   │   ├── AdminLayout.jsx    # Shell dashboard admin (aside sidebar + topbar)
│   │   └── AuthLayout.jsx     # Shell form autentikasi kartu
│   ├── pages/                 # Halaman aplikasi
│   │   ├── admin/             # Portal Admin
│   │   │   ├── AdminDashboardPage.jsx (Marta Safitri)
│   │   │   ├── PelangganPage.jsx      (Zakaria)
│   │   │   └── UnitsPage.jsx          (Steven Taufik Fajar)
│   │   ├── auth/              # Portal Autentikasi (Hafizh Arqamilandri W.)
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── VerifyRegisterOtpPage.jsx
│   │   │   └── VerifyResetOtpPage.jsx
│   │   └── NotFoundPage.jsx   # Halaman 404
│   ├── services/              # Logika data & HTTP Client
│   │   ├── apiClient.js       # Instance Axios dengan simulasi latensi & galat
│   │   ├── authService.js     # Layanan autentikasi & OTP (Hafizh)
│   │   ├── dashboardService.js# Layanan metrik KPI dashboard (Marta)
│   │   ├── mockDb.js          # Document store client-side via localStorage
│   │   ├── pelangganService.js# Layanan master data pelanggan (Zakaria)
│   │   ├── unitService.js     # Layanan inventaris radio (Steven)
│   │   └── wilayahPublicApi.js# Layanan Fetch API Wilayah Indonesia (Zakaria)
│   │   └── wilayahPublicApi.js# Layanan Fetch API Wilayah Indonesia (Zakaria)
│   ├── utils/
│   │   └── formatters.js      # Format mata uang Rupiah & tanggal Indonesia
│   ├── App.css                # CSS aplikasi (Grid, Flexbox, layout & media queries)
│   ├── App.jsx                # Router utama aplikasi
│   ├── index.css              # Variabel warna & Tailwind directives
│   └── main.jsx               # Entry point React 18
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 3. Pemenuhan Spesifikasi & Tech Stack UTS

Seluruh teknologi di luar kriteria resmi (seperti PHP/Laravel, Blade, MySQL, Bootstrap CSS/JS, Alpine.js, dan Chart.js) **telah dibersihkan dan dihapus sepenuhnya**. Aplikasi dibangun menggunakan stack resmi:

| Kategori Kriteria | Teknologi Terpilih | Bukti Implementasi pada Proyek |
| :--- | :--- | :--- |
| **JS Framework** | **React 18** (`react`, `react-dom`, `react-router-dom`) + **Vite 6** | Arsitektur SPA modern berbasis komponen fungsional, Custom Hooks, dan Context API. |
| **Modern Styling** | **CSS3 Murni (Custom Properties, Flexbox, CSS Grid)** + **Tailwind CSS** | Variabel warna dan tokens di `index.css`, layout shell & komponen di `App.css`, responsif di semua resolusi. |
| **HTTP Client** | **Axios** & **Fetch API** | Axios instance di `apiClient.js` dengan interceptor simulasi latensi dan Fetch API di `wilayahPublicApi.js`. |
| **Data Source 1 (Mock API)** | Endpoint JSON di `public/api/*.json` | Di-fetch secara asinkron via HTTP GET Axios dan disinkronkan ke client-side storage `mockDb.js`. |
| **Data Source 2 (Public API)** | **EMSIFA Wilayah Indonesia API** | Fetch real-time provinsi dan kabupaten/kota via HTTP Fetch API untuk form lokasi site pelanggan B2B. |
| **Grafik & Ikon** | **Pure SVG Interactive Chart & Inline SVG Icons** | `AreaLineChart.jsx` murni SVG (tanpa library eksternal) dan `Icon.jsx` SVG fleksibel. |
| **Semantic HTML5 & A11y** | Tag semantic lengkap & WCAG Standard | `<header>`, `<nav>`, `<main id="main-content">`, `<aside>`, `<section>`, `<article>`, `.skip-link`, `aria-live`, `aria-modal`, `:focus-visible`. |
| **State Handling & UI** | Loading, Error & Empty States | Skeleton shimmer (`LoadingState`), Error banner dengan tombol **Coba Lagi** (`ErrorState`), serta simulasi saklar gangguan API. |

---

## 4. Cara Menjalankan Aplikasi

1. Masuk ke direktori proyek:
   ```powershell
   cd C:\xampp\htdocs\TUBES_Pemweb\TUBES_PPWEB
   ```
2. Jalankan development server:
   ```powershell
   npm run dev
   ```
3. Buka URL yang ditampilkan di terminal (default: `http://localhost:5173/`).

**Kredensial Login Akun Resmi**:
* **Akun Administrator**:
  - Email / Username: `admin@tera.co.id` atau `admin.tera`
  - Password: `password123`
  - *Mengarahkan ke Dashboard Admin (`/admin/dashboard`)*
  - *Saat login, REST API email otomatis mengirimkan notifikasi sesi masuk ke email pengguna.*
* **Registrasi Mandiri**:
  - Pengguna dapat mendaftar langsung di `/register`, menerima kode verifikasi OTP via REST API Email, dan otomatis masuk ke Dashboard Admin.
