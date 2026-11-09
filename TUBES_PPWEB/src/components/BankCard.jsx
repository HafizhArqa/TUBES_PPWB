import React from 'react';

/**
 * @file BankCard.jsx
 * @description Kartu Finansial & Operasional Armada TERA (PT Utama Telekomindo).
 * Memadukan gaya visual modern banking dashboard dengan data operasional telekomunikasi asli.
 */
export default function BankCard({
  variant = 'blue',
  label = 'Total Nilai Kontrak Sewa',
  balance = 'Rp 1.159.150.000',
  cardHolder = 'PT UTAMA TELEKOMINDO',
  validThru = '4 Kontrak Aktif',
  cardNumber = 'REG: TERA-OPS-2026',
  holderLabel = 'PENYEDIA SISTEM',
  validLabel = 'STATUS KONTRAK',
}) {
  const isBlue = variant === 'blue';

  return (
    <div
      className={`rounded-[18px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
        isBlue
          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30'
          : 'bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-blue-400 text-[#1E293B] dark:text-white shadow-sm hover:shadow-md'
      }`}
      style={{ minHeight: '220px' }}
    >
      {/* Top Row: Metric Label, Value & Modern Telecom Badge */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`text-xs block mb-1 font-semibold uppercase tracking-wider ${
              isBlue ? 'text-white/80' : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            {label}
          </span>
          <span
            className={`text-2xl sm:text-[23px] font-extrabold tracking-tight ${
              isBlue ? 'text-white' : 'text-[#1E293B] dark:text-white'
            }`}
          >
            {balance}
          </span>
        </div>
        {/* Clean Signal / Contactless Emblem */}
        <div className="pt-1">
          <div
            className={`w-10 h-8 rounded-lg flex items-center justify-center p-1 ${
              isBlue
                ? 'bg-white/15 text-white'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Row: Holder & Status / Validity */}
      <div className="flex items-center gap-8 my-3">
        <div>
          <span
            className={`text-[10px] uppercase font-bold tracking-wider block ${
              isBlue ? 'text-white/70' : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            {holderLabel}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold tracking-tight block truncate max-w-[170px] ${
              isBlue ? 'text-white' : 'text-[#1E293B] dark:text-white'
            }`}
          >
            {cardHolder}
          </span>
        </div>
        <div>
          <span
            className={`text-[10px] uppercase font-bold tracking-wider block ${
              isBlue ? 'text-white/70' : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            {validLabel}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold tracking-tight block ${
              isBlue ? 'text-white' : 'text-[#1E293B] dark:text-white'
            }`}
          >
            {validThru}
          </span>
        </div>
      </div>
    </div>
  );
}
