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

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[420px] select-none"
        >
          {/* Horizontal Gridlines & Y-Axis Ticks */}
          {yTicks.map((tick) => {
            const y = padTop + usableHeight - (tick / maxVal) * usableHeight;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - 10}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  className="dark:stroke-[#334155]"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                >
                  {tick} jt
                </text>
              </g>
            );
          })}

          {/* Bars per day */}
          {days.map((item, idx) => {
            const centerX = padLeft + idx * colWidth + colWidth / 2;
            const withdrawH = (item.withdraw / maxVal) * usableHeight;
            const depositH = (item.deposit / maxVal) * usableHeight;
            const withdrawY = padTop + usableHeight - withdrawH;
            const depositY = padTop + usableHeight - depositH;

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.day}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Operasional Bar (Blue) */}
                <rect
                  x={centerX - barWidth - 3}
                  y={withdrawY}
                  width={barWidth}
                  height={withdrawH}
                  rx={6}
                  fill={isHovered ? '#1D4ED8' : '#2563EB'}
                  className="transition-colors duration-200"
                />

                {/* Penerimaan Bar (Cyan) */}
                <rect
                  x={centerX + 3}
                  y={depositY}
                  width={barWidth}
                  height={depositH}
                  rx={6}
                  fill={isHovered ? '#0891B2' : '#06B6D4'}
                  className="transition-colors duration-200"
                />

                {/* Day Label */}
                <text
                  x={centerX}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#2563EB' : '#94A3B8'}
                  fontSize="12"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="Inter, sans-serif"
                >
                  {item.day}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={centerX - 48}
                      y={Math.min(withdrawY, depositY) - 30}
                      width={96}
                      height={24}
                      rx={6}
                      fill="#1E293B"
                    />
                    <text
                      x={centerX}
                      y={Math.min(withdrawY, depositY) - 14}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Rp {item.withdraw}M / Rp {item.deposit}M
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
