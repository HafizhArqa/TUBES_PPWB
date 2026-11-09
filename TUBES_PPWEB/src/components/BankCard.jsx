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
      </div>
    </div>
  );
}
