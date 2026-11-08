import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerRentalRequests } from '../../services/portalPelangganService';
import { LoadingState, ErrorState, EmptyState } from '../../components/StatusStates';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Icon from '../../components/Icon';
import { formatRupiah, formatDateId } from '../../utils/formatters';

export default function PermintaanListPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getCustomerRentalRequests(user);
      setRequests(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  if (loading) return <LoadingState message="Memuat riwayat permohonan sewa..." rows={4} />;
  if (error) return <ErrorState message={error} onRetry={loadList} />;

  const pageSize = 8;
  const paged = requests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Status Permohonan & Kontrak Sewa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau progres evaluasi tender, jadwal instalasi lapangan, kontrak resmi, dan faktur tagihan
          </p>
        </div>
        <Link
          to="/pelanggan/katalog"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
        >
          <Icon name="plus" size={16} />
          <span>Buat Pengajuan Baru</span>
        </Link>
      </header>

      <section className="tera-card overflow-hidden">
        {paged.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="Belum Ada Permohonan Penyewaan"
            description="Anda belum mengajukan proposal sewa perangkat. Silakan pilih perangkat di Katalog."
            action={
              <Link
                to="/pelanggan/katalog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Jelajahi Katalog
              </Link>
            }
          />
        ) : (
          <>
            <div className="tera-table-wrap">
              <table className="tera-table">
                <thead>
                  <tr>
                    <th>Kode Permohonan</th>
                    <th>Perusahaan & Lokasi Site</th>
                    <th>Unit & Durasi</th>
                    <th>Estimasi Total</th>
                    <th>Status Tahapan</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((req) => (
                    <tr key={req.id_request}>
                      <td>
                        <div className="font-mono font-bold text-blue-700 text-xs">{req.kode_request}</div>
                        <span className="text-[11px] text-slate-400">{formatDateId(req.created_at)}</span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 text-xs">{req.nama_klien}</div>
                        <span className="text-xs text-slate-500">{req.lokasi_site}</span>
                      </td>
                      <td className="text-xs">
                        <span className="font-bold text-slate-900">{req.total_unit} Unit</span>
                        <span className="block text-slate-500">{req.durasi_sewa_bulan} Bulan</span>
                      </td>
                      <td className="text-xs font-bold text-slate-900">{formatRupiah(req.estimasi_total)}</td>
                      <td>
                        <StatusBadge status={req.status} />
                        <span className="block text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                          {req.tahap_proses}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/pelanggan/permintaan/${req.id_request}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold"
                        >
                          <Icon name="eye" size={14} />
                          <span>Lacak Progres</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalItems={requests.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

