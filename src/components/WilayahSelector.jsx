/**
 * @file WilayahSelector.jsx
 * @description Komponen terintegrasi Public API Wilayah Indonesia (EMSIFA) menggunakan Fetch API
 * dalam tema Putih, Grey, dan Hover Biru (BankFlash style).
 * Mempertahankan 100% integrasi API, fallback data lokal, dan event callback onSelectRegion.
 */

import React, { useState, useEffect, useId } from 'react';

const FALLBACK_PROVINCES = [
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '91', name: 'PAPUA' },
];

const FALLBACK_CITIES = {
  '31': [{ id: '3171', name: 'KOTA ADM. JAKARTA SELATAN' }, { id: '3174', name: 'KOTA ADM. JAKARTA BARAT' }],
  '64': [{ id: '6471', name: 'KOTA BALIKPAPAN' }, { id: '6402', name: 'KAB. KUTAI KARTANEGARA' }],
};

export default function WilayahSelector({ onSelectRegion }) {
  const provSelectId = useId();
  const citySelectId = useId();

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [apiSource, setApiSource] = useState('Memuat API...');
  const [loadingRegency, setLoadingRegency] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((res) => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setProvinces(data);
        setApiSource('EMSIFA Public API (Live)');
      })
      .catch((err) => {
        console.warn('[PublicAPI] Fetch Wilayah menggunakan fallback offline:', err.message);
        if (!active) return;
        setProvinces(FALLBACK_PROVINCES);
        setApiSource('Data Wilayah Standar');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleProvinceChange = async (e) => {
    const provId = e.target.value;
    setSelectedProvId(provId);
    setSelectedCityName('');
    if (!provId) {
      setRegencies([]);
      return;
    }

    const provObj = provinces.find((p) => String(p.id) === String(provId));
    setLoadingRegency(true);

    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`);
      if (!res.ok) throw new Error('Status ' + res.status);
      const data = await res.json();
      setRegencies(data);
    } catch {
      setRegencies(FALLBACK_CITIES[provId] || [{ id: '0000', name: `KOTA/KAB WILAYAH ${provObj?.name || ''}` }]);
    } finally {
      setLoadingRegency(false);
    }

    if (onSelectRegion && provObj) {
      onSelectRegion({
        provinsi: provObj.name,
        kota: '',
        province: provObj.name,
        city: '',
      });
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCityName(cityName);
    const provObj = provinces.find((p) => String(p.id) === String(selectedProvId));

    if (onSelectRegion && provObj && cityName) {
      onSelectRegion({
        provinsi: provObj.name,
        kota: cityName,
        province: provObj.name,
        city: cityName,
      });
    }
  };

  return (
    <div className="bank-card p-5 sm:p-6 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
            API
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
              Penentuan Wilayah Site Operasional
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Integrasi Public API Wilayah Indonesia via Fetch API
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          {apiSource}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dropdown Provinsi */}
        <div>
          <label htmlFor={provSelectId} className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
            Pilih Provinsi Site
          </label>
          <select
            id={provSelectId}
            value={selectedProvId}
            onChange={handleProvinceChange}
            className="w-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 text-[#1E293B] dark:text-white text-xs font-medium rounded-full px-4 py-2.5 outline-none hover:border-blue-400 focus:border-blue-600 focus:bg-white transition-all"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Kota/Kabupaten */}
        <div>
          <label htmlFor={citySelectId} className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
            Pilih Kota / Kabupaten Site
          </label>
          <select
            id={citySelectId}
            value={selectedCityName}
            disabled={!selectedProvId || loadingRegency}
            onChange={handleCityChange}
            className="w-full bg-[#F1F5F9] dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 text-[#1E293B] dark:text-white text-xs font-medium rounded-full px-4 py-2.5 outline-none hover:border-blue-400 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50"
          >
            <option value="">
              {loadingRegency ? 'Mengambil data kota...' : '-- Pilih Kabupaten/Kota --'}
            </option>
            {regencies.map((reg) => (
              <option key={reg.id} value={reg.name}>
                {reg.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
