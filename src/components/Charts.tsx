import React, { useState } from 'react';
import { CategoryBreakdown } from '../types/carbon';
import { Zap, Car, Plane, Layers } from 'lucide-react';

interface ChartsProps {
  breakdown: CategoryBreakdown[];
  totalTonnes: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; stroke: string; text: string; fill: string }> = {
  electricity: {
    bg: 'bg-emerald-700',
    stroke: '#047857',
    text: 'text-emerald-800',
    fill: '#047857',
  },
  transportation: {
    bg: 'bg-teal-700',
    stroke: '#0f766e',
    text: 'text-teal-800',
    fill: '#0f766e',
  },
  flights: {
    bg: 'bg-sky-700',
    stroke: '#0369a1',
    text: 'text-sky-800',
    fill: '#0369a1',
  },
  other: {
    bg: 'bg-slate-600',
    stroke: '#475569',
    text: 'text-slate-700',
    fill: '#475569',
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electricity: <Zap className="w-3.5 h-3.5 text-emerald-700" />,
  transportation: <Car className="w-3.5 h-3.5 text-teal-700" />,
  flights: <Plane className="w-3.5 h-3.5 text-sky-700" />,
  other: <Layers className="w-3.5 h-3.5 text-slate-600" />,
};

export const DonutChart: React.FC<ChartsProps> = ({ breakdown, totalTonnes }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // SVG Donut calculation
  const size = 240;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate segment offsets
  let accumulatedPercent = 0;
  const segments = breakdown.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other,
    };
  });

  const activeItem = hoveredCategory
    ? breakdown.find((b) => b.category === hoveredCategory)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative w-[240px] h-[240px] shrink-0 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90 transform"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color.fill}
              strokeWidth={hoveredCategory === seg.category ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(seg.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {activeItem ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                {activeItem.label}
              </span>
              <p className="text-2xl font-display font-bold text-slate-900 mt-0.5">
                {activeItem.percentage}%
              </p>
              <p className="text-xs font-mono-data text-slate-500">
                {activeItem.tCO2e} tCO₂e
              </p>
            </div>
          ) : (
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total
              </span>
              <p className="text-2xl font-display font-bold text-slate-900 mt-0.5">
                {totalTonnes}
              </p>
              <span className="text-xs font-mono-data text-slate-500 font-medium">
                tCO₂e / yr
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2.5">
        {breakdown.map((item) => {
          const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
          const isHovered = hoveredCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                isHovered
                  ? 'bg-slate-50 border-slate-300 shadow-xs'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.fill }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-400">{item.primaryActivity}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-display font-bold text-slate-900">
                  {item.percentage}%
                </span>
                <p className="text-xs font-mono-data text-slate-500">
                  {item.tCO2e} tCO₂e
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HorizontalBarChart: React.FC<ChartsProps> = ({ breakdown }) => {
  // Find max tCO2e for relative width
  const maxVal = Math.max(...breakdown.map((b) => b.tCO2e), 0.1);

  return (
    <div className="space-y-4 pt-2">
      {breakdown.map((item) => {
        const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
        const widthPercent = Math.max((item.tCO2e / maxVal) * 100, 4);

        return (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                {CATEGORY_ICONS[item.category]}
                {item.label}
              </span>
              <span className="text-slate-900 font-mono-data font-semibold">
                {item.tCO2e} tCO₂e <span className="text-slate-400 font-normal">({item.percentage}%)</span>
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: colors.fill,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
