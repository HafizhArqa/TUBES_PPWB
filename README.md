# TERA — Telecommunication Equipment Rental Application
### Sistem Informasi Penyewaan & Pengadaan Perangkat Telekomunikasi B2B PT Utama Telekomindo

> **Tugas Besar I (UTS) — Perancangan dan Pemrograman Web**  
> **Institusi:** Program Studi Informatika / Sistem Informasi  
> **Status Repository:** Public Access & Verified Tech Stack  
> **Total Nilai Target:** 100 Poin (25 Poin Kelompok + 75 Poin Individu)

---

## 1. Identitas Kelompok & Pembagian Tugas Resmi

Berdasarkan kesepakatan pembagian tugas anggota kelompok:

| No | Nama Anggota | Peran / Fitur Utama | Rute Halaman Utama | File Kunci |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Zakaria** | **Fitur Manajemen Master Data** | `/admin/pelanggan`<br>`/admin/master-tarif` | `PelangganPage.jsx`<br>`MasterTarifPage.jsx`<br>`masterDataService.js`<br>`pelangganService.js`<br>`WilayahSelector.jsx` |
| **2** | **Hafizh Arqamilandri Wakhyudi** | **Fitur Login, Register, Forgot Password** | `/login`<br>`/register`<br>`/register/verify-otp`<br>`/forgot-password`<br>`/verify-otp`<br>`/reset-password/:token`<br>`/profile` | `LoginPage.jsx`<br>`RegisterPage.jsx`<br>`VerifyRegisterOtpPage.jsx`<br>`ForgotPasswordPage.jsx`<br>`VerifyResetOtpPage.jsx`<br>`ResetPasswordPage.jsx`<br>`ProfilePage.jsx`<br>`authService.js`<br>`AuthContext.jsx` |
| **3** | **Marta Safitri** | **Fitur Dashboard** | `/admin/dashboard`<br>`/pelanggan/dashboard`<br>`/admin/laporan-penyewaan`<br>`/admin/laporan-pendapatan` | `AdminDashboardPage.jsx`<br>`PelangganDashboardPage.jsx`<br>`AreaLineChart.jsx` (Pure SVG)<br>`laporanService.js`<br>`LaporanPenyewaanPage.jsx`<br>`LaporanPendapatanPage.jsx` |
| **4** | **Steven Taufik Fajar** | **Kelola Unit** | `/admin/units`<br>`/admin/status-unit`<br>`/pelanggan/katalog` | `UnitsPage.jsx` (CRUD + Riwayat)<br>`StatusUnitPage.jsx` (Grid/Table)<br>`unitService.js`<br>`KatalogPage.jsx` |

---

## 2. Pemenuhan Spesifikasi & Tech Stack UTS

Seluruh teknologi di luar kriteria resmi (seperti PHP/Laravel, Blade, MySQL/SQLite, Bootstrap CSS/JS, Popper, `bootstrap-icons`, Alpine.js, dan Chart.js) **telah dibersihkan dan dihapus sepenuhnya**. Aplikasi dibangun menggunakan stack resmi:

| Kategori Kriteria | Teknologi Terpilih | Bukti Implementasi pada Proyek |
| :--- | :--- | :--- |
| **JS Framework** | **React 18** (`react`, `react-dom`, `react-router-dom`) + **Vite 6** | Arsitektur SPA modern berbasis komponen, Custom Hooks, dan Context API. |
| **Modern Styling** | **CSS3 Murni (Custom Properties, Flexbox, CSS Grid)** + **Tailwind CSS** | Variabel warna di `variables.css`, grid layout kompleks di `layout.css`, responsif di `responsive.css`. |
| **HTTP Client** | **Axios** & **Fetch API** | Axios instance di `apiClient.js` dengan interceptor simulasi latensi dan Fetch API di `wilayahPublicApi.js`. |
| **Data Source 1 (Mock API)** | 16 Endpoint JSON di `public/api/*.json` | Di-fetch secara asinkron via HTTP GET Axios (tidak pernah di-import statis) dan disimpan di client-side document store terisolasi `tera_uts_b2b_db_v1`. |
| **Data Source 2 (Public API)** | **EMSIFA Wilayah Indonesia API** | Fetch real-time provinsi dan kabupaten/kota via HTTP Fetch API untuk form lokasi site pelanggan B2B. |
| **Grafik & Ikon** | **Pure SVG Interactive Chart & Inline SVG Icons** | `AreaLineChart.jsx` murni SVG (tanpa library Chart.js eksternal) dan `Icon.jsx` SVG fleksibel. |
| **Semantic HTML5 & A11y** | Tag semantic lengkap & WCAG Standard | `<header>`, `<nav>`, `<main id="main-content">`, `<aside>`, `<section>`, `<article>`, `<figure>`, `<footer>`, `.skip-link`, `aria-live`, `aria-modal`, `:focus-visible`. |
| **State Handling & UI** | Loading, Error & Empty States | Skeleton shimmer (`LoadingState`), Error banner dengan tombol **Coba Lagi** (`ErrorState`), serta simulasi gangguan API. |

