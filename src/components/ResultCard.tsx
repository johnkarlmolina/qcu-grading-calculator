import React from 'react';
import type { GradeResult } from '../utils/gradeCalculator';

interface ResultCardProps {
  result: GradeResult;
}

const STANDING_CONFIG = {
  Excellent: {
    color: '#22d3ee',
    bg: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/30',
    ring: 'bg-cyan-400',
    bars: 5,
  },
  'Very Good': {
    color: '#818cf8',
    bg: 'from-indigo-500/10 to-violet-500/10',
    border: 'border-indigo-500/30',
    ring: 'bg-indigo-400',
    bars: 4,
  },
  Good: {
    color: '#34d399',
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    ring: 'bg-emerald-400',
    bars: 3,
  },
  Fair: {
    color: '#fbbf24',
    bg: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/30',
    ring: 'bg-amber-400',
    bars: 2,
  },
  Poor: {
    color: '#f87171',
    bg: 'from-red-500/10 to-pink-500/10',
    border: 'border-red-500/30',
    ring: 'bg-red-400',
    bars: 1,
  },
};

const REMARKS_CONFIG = {
  Passed: {
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/30',
    icon: '✓',
  },
  Failed: {
    gradient: 'from-red-500 to-rose-500',
    shadow: 'shadow-red-500/30',
    icon: '✗',
  },
};

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
  large?: boolean;
}

const MetricTile: React.FC<MetricTileProps> = ({ label, value, sub, color, large }) => (
  <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 shimmer-line">
    <span className="text-xs font-500 text-slate-500 uppercase tracking-wider">{label}</span>
    <span
      className={`font-800 tabular-nums leading-none ${large ? 'text-4xl' : 'text-2xl'}`}
      style={{ color }}
    >
      {value}
    </span>
    {sub && <span className="text-xs text-slate-500 mt-0.5">{sub}</span>}
  </div>
);

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const standing = STANDING_CONFIG[result.academicStanding];
  const remarks = REMARKS_CONFIG[result.remarks];

  const allStandings = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] as const;

  return (
    <div className="result-animate flex flex-col gap-5">
      {/* Hero: Final Percentage Grade */}
      <div
        className={`glass-card rounded-3xl p-6 bg-gradient-to-br ${standing.bg} border ${standing.border} relative overflow-hidden`}
      >
        {/* Decorative orb */}
        <div
          className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-3xl opacity-20"
          style={{ background: standing.color }}
        />
        <div className="relative z-10">
          <p className="text-xs font-600 uppercase tracking-widest text-slate-400 mb-1">
            Final Percentage Grade
          </p>
          <div className="flex items-end gap-3">
            <span
              className="text-7xl font-900 tabular-nums leading-none"
              style={{ color: standing.color }}
            >
              {result.finalPercentageGrade.toFixed(2)}
            </span>
            <span className="text-2xl text-slate-500 mb-2">%</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-600 bg-gradient-to-r ${remarks.gradient} text-white shadow-lg ${remarks.shadow}`}
            >
              <span>{remarks.icon}</span>
              {result.remarks}
            </span>
            <span className="text-slate-400 text-sm">·</span>
            <span className="text-slate-300 text-sm font-500">{result.descriptiveRating}</span>
          </div>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <MetricTile
          label="Midterm Grade"
          value={result.midtermGrade.toFixed(2)}
          sub="(60% CS + 40% Exam)"
          color="#818cf8"
        />
        <MetricTile
          label="Final Term Grade"
          value={result.finalTermGrade.toFixed(2)}
          sub="(60% CS + 40% Exam)"
          color="#34d399"
        />
        <MetricTile
          label="Numerical Equivalent"
          value={result.numericalEquivalent.toFixed(2)}
          color={standing.color}
          large
        />
        <MetricTile
          label="Descriptive Rating"
          value={result.descriptiveRating}
          color={standing.color}
        />
      </div>

      {/* Academic Standing */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-700 uppercase tracking-widest text-slate-400 mb-4">
          Academic Standing
        </h3>
        <div className="flex flex-col gap-2.5">
          {allStandings.map((s) => {
            const cfg = STANDING_CONFIG[s];
            const isActive = result.academicStanding === s;
            return (
              <div
                key={s}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? `bg-gradient-to-r ${cfg.bg} border ${cfg.border}`
                    : 'border border-slate-700/30 opacity-40'
                  }
                `}
              >
                {/* Bar indicator */}
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        i < cfg.bars
                          ? cfg.ring
                          : 'bg-slate-700'
                      }`}
                      style={{ height: isActive ? '20px' : '16px' }}
                    />
                  ))}
                </div>
                <span
                  className={`text-sm font-600 ${isActive ? '' : 'text-slate-400'}`}
                  style={isActive ? { color: cfg.color } : {}}
                >
                  {s}
                </span>
                {isActive && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full font-600"
                    style={{
                      background: cfg.color + '22',
                      color: cfg.color,
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
