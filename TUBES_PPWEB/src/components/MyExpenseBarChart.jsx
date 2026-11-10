import React, { useState } from 'react';

/**
 * @file MyExpenseBarChart.jsx
 * @description Bar chart biaya pemeliharaan & operasional armada radio komunikasi TERA.
 * Format mata uang Rupiah & data bulanan operasional.
 */
export default function MyExpenseBarChart() {
  const [hoveredMonth, setHoveredMonth] = useState('Nov');

  const months = [
    { label: 'Jun', amount: 8400000, formatted: 'Rp 8,4 jt' },
    { label: 'Jul', amount: 11200000, formatted: 'Rp 11,2 jt' },
    { label: 'Agu', amount: 6800000, formatted: 'Rp 6,8 jt' },
    { label: 'Sep', amount: 9500000, formatted: 'Rp 9,5 jt' },
    { label: 'Okt', amount: 14200000, formatted: 'Rp 14,2 jt' },
    { label: 'Nov', amount: 16800000, formatted: 'Rp 16,8 jt', isHighlight: true },
  ];

  const maxVal = 20000000;
  const chartHeight = 170;
  const chartWidth = 340;
  const padBottom = 28;
  const padTop = 32;
  const usableH = chartHeight - padTop - padBottom;
  const colW = chartWidth / months.length;
  const barWidth = 24;

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white tracking-tight">
          Biaya Pemeliharaan Armada
        </h3>
        <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Bulan Berjalan</span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[280px] select-none"
        >
          {months.map((m, idx) => {
            const centerX = idx * colW + colW / 2;
            const h = (m.amount / maxVal) * usableH;
            const y = padTop + usableH - h;
            const isTarget = hoveredMonth === m.label || (!hoveredMonth && m.isHighlight);

            return (
              <g
                key={m.label}
                onMouseEnter={() => setHoveredMonth(m.label)}
                onMouseLeave={() => setHoveredMonth('Nov')}
                className="cursor-pointer"
              >
                {/* Highlight Badge if active */}
                {isTarget && (
                  <g>
                    <rect
                      x={centerX - 35}
                      y={y - 24}
                      width={70}
                      height={18}
                      rx={5}
                      fill="#1E293B"
                    />
                    <text
                      x={centerX}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {m.formatted}
                    </text>
                  </g>
                )}

                {/* Vertical Bar */}
                <rect
                  x={centerX - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={8}
                  fill={
                    m.isHighlight || isTarget
                      ? '#2563EB'
                      : '#E2E8F0'
                  }
                  className="transition-colors duration-200 dark:opacity-90"
                />

                {/* Month label */}
                <text
                  x={centerX}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill={isTarget ? '#2563EB' : '#94A3B8'}
                  fontSize="11"
                  fontWeight={isTarget ? 'bold' : '500'}
                  fontFamily="Inter, sans-serif"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
