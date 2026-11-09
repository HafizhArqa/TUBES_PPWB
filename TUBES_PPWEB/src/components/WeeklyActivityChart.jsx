import React, { useState } from 'react';

/**
 * @file WeeklyActivityChart.jsx
 * @description Pure SVG Bar Chart untuk Aktivitas Operasional Mingguan TERA.
 * Menampilkan arus penerimaan sewa & beban operasional mingguan.
 */
export default function WeeklyActivityChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const days = [
    { day: 'Sab', deposit: 24, withdraw: 48 },
    { day: 'Min', deposit: 14, withdraw: 35 },
    { day: 'Sen', deposit: 27, withdraw: 32 },
    { day: 'Sel', deposit: 38, withdraw: 49 },
    { day: 'Rab', deposit: 23, withdraw: 15 },
    { day: 'Kam', deposit: 24, withdraw: 39 },
    { day: 'Jum', deposit: 33, withdraw: 40 },
  ];

  const maxVal = 50;
  const chartHeight = 220;
  const chartWidth = 560;
  const padLeft = 45;
  const padBottom = 35;
  const padTop = 15;
  const usableHeight = chartHeight - padTop - padBottom;
  const usableWidth = chartWidth - padLeft - 20;
  const colWidth = usableWidth / days.length;
  const barWidth = 12;

  const yTicks = [0, 10, 20, 30, 40, 50];

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white tracking-tight">
            Aktivitas Arus Kas Mingguan
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Volume penerimaan sewa & biaya servis harian (dalam jutaan Rp)
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
            <span>Penerimaan Sewa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Biaya Operasional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
