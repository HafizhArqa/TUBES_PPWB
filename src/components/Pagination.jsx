import React from 'react';

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
    <nav aria-label="Navigasi halaman tabel" className="inline-flex items-center space-x-1">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2.5 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Halaman Sebelumnya"
      >
        &laquo;
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 text-xs rounded transition-colors font-medium ${
            p === currentPage
              ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow'
              : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= calculatedPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2.5 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Halaman Berikutnya"
      >
        &raquo;
      </button>
    </nav>
  );
}

