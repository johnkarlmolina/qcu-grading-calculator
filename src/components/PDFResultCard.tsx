import React, { useState } from 'react';
import type { SubjectRow, GWAResult } from '../utils/gwaCalculator';
import type { DocType } from '../utils/pdfParser';

export interface PDFAnalysisResult {
  fileName: string;
  docType: DocType;
  subjects: SubjectRow[];
  gwaResult: GWAResult;
  rawText: string;
  analyzedAt: number;
}

interface PDFResultCardProps {
  results: PDFAnalysisResult[];
}

// ── Config maps ───────────────────────────────────────────────────────────────
const HONOR_CONFIG = {
  'Summa Cum Laude': {
    color: '#22d3ee',
    bg: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/30',
    icon: 'fa-solid fa-trophy',
    glow: '#22d3ee55',
  },
  'Magna Cum Laude': {
    color: '#818cf8',
    bg: 'from-indigo-500/10 to-violet-500/10',
    border: 'border-indigo-500/30',
    icon: 'fa-solid fa-medal',
    glow: '#818cf855',
  },
  'Cum Laude': {
    color: '#34d399',
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    icon: 'fa-solid fa-award',
    glow: '#34d39955',
  },
  'Not Eligible': {
    color: '#94a3b8',
    bg: 'from-slate-600/10 to-slate-700/10',
    border: 'border-slate-600/30',
    icon: 'fa-solid fa-circle-info',
    glow: '#94a3b830',
  },
};

const STANDING_COLOR: Record<string, string> = {
  Excellent: '#22d3ee',
  'Very Good': '#818cf8',
  Good: '#34d399',
  Fair: '#fbbf24',
  Poor: '#f87171',
};

const DOC_TYPE_LABEL: Record<DocType, { label: string; icon: string; color: string }> = {
  'grade-slip': { label: 'Grade Slip', icon: 'fa-solid fa-file-lines', color: 'text-indigo-400' },
  'program-of-study': { label: 'Program of Study', icon: 'fa-solid fa-book-open', color: 'text-emerald-400' },
  unknown: { label: 'Unknown Format', icon: 'fa-solid fa-file-circle-question', color: 'text-amber-400' },
};

const GRADE_COLOR = (grade: number) => {
  if (grade <= 1.50) return '#22d3ee';
  if (grade <= 2.00) return '#818cf8';
  if (grade <= 2.50) return '#34d399';
  if (grade <= 3.00) return '#fbbf24';
  return '#f87171';
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SubjectTable: React.FC<{ subjects: SubjectRow[] }> = ({ subjects }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? subjects : subjects.slice(0, 5);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h4 className="text-xs font-700 uppercase tracking-widest text-slate-400">
          Extracted Subjects
        </h4>
        <span className="text-xs text-slate-500">{subjects.length} found</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/40">
              <th className="px-3 py-2 text-left font-600 text-slate-500 uppercase tracking-wide">Code</th>
              <th className="px-3 py-2 text-left font-600 text-slate-500 uppercase tracking-wide">Subject</th>
              <th className="px-3 py-2 text-center font-600 text-slate-500 uppercase tracking-wide">Units</th>
              <th className="px-3 py-2 text-center font-600 text-slate-500 uppercase tracking-wide">Grade</th>
              <th className="px-3 py-2 text-center font-600 text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s, i) => (
              <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                <td className="px-3 py-2 font-700 text-indigo-300 whitespace-nowrap">{s.code}</td>
                <td className="px-3 py-2 text-slate-300 max-w-[180px] truncate" title={s.name}>{s.name}</td>
                <td className="px-3 py-2 text-center text-slate-300">{s.units}</td>
                <td className="px-3 py-2 text-center font-700 tabular-nums" style={{ color: GRADE_COLOR(s.grade) }}>
                  {s.rawGrade}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-600 ${
                    s.passed
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-red-500/15 text-red-400 border border-red-500/25'
                  }`}>
                    <i className={`fa-solid ${s.passed ? 'fa-check' : 'fa-xmark'} text-[8px]`} />
                    {s.passed ? 'Passed' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {subjects.length > 5 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full py-2.5 text-xs font-600 text-indigo-400 hover:text-indigo-300 border-t border-slate-700/40 hover:bg-slate-700/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`} />
          {expanded ? 'Show less' : `Show ${subjects.length - 5} more subjects`}
        </button>
      )}
    </div>
  );
};

