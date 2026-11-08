# TERA — Telecommunication Equipment Rental Application
### Sistem Informasi Manajemen Perangkat Telekomunikasi PT Utama Telekomindo

> **Tugas Besar I (UTS) — Perancangan dan Pemrograman Web**  
> **Status Repository:** Public Access & Clean Modern Frontend Stack  
> **Total Nilai Target:** 100 Poin (25 Poin Kelompok + 75 Poin Individu)

---

## 1. Identitas Kelompok & Pembagian Tugas

Berdasarkan kesepakatan pembagian tugas resmi anggota kelompok:

| No | Nama Anggota | Peran / Fitur Utama | Halaman & Rute Aktif | File & Komponen Kunci |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Zakaria** | **Fitur Manajemen Master Data** | `/admin/pelanggan` | • `src/pages/PelangganPage.jsx`<br>• `src/components/WilayahSelector.jsx` *(Fetch API EMSIFA)*<br>• `public/api/pelanggan.json` |
| **2** | **Hafizh Arqamilandri Wakhyudi** | **Fitur Login & Forgot Password** | `/login`<br>`/forgot-password` | • `src/pages/LoginPage.jsx`<br>• `src/pages/ForgotPasswordPage.jsx`<br>• `public/api/users.json`<br>• *REST API Email Notification* |
| **3** | **Marta Safitri** | **Fitur Dashboard** | `/admin/dashboard` | • `src/pages/AdminDashboardPage.jsx`<br>• `src/components/AreaLineChart.jsx` *(Pure SVG)*<br>• `public/api/units.json`<br>• `public/api/pelanggan.json`<br>• `public/api/kontrak.json`<br>• `public/api/activity-logs.json`<br>• `public/api/invoices.json` |
| **4** | **Steven Taufik Fajar** | **Kelola Unit** | `/admin/units` | • `src/pages/UnitsPage.jsx`<br>• `public/api/units.json` |

---

## 2. Struktur Direktori Proyek (Standar Vite React)

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
│   │   └── react.svg
│   ├── components/            # Komponen modular antarmuka
│   │   ├── AreaLineChart.jsx  # Grafik SVG Murni Interaktif Dark/Light Mode (Marta)
│   │   ├── Icon.jsx           # Render SVG Icon fleksibel
│   │   ├── Modal.jsx          # Accessible dialog modal
│   │   ├── Navbar.jsx         # Header tetap h-14 & Sidebar hover expandable
│   │   ├── Pagination.jsx     # Navigasi paginasi data tabel
│   │   ├── StatusBadge.jsx    # Indikator status visual
│   │   ├── StatusStates.jsx   # Loading Skeleton & Error State dengan Retry & Simulasi
│   │   └── WilayahSelector.jsx# Integrasi Public API EMSIFA via Fetch API (Zakaria)
│   ├── pages/                 # Halaman utama aplikasi (Flat & modular)
│   │   ├── AdminDashboardPage.jsx # Fitur Dashboard (Marta Safitri)
│   │   ├── ForgotPasswordPage.jsx # Fitur Forgot Password & Notif Email (Hafizh)
│   │   ├── LoginPage.jsx          # Fitur Login & Notif Email (Hafizh)
│   │   ├── NotFoundPage.jsx       # Fallback 404
│   │   ├── PelangganPage.jsx      # Fitur Master Data Pelanggan (Zakaria)
│   │   └── UnitsPage.jsx          # Fitur Kelola Unit (Steven Taufik Fajar)
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

## 3. Pemenuhan Rubrik Penilaian Kriteria Maksimal (100 Poin)

| Rubrik Penilaian | Kriteria Sempurna | Implementasi & Bukti Teknis pada Proyek |
| :--- | :--- | :--- |
| **Data Fetching (10 pts)** | Semua data dari fetch (Mock/Public API), Clean fetch implementation, reusable | **100% Data Fetching**: Seluruh data pada Dashboard, Kelola Unit, Pelanggan, dan Login diambil dari endpoint Mock API via HTTP GET **Axios** dan Public API EMSIFA via **Fetch API**. Tidak ada data hardcoded langsung tanpa fetch. |
| **Error Handling (10 pts)** | Error handling implemented (try-catch), Comprehensive, user-friendly messages | Seluruh pemanggilan API dibungkus blok `try ... catch`. Menangkap kegagalan jaringan, timeout, dan status HTTP non-200, menyajikan pesan error yang informatif dan ramah pengguna (mencegah layar blank). |
| **Loading & Error States (10 pts)** | Both implemented (loading & error states), Professional UX (skeleton, retry, clear messages) | **Loading State**: Animasi Shimmer Skeleton interaktif (`LoadingState`).<br>**Error State**: Banner error komprehensif lengkap dengan tombol **Coba Lagi (Retry)** dan fitur **Simulasi Gangguan API** untuk pengujian langsung oleh dosen. |
| **Modern CSS & Responsive (12 pts)** | Expert Flexbox/Grid usage, Comprehensive breakpoints, Perfect all devices | Menggabungkan **CSS Flexbox**, **CSS Grid**, dan **Tailwind CSS**. Dilengkapi 5 level media queries (Mobile, Tablet, Desktop) serta fitur **Dark Mode Toggle** otomatis. |
| **HTML Semantics & A11y (12 pts)** | Excellent semantic, Comprehensive accessibility, Fully functional keyboard navigation | Penggunaan tag semantik `<header>`, `<aside>`, `<nav>`, `<main id="main-content">`, `<section>`, `<article>`, `<figure>`, serta atribut ARIA (`role="alert"`, `aria-live`, `aria-modal`) dan focus-visible styling. |
| **Framework Implementation (15 pts)** | Framework proper, Component architecture, Professional state & props | Dibangun menggunakan **React 18** berbasis Vite 6, routing terstruktur SPA dengan React Router v6, custom hook, dan arsitektur komponen modular. |

---

## 4. Panduan Menjalankan & Pengujian

1. Masuk ke direktori proyek:
   ```bash
   cd C:\xampp\htdocs\TUBES_Pemweb\TUBES_PPWEB
   ```
2. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
3. Buka browser pada alamat `http://localhost:5173`.

### Kredensial Testing Mock API:
* **Email:** `admin@tera.com` (atau username `admin.tera`)
* **Kata Sandi:** `admin123`
* *Tersedia tombol satu klik "Gunakan Ini" pada kartu login untuk kemudahan pengujian.*

### Fitur Pengujian Error Handling (Untuk Penilaian Dosen):
Pada setiap halaman modul Admin (Dashboard, Kelola Unit, Pelanggan), terdapat tombol **"Tes Simulasi Error"**. Saat diklik:
1. Permintaan API sengaja digagalkan untuk memicu blok `catch`.
2. Antarmuka langsung menampilkan **Error State Banner** dengan pesan komprehensif.
3. Dosen atau penguji dapat menekan tombol **"Coba Lagi (Retry Fetch)"** atau **"Matikan Simulasi & Muat Ulang"** untuk melihat proses pemulihan data kembali normal secara instan.
