import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. DATA CADANGAN (MOCK API & LOCALSTORAGE)
// ==========================================
const MOCK_PELANGGAN = [
  { id: 'PLG-2026-301', nama: 'PT Bukit Energi Nusantara', npwp: '01.842.519.4-304.000', pic: 'Rendra Mahendra', jabatan: 'VP ICT & Mine Automation', email: 'pelanggan@tera.co.id', telepon: '081284509911', alamat: 'Menara Karya Lt. 19, Jl. HR Rasuna Said, Jakarta Selatan', status: 'Aktif' },
  { id: 'PLG-2026-302', nama: 'PT Pelayaran Samudera Raya', npwp: '02.419.773.8-615.000', pic: 'Siti Rahmawati', jabatan: 'Head of Fleet Procurement', email: 'procurement@samuderaraya.co.id', telepon: '081331904422', alamat: 'Graha Baruna Lt. 8, Jl. Perak Timur, Surabaya', status: 'Aktif' },
  { id: 'PLG-2026-303', nama: 'PT Vale Smelting Timur', npwp: '03.910.228.1-831.000', pic: 'Hendra Gunawan', jabatan: 'Site Telecom Superintendent', email: 'hendra.gunawan@valesmelting.com', telepon: '081145098877', alamat: 'Kawasan Industri Bahodopi Blok C-12, Morowali', status: 'Aktif' },
  { id: 'PLG-2026-304', nama: 'PT Kilang Energi Nusantara', npwp: '01.552.309.7-522.000', pic: 'Ir. Danang Prasetyo', jabatan: 'HSSE & Emergency Comm Lead', email: 'danang.hsse@kilangnusantara.com', telepon: '081227803344', alamat: 'Jl. MT Haryono No. 77, Balikpapan', status: 'Aktif' },
  { id: 'PLG-2026-305', nama: 'PT Agro Sawit Kalimantan', npwp: '04.118.640.2-712.000', pic: 'Yohanes Kurniawan', jabatan: 'Estate Operations Manager', email: 'yohanes@agrosawit.co.id', telepon: '081350112299', alamat: 'Jl. Ahmad Yani Km 34, Sampit', status: 'Suspended' },
];

const MOCK_KONTRAK = [
  { id_pelanggan: 'PLG-2026-301', total_sewa: 1, unit_aktif: 14, nilai: 334900000, riwayat: "Sewa Sistem Repeater & Dispatch Tambang Pit Utara", periode: "2026-06-01 - 2028-05-31" }
];

// ==========================================
// 2. KOMPONEN PENDUKUNG (ICONS, MODAL, SELECTOR)
// ==========================================
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