// ── Main result card ──────────────────────────────────────────────────────────
const SingleResult: React.FC<{ result: PDFAnalysisResult }> = ({ result }) => {
  const { docType, subjects, gwaResult, fileName } = result;
  const honorCfg = HONOR_CONFIG[gwaResult.latinHonor];
  const docCfg = DOC_TYPE_LABEL[docType];
  const standingColor = STANDING_COLOR[gwaResult.standing];

  return (
    <div className="result-animate flex flex-col gap-4">
      {/* File header */}
      <div className="flex items-center gap-3 flex-wrap">
        <i className={`fa-solid fa-file-pdf text-red-400 text-lg`} />
        <span className="text-sm font-600 text-slate-200 truncate flex-1">{fileName}</span>
        <span className={`flex items-center gap-1.5 text-xs font-600 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/40 ${docCfg.color}`}>
          <i className={docCfg.icon} />
          {docCfg.label}
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center">
          <i className="fa-solid fa-triangle-exclamation text-amber-400 text-2xl mb-2" />
          <p className="text-sm font-600 text-slate-300">No subjects could be extracted</p>
          <p className="text-xs text-slate-500 mt-1">The PDF format may not be supported. Try a text-based PDF.</p>
          
          <div className="mt-4 pt-4 border-t border-slate-700/50 text-left">
            <details className="group">
              <summary className="cursor-pointer text-xs font-600 text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 select-none list-none">
                 <i className="fa-solid fa-bug" /> Show Raw Extracted Text (For Debugging)
              </summary>
              <pre className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                {result.rawText || "No text extracted. The PDF might be an image/scan."}
              </pre>
            </details>
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* GWA */}
            <div
              className={`glass-card rounded-2xl p-4 col-span-2 bg-gradient-to-br ${honorCfg.bg} border ${honorCfg.border}`}
              style={{ boxShadow: `0 0 24px ${honorCfg.glow}` }}
            >
              <p className="text-xs font-600 uppercase tracking-wider text-slate-400 mb-1">
                General Weighted Average
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-900 tabular-nums leading-none" style={{ color: honorCfg.color }}>
                  {gwaResult.gwa.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-700"
                  style={{ background: honorCfg.color + '22', color: honorCfg.color, border: `1px solid ${honorCfg.color}44` }}
                >
                  <i className={honorCfg.icon} />
                  {gwaResult.latinHonor}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-600" style={{ color: standingColor }}>
                  {gwaResult.standing}
                </span>
              </div>
            </div>

            {/* Total units */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Units</p>
              <p className="text-3xl font-800 text-slate-100">{gwaResult.totalUnits}</p>
              <p className="text-xs text-slate-500 mt-0.5">{gwaResult.subjectCount} subjects</p>
            </div>

            {/* Pass/Fail */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pass / Fail</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-800 text-emerald-400">{gwaResult.passedSubjects}</span>
                <span className="text-slate-500 text-sm">/</span>
                <span className="text-xl font-600 text-red-400">{gwaResult.failedSubjects}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">passed / failed</p>
            </div>
          </div>

          {/* Latin Honor eligibility track */}
          <div className="glass-card rounded-2xl p-4">
            <h4 className="text-xs font-700 uppercase tracking-widest text-slate-400 mb-3">
              Latin Honor Eligibility
            </h4>
            <div className="flex flex-col gap-2">
              {(Object.keys(HONOR_CONFIG) as Array<keyof typeof HONOR_CONFIG>).map((honor) => {
                const cfg = HONOR_CONFIG[honor];
                const isActive = gwaResult.latinHonor === honor;
                const ranges: Record<string, string> = {
                  'Summa Cum Laude': 'GWA 1.00 – 1.20',
                  'Magna Cum Laude': 'GWA 1.21 – 1.45',
                  'Cum Laude':       'GWA 1.46 – 1.75',
                  'Not Eligible':    'GWA > 1.75',
                };
                return (
                  <div
                    key={honor}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200
                      ${isActive
                        ? `bg-gradient-to-r ${cfg.bg} ${cfg.border}`
                        : 'border-slate-700/30 opacity-40'
                      }`}
                  >
                    <i className={`${cfg.icon} w-4 text-center`} style={{ color: cfg.color }} />
                    <span className="text-sm font-600" style={isActive ? { color: cfg.color } : { color: '#94a3b8' }}>
                      {honor}
                    </span>
                    <span className="ml-auto text-xs text-slate-500">{ranges[honor]}</span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-700"
                        style={{ background: cfg.color + '22', color: cfg.color }}>
                        YOU
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject table */}
          <SubjectTable subjects={subjects} />
        </>
      )}
    </div>
  );
};

// ── Exported wrapper ──────────────────────────────────────────────────────────
const PDFResultCard: React.FC<PDFResultCardProps> = ({ results }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar when multiple files */}
      {results.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-600 border transition-all duration-200 ${
                activeIdx === i
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <i className="fa-solid fa-file-pdf text-red-400" />
              <span className="max-w-[120px] truncate">{r.fileName}</span>
            </button>
          ))}
        </div>
      )}
      <SingleResult result={results[activeIdx] ?? results[0]} />
    </div>
  );
};

export default PDFResultCard;
