import React, { useState } from 'react';

/**
 * @file BalanceHistoryChart.jsx
 * @description Smooth cubic spline Area/Line chart untuk Tren Saldo & Arus Kas TERA.
 * Format mata uang Rupiah dan tren bulanan operasional.
 */
export default function BalanceHistoryChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const defaultPoints = [
    { label: 'Mei', val: 180 },
    { label: 'Jun', val: 320 },
    { label: 'Jul', val: 240 },
    { label: 'Agu', val: 460 },
    { label: 'Sep', val: 380 },
    { label: 'Okt', val: 590 },
    { label: 'Nov', val: 680 },
  ];

  const series = data && data.length > 0 ? data : defaultPoints;

  const width = 560;
  const height = 210;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 30;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const maxVal = 800;

  const yTicks = [0, 200, 400, 600, 800];

  const coords = series.map((pt, idx) => {
    const x = padLeft + (idx / (series.length - 1)) * innerW;
    const y = padTop + innerH - (Math.min(pt.val, maxVal) / maxVal) * innerH;
    return { x, y, label: pt.label, val: pt.val };
  });

  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const smoothLine = buildSmoothPath(coords);
  const baselineY = padTop + innerH;
  const smoothArea = `${smoothLine} L ${coords[coords.length - 1].x.toFixed(1)} ${baselineY} L ${coords[0].x.toFixed(1)} ${baselineY} Z`;

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white tracking-tight">
            Tren Arus Kas &amp; Saldo Operasional
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Proyeksi penerimaan termin kontrak PT Utama Telekomindo (dalam jutaan Rp)
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[380px] select-none"
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {yTicks.map((tick) => {
            const y = padTop + innerH - (tick / maxVal) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
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
                  Rp {tick} jt
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <path d={smoothArea} fill="url(#balanceGradient)" />
          <path
            d={smoothLine}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Points & Labels */}
          {coords.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Month label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#2563EB' : '#94A3B8'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="Inter, sans-serif"
                >
                  {pt.label}
                </text>

                {/* Point dot on hover */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={pt.x - 40}
                      y={pt.y - 30}
                      width={80}
                      height={22}
                      rx={5}
                      fill="#1E293B"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 15}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Rp {pt.val} Juta
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
