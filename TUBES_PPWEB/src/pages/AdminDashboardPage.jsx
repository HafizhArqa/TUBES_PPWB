/**
 * @file AdminDashboardPage.jsx
 * @description Dashboard Operasional BankFlash TERA dengan tema Putih, Grey, dan Hover Biru.
 * Memadukan CSS Grid + Flexbox dengan Tailwind CSS sesuai kriteria penilaian UTS.
 * 100% Data Fetching dari Mock API (units.json, pelanggan.json, kontrak.json, activity-logs.json, invoices.json).
 */

import React from 'react';
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
 
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
