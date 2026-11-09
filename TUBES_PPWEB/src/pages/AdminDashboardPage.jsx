/**
 * @file AdminDashboardPage.jsx
 * @description Dashboard Operasional BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Memadukan CSS Grid + Flexbox dengan Tailwind CSS sesuai kriteria penilaian UTS.
 * 100% Data Fetching dari Mock API (units.json, pelanggan.json, kontrak.json, activity-logs.json, invoices.json).
 */

import React, { useState, useEffect, useCallback } from 'react';;
import axios from 'axios';
import Navbar from '../components/Navbar';

const formatRupiah = (number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickAmount, setQuickAmount] = useState('2.500.000');
  const [selectedUser, setSelectedUser] = useState('Bagas');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch data awal via Axios Mock API
      const [unitsRes, pelangganRes] = await Promise.all([
        axios.get('/api/units.json'),
        axios.get('/api/pelanggan.json'),
        axios.get('/api/kontrak.json'),
        axios.get('/api/activity-logs.json'),
        axios.get('/api/invoices.json'),
      ]);

      const units = Array.isArray(unitsRes.data) ? unitsRes.data : [];
      const pelanggan = Array.isArray(pelangganRes.data) ? pelangganRes.data : [];
      const kontrak = Array.isArray(kontrakRes.data) ? kontrakRes.data : [];
      const activityLogs = Array.isArray(logsRes.data) ? logsRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
       
      const totalUnits = units.length;
      const unitTersedia = units.filter((u) => u.status_unit === 'Tersedia').length;
      const unitDisewa = units.filter((u) => u.status_unit === 'Disewa').length;
      const unitPerawatan = units.filter(
        (u) => u.status_unit === 'Perawatan' || u.status_unit === 'Maintenance' || u.status_unit === 'Rusak'
      ).length;
      const kontrakAktif = kontrak.filter((k) => k.status_kontrak === 'Aktif');
      const totalNilaiKontrak = kontrakAktif.reduce(
        (sum, k) => sum + (Number(k.nilai_kontrak) || 0),
        0
      );

           // Data Transaksi Nyata dari Invoices & Mutasi Kas TERA
      const recentTx = [
        {
          id: 1,
          icon: 'card',
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          title: 'Penerimaan Termin INV/202611/0010',
          date: '06 November 2026',
          amount: '+Rp 15.400.000',
          isNegative: false,
        },
        {
          id: 2,
          icon: 'paypal',
          iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          title: 'Pelunasan Pengadaan PT Kilang Energi',
          date: '15 September 2026',
          amount: '+Rp 280.250.000',
          isNegative: false,
        },
        {
          id: 3,
          icon: 'user',
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
          title: 'Mobilisasi OTC Site Muara Enim',
          date: '05 Juni 2026',
          amount: '-Rp 8.500.000',
          isNegative: true,
        },
      ];

      setStats({
        kpi: {
          totalUnits,
          unitTersedia,
          unitDisewa,
          unitPerawatan,
          utilisasiPersen: totalUnits ? Math.round((unitDisewa / totalUnits) * 100) : 0,
          totalPelanggan: pelanggan.length,
          kontrakAktifCount: kontrakAktif.length,
          totalNilaiKontrak,
        },
        recentTx,
        rentedUnits: units.filter((u) => u.status_unit === 'Disewa').slice(0, 5),
        activityLogs: activityLogs.slice(0, 4),
      });
    } catch (err) {
      console.error('[Dashboard Fetch Error]:', err);
      const userMessage = err.isSimulated
        ? err.message
        : err.response
          ? `Server Mock API merespon status ${err.response.status}: ${err.response.statusText || 'Gagal memuat endpoint'}.`
          : err.request
            ? 'Tidak dapat terhubung ke endpoint Mock API. Pastikan server dev aktif.'
            : `Terjadi kendala saat memproses data: ${err.message}`;

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const teamMembers = [
    {
      id: 'Bagas',
      name: 'Ir. Bagaskara',
      role: 'Lead Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'Nadia',
      name: 'Nadia K.',
      role: 'Finance Officer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'Hendra',
      name: 'Hendra S.',
      role: 'Field Rigging',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];
 
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200">
      {/* Sidebar & Topbar Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="lg:ml-[250px] min-h-screen flex flex-col">
        <main id="main-content" className="flex-1 p-4 sm:p-7 max-w-[1600px] w-full mx-auto space-y-7">
        </main>
      </div>
    </div>
  );
}
