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
      </div>
    </div>
  );
};

const WilayahSelector = () => {
  const [provinces, setProvinces] = useState([]);
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(() => setProvinces([{ id: '1', name: 'DKI JAKARTA (Fallback)' }]));
  }, []);

  return (
    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg font-bold text-xs">API</div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Penentuan Wilayah Site Operasional</h4>
            <p className="text-xs text-gray-500">Integrasi Public API Wilayah Indonesia via Fetch API</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">EMSIFA Public API (Live)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Pilih Provinsi Site</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none">
            <option>-- Pilih Provinsi --</option>
            {provinces.map(p => <option key={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Pilih Kota / Kabupaten Site</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none" disabled>
            <option>-- Pilih Kabupaten/Kota --</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN UTAMA (PELANGGAN PAGE)
// ==========================================
export default function PelangganPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ nama: '', npwp: '', pic: '', jabatan: '', email: '', telepon: '', alamat: '' });

  // Load Data
  const loadData = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      try {
        const localData = JSON.parse(localStorage.getItem('tera_pelanggan')) || [];
        setData([...MOCK_PELANGGAN, ...localData]);
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }, 800); // simulate network delay
  };

  useEffect(() => { loadData(); }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || item.pic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' ? true : item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [data, searchQuery, activeTab]);

  // Handle Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    // Regex validasi email dari instruksi Zakaria
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Format email tidak valid!");
      return;
    }

    const newPelanggan = {
      ...formData,
      id: `PLG-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Aktif'
    };

    const updatedData = [...data, newPelanggan];
    setData(updatedData);
    
    // Simpan ke localstorage sesuai requirement
    const localData = JSON.parse(localStorage.getItem('tera_pelanggan')) || [];
    localStorage.setItem('tera_pelanggan', JSON.stringify([...localData, newPelanggan]));
    
    setIsAddModalOpen(false);
    setFormData({ nama: '', npwp: '', pic: '', jabatan: '', email: '', telepon: '', alamat: '' });
  };

  const handleSimulateError = () => {
    setIsError(true);
    setData([]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-800">
      {/* SIDEBAR MOCKUP (Agar tampilan pas dengan screenshot) */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col px-4 py-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">TERA.</h1>
            <p className="text-[10px] text-gray-500">Telekomindo</p>
          </div>
        </div>
        <nav className="space-y-2">
          <div className="px-4 py-3 text-sm font-medium text-gray-500 rounded-xl cursor-not-allowed">Dashboard</div>
          <div className="px-4 py-3 text-sm font-medium text-gray-500 rounded-xl cursor-not-allowed">Kelola Data Unit</div>
          <div className="px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50/50 rounded-xl border-l-4 border-blue-600">Data Pelanggan</div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Data Pelanggan</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleSimulateError} className="px-4 py-2 text-sm text-rose-600 bg-rose-50 rounded-full font-medium hover:bg-rose-100 transition-colors flex items-center gap-2">
              <Icon name="warning" className="w-4 h-4" /> Tes Simulasi Error
            </button>
            <button onClick={loadData} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Icon name="refresh" className="w-4 h-4" /> Segarkan API
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">ZK</div>
          </div>
        </header>

        {isError ? (
          <div role="alert" className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center my-10">
            <Icon name="warning" className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-rose-800 font-bold mb-1">Gagal Memuat Data Pelanggan</h3>
            <p className="text-rose-600 text-sm mb-4">Terjadi kesalahan saat mengambil data dari Mock API.</p>
            <button onClick={loadData} className="px-6 py-2 bg-rose-600 text-white rounded-full text-sm font-medium hover:bg-rose-700 transition-colors">Coba Lagi</button>
          </div>
        ) : (
          <>
            {/* METRICS CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Pelanggan Korporat</p>
                  <h3 className="text-3xl font-bold text-gray-900">{data.length} Mitra</h3>
                  <p className="text-xs text-gray-400 mt-2">Mock API & LocalStorage sinkron</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Icon name="users" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Pelanggan Aktif (Approved)</p>
                  <h3 className="text-3xl font-bold text-gray-900">{data.filter(d => d.status === 'Aktif').length} Akun</h3>
                  <p className="text-xs text-gray-400 mt-2">Kontrak penyewaan berjalan</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <Icon name="check" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2">Suspended / Non-Aktif</p>
                  <h3 className="text-3xl font-bold text-gray-900">{data.filter(d => d.status === 'Suspended').length} Akun</h3>
                  <p className="text-xs text-gray-400 mt-2">Menunggu verifikasi / rekonsiliasi</p>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                  <Icon name="warning" />
                </div>
              </div>
            </section>

            {/* MAIN TABLE SECTION */}
            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Daftar Pelanggan & Mitra Korporat</h3>
                <p className="text-sm text-gray-500 mb-6">Kelola informasi legalitas NPWP, kontak PIC, wilayah operasional, dan riwayat sewa.</p>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* TABS */}
                  <div className="flex items-center gap-6 border-b border-gray-200">
                    {['All', 'Aktif', 'Suspended'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        {tab === 'All' ? 'All Accounts (Semua)' : tab === 'Aktif' ? 'Active Approved (Aktif)' : 'Suspended (Tidak Aktif)'}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                      </button>
                    ))}
                  </div>

                  {/* KOTAK PENCARIAN & TOMBOL TAMBAH - Menerapkan Flexbox sesuai instruksi */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari perusahaan, NPWP, PIC..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:border-blue-500 outline-none w-full sm:w-64 bg-gray-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95"
                    >
                      <Icon name="plus" className="w-4 h-4" /> Tambah Pelanggan
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Perusahaan & NPWP</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">PIC Procurement</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email & No. Telepon</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Alamat Site / Kantor</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                    ) : filteredData.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">Tidak ada pelanggan ditemukan.</td></tr>
                    ) : (
                      filteredData.slice(0, 6).map((item, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                {item.nama.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{item.nama}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">NPWP: {item.npwp}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800 text-sm">{item.pic}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.jabatan}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-blue-600 hover:underline cursor-pointer">{item.email}</div>
                            <div className="text-xs text-gray-500 mt-0.5 font-mono">{item.telepon}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{item.alamat}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => { setSelectedItem(item); setIsInspectModalOpen(true); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            >
                              <Icon name="eye" className="w-4 h-4" /> Inspeksi
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* MODAL TAMBAH PELANGGAN */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Pelanggan Baru">
        <p className="text-sm text-gray-500 mb-6">Isi data identitas korporat dan informasi kontak PIC untuk pendaftaran akun sewa B2B.</p>
        <form onSubmit={handleAddSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Registrasi Mitra</label>
              <div className="flex gap-2">
                <input type="text" value="PLG-2026-393" disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-500" />
                <button type="button" className="px-4 border border-gray-200 rounded-xl text-blue-600 hover:bg-blue-50"><Icon name="refresh" className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori & Status</label>
              <div className="flex gap-2">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                  <option>Korporat B2B</option>
                </select>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                  <option>Aktif (Approved)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Perusahaan <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="Contoh: PT Bangun Nusantara" value={formData.nama} onChange={e=>setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Identitas (NPWP) <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="01.842.519.4-304.000" value={formData.npwp} onChange={e=>setFormData({...formData, npwp: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama PIC Procurement <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="Contoh: Budi Pratama" value={formData.pic} onChange={e=>setFormData({...formData, pic: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jabatan PIC</label>
              <input type="text" placeholder="Contoh: Head of IT & Telecom" value={formData.jabatan} onChange={e=>setFormData({...formData, jabatan: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Pelanggan <span className="text-rose-500">*</span></label>
              <input required type="email" placeholder="corporate@perusahaan.com" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon / WA <span className="text-rose-500">*</span></label>
              <input required type="text" placeholder="+62 812-3456-7890" value={formData.telepon} onChange={e=>setFormData({...formData, telepon: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          
          <WilayahSelector />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap / Kantor <span className="text-rose-500">*</span></label>
            <input required type="text" placeholder="Jl. Jenderal Sudirman No. 45, Jakarta Pusat" value={formData.alamat} onChange={e=>setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dokumen Persyaratan (Legalitas) <span className="text-rose-500">*</span></label>
            <div className="w-full border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors">
              <Icon name="upload" className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-semibold text-gray-800">Upload Dokumen Legalitas (KTP/NPWP/NIB)</span>
              <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG hingga 5MB</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm shadow-blue-200 flex items-center gap-2">
              <Icon name="plus" className="w-4 h-4" /> Simpan Pelanggan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL INSPEKSI (DETAIL PELANGGAN) */}
      <Modal isOpen={isInspectModalOpen} onClose={() => setIsInspectModalOpen(false)} title="Detail Informasi Pelanggan">
        {selectedItem && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-6 -mt-4">Rincian data profil korporat, kontak PIC, statistik riwayat penyewaan, dan wilayah operasional EMSIFA.</p>
            
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
                {selectedItem.nama.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{selectedItem.nama}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedItem.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{selectedItem.status}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Pelanggan Korporat B2B â€¢ PIC: {selectedItem.pic} ({selectedItem.jabatan})</p>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tanggal Terdaftar</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">05 Februari 2026</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Kontak */}
              <div className="p-5 border border-gray-100 rounded-2xl">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="users" className="w-4 h-4 text-gray-400" /> Kontak & Identitas Legalitas
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Email</span><span className="font-medium">{selectedItem.email}</span></div>
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">No. Telepon / WA</span><span className="font-mono font-medium">{selectedItem.telepon}</span></div>
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">No. NPWP / NIK</span><span className="font-mono font-medium">{selectedItem.npwp}</span></div>
                  <div>