---

## 3. Rincian Teknis & Panduan Laporan Individu

Gunakan rincian berikut untuk penyusunan laporan individu Word/PDF per anggota:

### A. Zakaria — Fitur Manajemen Master Data
* **Deskripsi Fitur:** Mengembangkan modul pengelolaan Master Data Enterprise B2B TERA, mencakup Master Pelanggan / Mitra B2B (PT/CV, NPWP, kontak resmi PIC, portofolio kontrak), Master Tarif Acuan Sewa & Jual Standar, serta parameter perpajakan B2B (PPh 23 2%, PPN 11%, dan SLA uptime 99.5%).
* **HTML Semantics & A11y:**
  - Menggunakan semantic `<header>`, `<main id="main-content">`, `<section aria-labelledby="...">`, `<article>`, dan tabel data responsif `<table className="tera-table">`.
  - Dialog modal pembuatan dan pengubahan master data dilengkapi `role="dialog"`, `aria-modal="true"`, serta tombol penutup yang mendukung tombol `Escape`.
  - Formulir master pelanggan dan tarif dilengkapi `<label htmlFor="...">`, `aria-invalid`, serta input validasi numerik untuk tarif sewa dan harga jual.
* **CSS Grid, Flexbox & Responsiveness:**
  - Parameter perpajakan diatur dalam CSS Grid adaptif (`grid grid-cols-1 sm:grid-cols-3 gap-4`).
  - Search bar dan kategori filter tab menggunakan Flexbox responsif yang otomatis membungkus pada layar sempit (`flex-wrap`).
  - `@media (max-width: 640px)` mengoptimalkan tabel master data menjadi tampilan scroll horizontal yang aman (`overflow-x-auto`).
* **React Architecture & State:**
  - `masterDataService.js` & `pelangganService.js`: Manajemen state dan fungsi CRUD terisolasi untuk data mitra dan paket standar acuan komersial.
  - Client-side validation: Pengecekan nama perusahaan, format NPWP, validasi kontak telepon/email PIC, serta validasi nilai tarif positif (> 0).
  - Modal confirmation state untuk aksi penghapusan master data dan feedback visual menggunakan `ToastContext`.
* **API Integration:**
  - Mengonsumsi endpoint Mock JSON API: `GET /api/pelanggan.json` dan `GET /api/katalog-standar.json` melalui Axios HTTP Client.
  - Integrasi **Public External API EMSIFA Wilayah Indonesia** (`https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json`) via Fetch API untuk pemilihan provinsi & kabupaten/kota lokasi kantor/site mitra.

---

### B. Hafizh Arqamilandri Wakhyudi — Fitur Login, Register, Forgot Password
* **Deskripsi Fitur:** Mengembangkan seluruh ekosistem autentikasi pengguna dan keamanan akun, mencakup login multi-identitas (email/username), registrasi pelanggan B2B dengan validasi komprehensif, verifikasi kode OTP 6-digit dengan hitung mundur dan auto-focus, alur pemulihan kata sandi, serta pembaruan profil pengguna.
* **HTML Semantics & A11y:**
  - Struktur autentikasi terbungkus dalam semantic `<main className="auth-shell">`, `<header>`, dan `<form noValidate>`.
  - Formulir input dilengkapi `aria-invalid={!!errors.field}` dan `aria-describedby="field-error"`.
  - Pesan error menggunakan `role="alert"` dengan kontras warna merah standar WCAG AA.
  - Navigasi keyboard penuh (`Tab` antar digit OTP, `Enter` untuk submit, toggle show/hide kata sandi).
