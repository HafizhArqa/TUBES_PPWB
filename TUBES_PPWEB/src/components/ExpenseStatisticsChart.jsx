import React, { useState } from 'react';

/**
 * @file ExpenseStatisticsChart.jsx
 * @description Pure SVG Pie Chart untuk Alokasi Biaya Operasional Armada TERA.
 * Visual modern banking style dengan data kategori operasional radio komunikasi.
 */
export default function ExpenseStatisticsChart() {
  const [activeSlice, setActiveSlice] = useState(null);

  const segments = [
    { label: 'Lisensi SDPPI', percent: 30, color: '#1E3A8A', textColor: '#FFFFFF' },
    { label: 'Sparepart & Aki', percent: 15, color: '#F97316', textColor: '#FFFFFF' },
    { label: 'Rigging & Site', percent: 20, color: '#D946EF', textColor: '#FFFFFF' },
    { label: 'Servis Repeater', percent: 35, color: '#2563EB', textColor: '#FFFFFF' },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;

  let cumulativeAngle = -45;

  const slices = segments.map((seg, idx) => {
    const angle = (seg.percent / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;

    const isHovered = activeSlice === idx;
    const currentRadius = isHovered ? radius + 6 : radius;

    const x1 = center + currentRadius * Math.cos(startRad);
    const y1 = center + currentRadius * Math.sin(startRad);
    const x2 = center + currentRadius * Math.cos(endRad);
    const y2 = center + currentRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const labelRadius = radius * 0.62;
    const lx = center + labelRadius * Math.cos(midRad);
    const ly = center + labelRadius * Math.sin(midRad);

    return {
      ...seg,
      pathData,
      lx,
      ly,
      isHovered,
    };
  });

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[18px] p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white tracking-tight mb-2">
        Alokasi Beban Operasional
      </h3>

      <div className="flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-56 h-56 select-none transition-transform"
        >
          {slices.map((slice, idx) => (
            <g
              key={slice.label}
              onMouseEnter={() => setActiveSlice(idx)}
              onMouseLeave={() => setActiveSlice(null)}
              className="cursor-pointer transition-all duration-200"
            >
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth="5"
                className="transition-all duration-200"
              />
              <text
                x={slice.lx}
                y={slice.ly - 4}
                textAnchor="middle"
                fill={slice.textColor}
                fontSize="12"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                {slice.percent}%
              </text>
              <text
                x={slice.lx}
                y={slice.ly + 9}
                textAnchor="middle"
                fill={slice.textColor}
                fontSize="8"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
                opacity="0.95"
              >
                {slice.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="text-center pt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
        Distribusi pemeliharaan armada & lisensi resmi SDPPI
      </div>
    </div>
  );
}
