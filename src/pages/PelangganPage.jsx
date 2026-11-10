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
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    warning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
