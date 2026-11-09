import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import BankCard from '../components/BankCard';
import MyExpenseBarChart from '../components/MyExpenseBarChart';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  checkSimulatedError,
  isSimulatedErrorActive,
  setSimulatedError,
} from '../components/StatusStates';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];
const STATUSES = ['Semua', 'Tersedia', 'Disewa', 'Perawatan'];

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Tambahkan di dalam UnitsPage()
const [category, setCategory] = useState('Semua');
const [statusFilter, setStatusFilter] = useState('Semua');
const [query, setQuery] = useState('');
const [selectedUnit, setSelectedUnit] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 6;
const [simActive, setSimActive] = useState(isSimulatedErrorActive());

const fetchUnits = useCallback(async () => {
  setLoading(true);
  setError('');
  try {
    checkSimulatedError();
    const res = await axios.get('/api/units.json');
    if (!Array.isArray(res.data)) {
      throw new Error('Respon dari server Mock API bukan array data unit yang valid.');
    }
    setUnits(res.data);
  } catch (err) {
    console.error('[Units Fetch Error]:', err);
    const message = err.isSimulated
      ? err.message
      : err.response
      ? `Server Mock API mengembalikan status ${err.response.status}: ${err.response.statusText || 'Gagal memuat units.json'}.`
      : err.request
      ? 'Gagal terhubung ke endpoint Mock API units.json. Periksa koneksi server dev.'
      : `Terjadi kendala saat mengambil data unit: ${err.message}`;

    setError(message);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchUnits();
}, [fetchUnits]);

const handleToggleSimulation = () => {
  const nextState = !simActive;
  setSimActive(nextState);
  setSimulatedError(nextState);
  fetchUnits();
};
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC]">
      <Navbar />
      <div className="lg:ml-[250px] p-6">Units Page Initialized</div>
    </div>
    
  );
}
const formatRupiah = (number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);

const filteredUnits = units.filter((u) => {
  if (category !== 'Semua' && u.kategori !== category) return false;
  if (statusFilter !== 'Semua') {
    if (statusFilter === 'Perawatan') {
      if (u.status_unit !== 'Perawatan' && u.status_unit !== 'Maintenance' && u.status_unit !== 'Rusak') return false;
    } else if (u.status_unit !== statusFilter) {
      return false;
    }
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    const match =
      String(u.kode_unit || '').toLowerCase().includes(q) ||
      String(u.nama_unit || '').toLowerCase().includes(q) ||
      String(u.merk || '').toLowerCase().includes(q) ||
      String(u.lokasi || '').toLowerCase().includes(q);
    if (!match) return false;
  }
  return true;
});

const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;
const paginatedUnits = filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);