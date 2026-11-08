/**
 * @file AreaLineChart.jsx
 * @author Marta Safitri - Fitur Dashboard
 * @description Komponen Grafik Area & Garis SVG Murni Interaktif (Tanpa dependensi Chart.js).
 * Mendukung tooltip dinamis, grid axes, gradient fill, dan respon terhadap resize container.
 */

import React, { useState, useId } from 'react';

function formatCompactRupiah(value) {
  const num = Number(value) || 0;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)} jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)} rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Komponen Grafik Area & Garis SVG Murni (Tanpa library eksternal Chart.js)
 * Mendukung aksesibilitas keyboard & tooltip interaktif
 */
export default function AreaLineChart({
  data = [],
  valueKey = 'realisasi',
  labelKey = 'label',
  isCurrency = true,
  unitSuffix = '',
  height = 240,
  ariaLabel = 'Grafik tren bulanan',
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        Belum ada data grafik untuk ditampilkan.
      </div>
    );
  }

  const width = 680;
  const padLeft = 66;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 36;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values, 1) * 1.15;

  const points = data.map((d, idx) => {
    const x =
      data.length === 1
        ? padLeft + innerW / 2
        : padLeft + (idx / (data.length - 1)) * innerW;
    const val = Number(d[valueKey]) || 0;
    const y = padTop + innerH - (val / maxVal) * innerH;
    return { x, y, val, label: d[labelKey] };
  });

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const formatVal = (v) =>
    isCurrency ? formatCompactRupiah(v) : `${v.toLocaleString('id-ID')}${unitSuffix}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className="w-full">
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={ariaLabel}
          className="w-full h-auto min-w-[440px] select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y Labels */}
          {yTicks.map((t) => {
            const y = padTop + innerH - t * innerH;
            const tickVal = Math.round(maxVal * t);
            return (
              <g key={t}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-gray-500 dark:fill-gray-400 font-mono"
                >
                  {formatVal(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isActive = activeIndex === idx;
            return (
              <g key={pt.label}>
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isActive ? '700' : '500'}
                  className={isActive ? 'fill-blue-600 dark:fill-blue-400 font-bold' : 'fill-gray-600 dark:fill-gray-400'}
                >
                  {pt.label}
                </text>

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6.5 : 4.5}
                  className={`cursor-pointer transition-all ${
                    isActive
                      ? 'fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-gray-800'
                      : 'fill-white dark:fill-gray-800 stroke-blue-600 dark:stroke-blue-400'
                  }`}
                  strokeWidth="2.5"
                  tabIndex={0}
                  role="button"
                  aria-label={`${pt.label}: ${formatVal(pt.val)}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(idx)}
                  onBlur={() => setActiveIndex(null)}
                />

                {isActive && (
                  <g transform={`translate(${Math.min(Math.max(pt.x - 58, 8), width - 124)}, ${Math.max(pt.y - 42, 4)})`}>
                    <rect width="116" height="30" rx="6" className="fill-gray-900 dark:fill-gray-100" />
                    <text
                      x="58"
                      y="19"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      className="fill-white dark:fill-gray-900"
                    >
                      {formatVal(pt.val)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