* **CSS Grid, Flexbox & Responsiveness:**
  - Grid 6 kolom berjarak presisi (`grid grid-cols-6 gap-2 sm:gap-3`) untuk kotak input kode OTP.
  - Split-screen flexbox pada desktop (`.auth-split-layout`) dengan panel ilustrasi di kiri dan form di kanan.
  - `@media (max-width: 480px)` menyesuaikan padding kartu autentikasi dan ukuran font input digit OTP.
* **React Architecture & State:**
  - `AuthContext.jsx`: Global authentication provider dengan persistensi sesi pengguna ke local store.
  - Client-side validation regex: Format email korporat, validasi username alfanumerik (4-24 karakter), dan panjang kata sandi minimal 8 karakter.
  - Auto-advance OTP logic menggunakan array of `useRef`, mendukung event `onPaste` string 6 digit langsung.
  - Timer hitung mundur 10 menit (600 detik) menggunakan `useEffect` dan pembersihan interval saat unmount.
* **API Integration:**
  - Mengambil data awal akun melalui `GET /api/users.json` via Axios di `authService.js`.
  - Simulasi pengiriman OTP dan token reset tersimpan aman di storage terisolasi.

---

### C. Marta Safitri — Fitur Dashboard
* **Deskripsi Fitur:** Mengembangkan antarmuka eksekutif berupa Admin Operational & Commercial Dashboard, Portal Pelanggan Dashboard, visualisasi grafik analitik murni SVG, serta modul pelaporan penyewaan dan pendapatan tahunan.
* **HTML Semantics & A11y:**
  - Menggunakan struktur hierarkis `<header>`, `<main id="main-content">`, `<section aria-labelledby="...">`, `<article className="kpi-card">`, dan `<figure>` untuk visualisasi data grafik.
  - Grafik SVG dilengkapi elemen `<title>`, `<desc>`, dan atribut ARIA (`role="img" aria-label="Grafik Arus Kas Bulanan"`).
  - Skim reader support untuk ringkasan metrik statistik KPI.
* **CSS Grid, Flexbox & Responsiveness:**
  - Grid 4 kolom adaptif (`.kpi-grid-4`: 1 kolom di mobile, 2 kolom di tablet, 4 kolom di desktop).
  - Dashboard split layout (`.dashboard-split-grid`) membagi area grafik utama (65%) dan panel log aktivitas operasional (35%).
  - Aturan `@media print` khusus pada modul laporan pendapatan dan penyewaan untuk menghasilkan cetakan PDF yang rapi tanpa elemen navigasi.
* **React Architecture & State:**
  - Komponen murni SVG `AreaLineChart.jsx` dengan kalkulasi koordinat matematis dinamis, SVG gradient fill, dan interaktivitas hover tooltip tanpa pustaka pihak ketiga.
  - Metric switcher state (`realisasi` vs `komitmen`) yang langsung merender ulang kurva grafik.
  - Aggregation engine di `laporanService.js` untuk menghitung rasio utilisasi unit, total revenue, dan piutang jatuh tempo.
* **API Integration:**
  - Agregasi data dari 5 endpoint Mock JSON API (`/api/units.json`, `/api/kontrak.json`, `/api/invoices.json`, `/api/pelanggan.json`, `/api/activity-logs.json`).
  - Loading skeleton shimmer effect dan komponen ErrorState dengan tombol retry.

---

### D. Steven Taufik Fajar — Fitur Kelola Unit
* **Deskripsi Fitur:** Mengembangkan modul inventaris perangkat telekomunikasi radio industri TERA, mencakup CRUD Unit (Repeater, Radio Base, HT, Radio HF), modal upload pratinjau foto perangkat, pencarian & filter kategori, pemantauan status unit dengan toggle mode Grid & Tabel, serta katalog perangkat untuk portal pelanggan.
* **HTML Semantics & A11y:**
  - Komponen dialog modal ramah aksesibilitas menggunakan `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby="modal-title"`.
  - Penutupan modal via keyboard dengan event listener `Escape`.
  - Status unit direpresentasikan dengan tag semantik `<span className="status-badge" role="status">` dan kontras warna yang jelas.
  - Formulir create/edit unit dilengkapi semantic `<fieldset>` dan `<legend>` untuk pengelompokan spesifikasi teknis.
