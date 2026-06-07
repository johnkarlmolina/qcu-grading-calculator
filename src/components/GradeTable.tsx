import React from 'react';
import { GRADE_TABLE } from '../utils/gradeCalculator';

const GradeTable: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50">
        <h3 className="text-sm font-700 uppercase tracking-widest text-slate-400">
          QCU Grade Equivalency Table
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-4 py-2.5 text-left text-xs font-600 uppercase tracking-wider text-slate-500">
                Percentage
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-600 uppercase tracking-wider text-slate-500">
                Numerical
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-600 uppercase tracking-wider text-slate-500">
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {GRADE_TABLE.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-4 py-2.5 font-500 text-slate-300">{row.range}</td>
                <td className="px-4 py-2.5 text-center font-700 tabular-nums text-indigo-400">
                  {row.numerical.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RatingBadge rating={row.descriptive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RATING_COLORS: Record<string, string> = {
  Excellent: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Very Good': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Good: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Fair: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Poor: 'bg-red-500/15 text-red-400 border-red-500/30',
  Failed: 'bg-red-900/20 text-red-500 border-red-700/30',
};

const RatingBadge: React.FC<{ rating: string }> = ({ rating }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-600 border ${
      RATING_COLORS[rating] ?? 'bg-slate-700 text-slate-400'
    }`}
  >
    {rating}
  </span>
);

export default GradeTable;
