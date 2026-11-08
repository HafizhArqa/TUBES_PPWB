# TERA — Telecommunication Equipment Rental Application
### Sistem Informasi Manajemen Perangkat Telekomunikasi PT Utama Telekomindo

> **Tugas Besar I (UTS) — Perancangan dan Pemrograman Web**  
> **Status Repository:** Public Access & Clean Modern Frontend Stack  
> **Total Nilai Target:** 100 Poin (25 Poin Kelompok + 75 Poin Individu)

---

## 1. Identitas Kelompok & Pembagian Tugas

Berdasarkan pembagian tugas resmi anggota kelompok:

| No | Nama Anggota | Peran / Fitur Utama | Halaman & Rute Aktif | File & Komponen Kunci |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Zakaria** | **Fitur Manajemen Master Data** | `/admin/pelanggan` | • `src/pages/PelangganPage.jsx`<br>• `src/components/WilayahSelector.jsx` *(Fetch API EMSIFA)*<br>• `public/api/pelanggan.json` |
| **2** | **Hafizh Arqamilandri Wakhyudi** | **Fitur Login, Register, Forgot Password** | `/login`<br>`/register`<br>`/forgot-password` | • `src/pages/LoginPage.jsx`<br>• `src/pages/RegisterPage.jsx`<br>• `src/pages/ForgotPasswordPage.jsx`<br>• `public/api/users.json`<br>• *Integrasi REST API Notifikasi Email* |
| **3** | **Marta Safitri** | **Fitur Dashboard** | `/admin/dashboard` | • `src/pages/AdminDashboardPage.jsx`<br>• `src/components/AreaLineChart.jsx` *(Pure SVG)*<br>• `public/api/units.json`<br>• `public/api/pelanggan.json` |
| **4** | **Steven Taufik Fajar** | **Kelola Unit** | `/admin/units` | • `src/pages/UnitsPage.jsx`<br>• `public/api/units.json` |

---

## 2. Struktur Direktori Proyek

Struktur folder mengadopsi standar Vite React yang bersih, modular, dan sesuai spesifikasi tugas besar:

```text
TUBES_PPWEB/
├── node_modules/              # Dependensi pustaka npm
├── public/                    # Aset publik & Mock API JSON
│   ├── favicon.svg            # Favicon sistem TERA
│   ├── icons.svg              # SVG Icon sprite
│   └── api/                   # Mock API JSON (dikonsumsi via Axios)
│       ├── users.json         # Data pengguna & autentikasi
│       ├── units.json         # Master inventaris perangkat radio
│       └── pelanggan.json     # Master data mitra pelanggan B2B
├── src/                       # Source code React
│   ├── assets/                # Aset gambar & ilustrasi
│   │   └── react.svg
│   ├── components/            # Komponen antarmuka modular
│   │   ├── AreaLineChart.jsx  # Grafik SVG Interaktif tanpa library Chart.js (Marta)
│   │   ├── Icon.jsx           # SVG Icon dinamis
│   │   ├── Modal.jsx          # Accessible dialog modal
│   │   ├── Navbar.jsx         # Header & navigasi responsif admin
│   │   ├── Pagination.jsx     # Navigasi paginasi data tabel
│   │   ├── StatusBadge.jsx    # Indikator status visual
│   │   ├── StatusStates.jsx   # Loading Skeleton & Error State dengan tombol Retry
│   │   └── WilayahSelector.jsx# Integrasi Public API EMSIFA via Fetch API (Zakaria)
│   ├── pages/                 # Halaman aplikasi
│   │   ├── AdminDashboardPage.jsx # Dashboard metriks KPI (Marta Safitri)
│   │   ├── ForgotPasswordPage.jsx # Lupa kata sandi & kirim instruksi email (Hafizh)
│   │   ├── LoginPage.jsx          # Autentikasi sistem & notif email (Hafizh)
│   │   ├── NotFoundPage.jsx       # Halaman fallback 404
│   │   ├── PelangganPage.jsx      # Manajemen Master Data Pelanggan (Zakaria)
│   │   ├── RegisterPage.jsx       # Registrasi akun administrator baru (Hafizh)
│   │   └── UnitsPage.jsx          # Manajemen Kelola Unit Perangkat Radio (Steven)
│   ├── App.css                # CSS Flexbox, Grid, dan Media Queries responsif
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

## 3. Pemenuhan Spesifikasi & Rubrik Penilaian

| Kategori Kriteria | Implementasi & Bukti Teknis |
| :--- | :--- |
| **Framework JavaScript** | **React 18** (`react`, `react-dom`, `react-router-dom`) menggunakan Vite. |
| **Styling & Layout** | **CSS Flexbox & CSS Grid** dikombinasikan dengan **Tailwind CSS**. Menggunakan media queries untuk menjamin responsivitas di layar mobile, tablet, dan desktop. |
| **HTTP Client** | **Axios** (untuk konsumsi Mock API JSON) & **Fetch API** (untuk Public API EMSIFA & FormSubmit REST API). |
| **Data Source 1: Mock API** | File JSON (`public/api/users.json`, `units.json`, `pelanggan.json`) di-fetch secara dinamis menggunakan HTTP GET **Axios** (bukan di-render hardcoded langsung). |
| **Data Source 2: Public API** | **EMSIFA API Wilayah Indonesia** dikonsumsi secara real-time menggunakan **Fetch API** pada komponen `WilayahSelector.jsx` untuk memilih Provinsi & Kota secara dinamis. |
| **REST API Email** | Endpoint **FormSubmit REST API** mengirimkan email notifikasi login dan pemulihan kata sandi secara asinkron ke alamat email pengguna. |
| **Semantic HTML5 & A11y** | Struktur `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `role="alert"`, `aria-label`, dan focus visible styling. |
| **Client-Side Validation** | Form validasi interaktif di form Login, Register, Lupa Kata Sandi, Tambah Unit, dan Tambah Pelanggan dengan umpan balik pesan kesalahan yang jelas. |
| **Loading & Error States** | Shimmer Skeleton (`LoadingState`), Error UI Banner dengan tombol interaktif **Coba Lagi** (`ErrorState`), dan `EmptyState`. |

---

## 4. Panduan Menjalankan Aplikasi

1. Buka terminal di direktori proyek:
   ```bash
   cd C:\xampp\htdocs\TUBES_Pemweb\TUBES_PPWEB
   ```
2. Pasang dependensi jika belum:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
4. Buka peramban pada alamat lokal yang tertera (biasanya `http://localhost:5173`).

---

## 5. Kredensial Akun Administrator

* **Email:** `admin@tera.com` (atau username: `admin.tera`)
* **Kata Sandi:** `admin123`
* *Saat login berhasil, sistem memvalidasi kredensial via Axios Mock API dan mengirimkan email konfirmasi sesi ke alamat email pengguna.*