* **CSS Grid, Flexbox & Responsiveness:**
  - Toggle view mode responsif: Tampilan Grid (`.catalog-grid`: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) dan Tampilan Tabel (`.tera-table-container`) dengan horizontal scroll aman.
  - Filter bar berbasis Flexbox yang otomatis membungkus pada layar sempit.
  - `@media (max-width: 640px)` mengoptimalkan ukuran foto kartu unit dan tata letak tombol aksi cepat.
* **React Architecture & State:**
  - Auto-generate kode unit cerdas berbasis prefix kategori (`RPT-` untuk Repeater, `RBS-` untuk Radio Base, `HTP-` untuk Handy Talkie, `HFB-` untuk Radio HF).
  - Client-side image upload preview menggunakan `FileReader` (membaca file gambar lokal menjadi Base64 Data URL).
  - Pagination komponen modular `Pagination.jsx` yang menangani slicing array data unit secara dinamis.
* **API Integration:**
  - Mengambil data dari `GET /api/units.json` dan riwayat mutasi dari `GET /api/unit-history.json` via Axios di `unitService.js`.
  - Persistensi mutasi unit (create, update status, delete) langsung terbarui di local document store.

---

## 4. Kredensial Akun Demo Pengujian

Aplikasi dilengkapi tombol **Isi Otomatis (Auto-fill Demo)** pada halaman login untuk kemudahan evaluasi:

| Peran (Role) | Email / Username | Kata Sandi | Akses Pengujian |
| :--- | :--- | :--- | :--- |
| **Administrator TERA** | `admin@tera.co.id` *(atau `admin.tera`)* | `password123` | Dashboard Admin, CRUD Unit, Status Unit, Transaksi Sewa & Jual Lepas, Proyek 8-Tab, Angsuran, Laporan. |
| **Pelanggan Korporat B2B** | `pelanggan@tera.co.id` *(atau `rendra.ben`)* | `password123` | Dashboard Pelanggan, Katalog Radio, Keranjang Pengajuan Sewa, Pelacakan Status Proyek 5 Tahap. |

> **Mode Demo OTP:** Pada pengujian registrasi baru (`/register`) dan lupa kata sandi (`/forgot-password`), kode 6-digit OTP ditampilkan secara langsung di kotak informasi **Mode Demo** pada halaman verifikasi sehingga dapat langsung diisi atau di-paste.

---

## 5. Instruksi Menjalankan Proyek (Setup & Run)

Pastikan **Node.js versi 18 ke atas** dan **npm** telah terpasang.

```bash
# 1. Buka terminal pada direktori proyek
cd c:\xampp\htdocs\TUBES_Pemweb

# 2. Pasang paket dependensi resmi
npm install

# 3. Jalankan server pengembangan Vite
npm run dev

# 4. Bangun bundel produksi (verifikasi kelulusan build)
npm run build

# 5. Pratinjau hasil build produksi
npm run preview
```

Buka URL lokal yang muncul pada terminal (umumnya `http://localhost:5173`) di peramban Anda.

---

## 6. Strategi Git Branch & Riwayat Commit

Struktur repository dikelola menggunakan alur kerja kolaboratif bersih (*Clean Branching Strategy*):

```text
main (branch produksi utama)
 ├── feature/auth-hafizh        (Fitur Login, Register, Forgot Password & OTP)
 ├── feature/unit-steven        (Fitur Kelola Unit, Status Unit & Katalog)
 ├── feature/transaksi-zakaria  (Fitur Kelola Transaksi, Kalkulator Komersial & 8-Tab Proyek)
 └── feature/dashboard-marta    (Fitur Dashboard Eksekutif, SVG Chart & Laporan)
```

Setiap anggota memiliki commit yang terstruktur, deskriptif, dan memenuhi kriteria penilaian **Git & Version Control (15+ meaningful commits)**.
