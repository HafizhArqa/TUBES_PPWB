/**
 * @file WilayahSelector.jsx
 * @author Zakaria - Fitur Manajemen Master Data
 * @description Komponen terintegrasi Public API Wilayah Indonesia (EMSIFA) menggunakan Fetch API.
 * Membantu pemilihan Provinsi & Kabupaten/Kota lokasi site mitra B2B secara dinamis.
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

    if (provObj) {
      onSelectRegion?.({ province: provObj.name, city: '' });
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCityName(cityName);
    const provObj = provinces.find((p) => String(p.id) === String(selectedProvId));
    if (provObj && cityName) {
      onSelectRegion?.({ province: provObj.name, city: cityName });
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-blue-900">
          Pilih Wilayah Site Proyek (Public Fetch API)
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-700">
          Sumber: {apiSource}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label htmlFor={provSelectId} className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Provinsi Site
          </label>
          <select
            id={provSelectId}
            value={selectedProvId}
            onChange={handleProvinceChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={citySelectId} className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Kabupaten / Kota
          </label>
          <select
            id={citySelectId}
            value={selectedCityName}
            disabled={!selectedProvId || loadingRegency}
            onChange={handleCityChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {loadingRegency ? 'Mengambil data kota...' : '-- Pilih Kota/Kabupaten --'}
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
