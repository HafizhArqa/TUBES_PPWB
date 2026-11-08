import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav
      aria-label="Navigasi halaman data"
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600"
    >
      <span>
        Menampilkan <strong className="text-slate-900">{startItem}</strong>–
        <strong className="text-slate-900">{endItem}</strong> dari{' '}
        <strong className="text-slate-900">{totalItems}</strong> data
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-100"
        >
          Sebelumnya
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
              p === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-100"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}

