import React, { useState, useEffect, useId } from 'react';
import { fetchProvincesPublicApi, fetchRegenciesPublicApi } from '../services/wilayahPublicApi';

/**
 * Komponen terintegrasi API Publik Wilayah Indonesia (emsifa.com)
 * Memudahkan pemilihan Provinsi & Kabupaten/Kota lokasi site B2B secara dinamis
 */
export default function WilayahSelector({ onSelectRegion }) {
  const provSelectId = useId();
  const citySelectId = useId();

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [apiSource, setApiSource] = useState('Memuat API Wilayah...');
  const [loadingRegency, setLoadingRegency] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProvincesPublicApi().then((res) => {
      if (!active) return;
      setProvinces(res.data || []);
      setApiSource(res.source);
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
    const res = await fetchRegenciesPublicApi(provId);
    setRegencies(res.data || []);
    setLoadingRegency(false);

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
          Bantuan Pilih Wilayah Indonesia (Integrasi API Eksternal)
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-700">
          Sumber: {apiSource}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label htmlFor={provSelectId} className="block text-xs font-medium text-slate-700 mb-1">
            Provinsi Operasional
          </label>
          <select
            id={provSelectId}
            value={selectedProvId}
            onChange={handleProvinceChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={citySelectId} className="block text-xs font-medium text-slate-700 mb-1">
            Kabupaten / Kota Site
          </label>
          <select
            id={citySelectId}
            value={selectedCityName}
            onChange={handleCityChange}
            disabled={!selectedProvId || loadingRegency}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 disabled:bg-slate-100 focus:border-blue-600 focus:outline-none"
          >
            <option value="">
              {loadingRegency ? 'Memuat Kabupaten/Kota...' : '-- Pilih Kabupaten / Kota --'}
            </option>
            {regencies.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

