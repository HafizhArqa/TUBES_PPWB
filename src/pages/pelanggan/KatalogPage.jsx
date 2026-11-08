/**
 * @file KatalogPage.jsx
 * @author Steven Taufik Fajar - Fitur Kelola Unit
 * @description Katalog Interaktif Perangkat Radio untuk Mitra Pelanggan B2B.
 * Fitur: Filter kategori tab, pencarian spek & merk, modal detail spesifikasi teknis,
 * dan penambahan unit ke keranjang sewa dengan feedback visual.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUnitsData } from '../../services/unitService';
import { addUnitToCart } from '../../services/portalPelangganService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { formatRupiah } from '../../utils/formatters';

const CATEGORIES = ['Semua', 'Repeater', 'Radio Base', 'Radio HT', 'Radio HF SSB'];

export default function KatalogPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [page, setPage] = useState(1);
  const [qtyMap, setQtyMap] = useState({});
  const [detailUnit, setDetailUnit] = useState(null);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUnitsData({ search, kategori, status: statusFilter });
      setUnits(res.units);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, kategori, statusFilter]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleAddToCart = (unit) => {
    const qty = Math.max(1, Number(qtyMap[unit.id_unit]) || 1);
    addUnitToCart(user?.id, unit, qty);
    showToast(`${qty} unit "${unit.nama_unit}" ditambahkan ke Keranjang Sewa!`, 'success');
  };

  if (loading) return <LoadingState message="Memuat katalog perangkat telekomunikasi..." rows={4} />;
  if (error) return <ErrorState message={error} onRetry={loadUnits} />;

  const pageSize = 6;
  const pagedUnits = units.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Katalog Perangkat Telekomunikasi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilih perangkat komunikasi berstandar industri untuk ditambahkan ke proposal sewa B2B Anda
          </p>
        </div>
        <Link
          to="/pelanggan/keranjang"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="cart" size={16} />
          <span>Lihat Keranjang Pengajuan</span>
        </Link>
      </header>

      {/* Filter Bar */}
      <section aria-label="Filter katalog perangkat" className="tera-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Kategori perangkat">
            {CATEGORIES.map((kat) => (
              <button
                key={kat}
                type="button"
                role="tab"
                aria-selected={kategori === kat}
                onClick={() => setKategori(kat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  kategori === kat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
            <label htmlFor="kat-status" className="sr-only">
              Filter Ketersediaan
            </label>
            <select
              id="kat-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Siap Sewa (Tersedia)</option>
              <option value="Disewa">Sedang Disewa</option>
            </select>

            <div className="relative min-w-[220px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Icon name="search" size={15} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari nama atau merk radio"
                placeholder="Cari Motorola, Hytera, UHF..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      {pagedUnits.length === 0 ? (
        <div className="tera-card">
          <EmptyState
            icon="radio"
            title="Perangkat Tidak Ditemukan"
            description="Coba ubah filter kategori atau kata kunci pencarian Anda."
          />
        </div>
      ) : (
        <section aria-label="Daftar kartu perangkat" className="catalog-grid">
          {pagedUnits.map((unit) => {
            const available = unit.status_unit === 'Tersedia';
            return (
              <article
                key={unit.id_unit}
                className="tera-card tera-card-hover overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <figure className="relative bg-slate-900 h-44 flex items-center justify-center overflow-hidden">
                    <img
                      src={unit.foto_unit}
                      alt={unit.nama_unit}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/75 text-white text-[11px] font-bold backdrop-blur">
                        {unit.kategori}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={unit.status_unit} />
                    </div>
                  </figure>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{unit.kode_unit}</span>
                      <span>{unit.merk}</span>
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                      {unit.nama_unit}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {unit.spesifikasi || unit.frekuensi}
                    </p>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="block text-[11px] text-slate-400">Tarif Sewa Korporat</span>
                      <span className="text-base font-extrabold text-blue-600">
                        {formatRupiah(unit.harga_sewa)}
                        <small className="text-xs font-medium text-slate-500"> / bulan</small>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailUnit(unit)}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    Spesifikasi
                  </button>

                  <label htmlFor={`qty-${unit.id_unit}`} className="sr-only">
                    Jumlah unit {unit.nama_unit}
                  </label>
                  <input
                    id={`qty-${unit.id_unit}`}
                    type="number"
                    min={1}
                    max={100}
                    disabled={!available}
                    value={qtyMap[unit.id_unit] ?? 1}
                    onChange={(e) =>
                      setQtyMap({ ...qtyMap, [unit.id_unit]: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-16 text-center rounded-xl border border-slate-300 py-2 text-xs font-bold disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => handleAddToCart(unit)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white text-xs font-bold transition-colors"
                  >
                    {available ? '+ Sewa' : 'Tidak Tersedia'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="tera-card overflow-hidden">
        <Pagination
          currentPage={page}
          totalItems={units.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Detail Spesifikasi */}
      <Modal
        open={Boolean(detailUnit)}
        onClose={() => setDetailUnit(null)}
        title={detailUnit?.nama_unit || 'Spesifikasi Perangkat'}
        subtitle={`${detailUnit?.kode_unit || ''} • ${detailUnit?.merk || ''}`}
      >
        {detailUnit && (
          <div className="space-y-4">
            <img
              src={detailUnit.foto_unit}
              alt={detailUnit.nama_unit}
              className="w-full h-48 object-cover rounded-xl bg-slate-900"
            />
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <dt className="text-slate-500">Kategori</dt>
                <dd className="font-bold text-slate-900 mt-0.5">{detailUnit.kategori}</dd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <dt className="text-slate-500">Pita Frekuensi</dt>
                <dd className="font-bold text-slate-900 mt-0.5">{detailUnit.frekuensi}</dd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <dt className="text-slate-500">Tarif Sewa Bulanan</dt>
                <dd className="font-bold text-blue-600 mt-0.5">{formatRupiah(detailUnit.harga_sewa)}</dd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <dt className="text-slate-500">Status Gudang</dt>
                <dd className="mt-0.5">
                  <StatusBadge status={detailUnit.status_unit} />
                </dd>
              </div>
            </dl>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="block text-slate-900 mb-1">Rincian Teknis:</strong>
              {detailUnit.spesifikasi || 'Standar industri telekomunikasi B2B PT Utama Telekomindo.'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

