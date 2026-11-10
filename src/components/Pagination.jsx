import React from 'react';

/**
 * @file Pagination.jsx
 * @description Paginasi modern dengan tema Putih, Grey, dan Hover Biru (BankFlash style).
 */
export default function Pagination({
  currentPage = 1,
  totalPages: propTotalPages,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const calculatedPages = propTotalPages || Math.max(1, Math.ceil(totalItems / pageSize));
  if (calculatedPages <= 1) return null;

  const pages = Array.from({ length: calculatedPages }, (_, idx) => idx + 1);

  return (
    <nav aria-label="Navigasi halaman tabel" className="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] disabled:text-[#CBD5E1] dark:disabled:text-[#475569] disabled:cursor-not-allowed hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1.5 transition-colors"
        aria-label="Halaman Sebelumnya"
      >
        &lt; Previous
      </button>

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= calculatedPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] disabled:text-[#CBD5E1] dark:disabled:text-[#475569] disabled:cursor-not-allowed hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1.5 transition-colors"
        aria-label="Halaman Berikutnya"
      >
        Next &gt;
      </button>
    </nav>
  );
}
