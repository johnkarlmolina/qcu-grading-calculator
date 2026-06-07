import React, { useState, useCallback } from 'react';
import InputField from './components/InputField';
import ResultCard from './components/ResultCard';
import GradeTable from './components/GradeTable';
import PDFAnalyzer from './components/PDFAnalyzer';
import { calculateGrades, type GradeResult } from './utils/gradeCalculator';

type FieldValue = number | '';

interface Inputs {
  midtermClassStanding: FieldValue;
  midtermExam: FieldValue;
  finalClassStanding: FieldValue;
  finalExam: FieldValue;
}

const INITIAL: Inputs = {
  midtermClassStanding: '',
  midtermExam: '',
  finalClassStanding: '',
  finalExam: '',
};



const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(INITIAL);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const setField = useCallback((field: keyof Inputs) => (val: FieldValue) => {
    setInputs((prev) => ({ ...prev, [field]: val }));
    setCalculated(false);
  }, []);

  const allFilled = Object.values(inputs).every((v) => v !== '');

  const handleCalculate = () => {
    if (!allFilled) return;
    const nums = {
      midtermClassStanding: inputs.midtermClassStanding as number,
      midtermExam: inputs.midtermExam as number,
      finalClassStanding: inputs.finalClassStanding as number,
      finalExam: inputs.finalExam as number,
    };
    setResult(calculateGrades(nums));
    setCalculated(true);
  };

  const handleReset = () => {
    setInputs(INITIAL);
    setResult(null);
    setCalculated(false);
  };

  return (
    <div className="animated-gradient min-h-screen">
      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative z-10 min-h-screen">
        {/* ── Header ── */}
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/qcu-logo.png"
                alt="QCU Logo"
                className="w-9 h-9 object-contain drop-shadow-lg"
              />
              <div>
                <h1 className="text-base sm:text-lg font-800 text-white leading-none">
                  QCU Grade Calculator
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Quezon City University
                </p>
              </div>
            </div>
            <button
              id="toggle-table-btn"
              onClick={() => setShowTable((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-600 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all duration-200"
            >
              <i className="fa-solid fa-table-list text-xs" />
              <span className="hidden sm:inline">Grade Table</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-600 mb-4">
              <i className="fa-solid fa-star text-[11px]" />
              Academic Performance Tracker
            </div>
            <h2 className="text-3xl sm:text-4xl font-900 text-white mb-2">
              Calculate Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Final Grade
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Enter your class standing and exam scores to compute your QCU grade instantly.
            </p>
          </div>

          {/* Grade table (collapsible) */}
          {showTable && (
            <div className="mb-8 result-animate">
              <GradeTable />
            </div>
          )}

          {/* Main dashboard — single column stacked */}
          <div className="flex flex-col gap-6">

            {/* ── Input panel ── */}
            <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col gap-6">

              {/* Two-period grid: side-by-side on sm+ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                {/* Midterm section */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-px flex-1 bg-slate-700/60" />
                    <span className="flex items-center gap-1.5 text-xs font-700 uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <i className="fa-solid fa-chart-bar text-[11px]" />
                      Midterm Period
                    </span>
                    <div className="h-px flex-1 bg-slate-700/60" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      id="midterm-cs"
                      label="Class Standing"
                      sublabel="60% weight"
                      value={inputs.midtermClassStanding}
                      onChange={setField('midtermClassStanding')}
                      iconClass="fa-solid fa-clipboard-list"
                      accentColor="#818cf8"
                    />
                    <InputField
                      id="midterm-exam"
                      label="Exam Score"
                      sublabel="40% weight"
                      value={inputs.midtermExam}
                      onChange={setField('midtermExam')}
                      iconClass="fa-solid fa-pencil"
                      accentColor="#c084fc"
                    />
                  </div>
                </div>

                {/* Final term section */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-px flex-1 bg-slate-700/60" />
                    <span className="flex items-center gap-1.5 text-xs font-700 uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <i className="fa-solid fa-chart-bar text-[11px]" />
                      Final Term Period
                    </span>
                    <div className="h-px flex-1 bg-slate-700/60" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      id="final-cs"
                      label="Class Standing"
                      sublabel="60% weight"
                      value={inputs.finalClassStanding}
                      onChange={setField('finalClassStanding')}
                      iconClass="fa-solid fa-clipboard-list"
                      accentColor="#34d399"
                    />
                    <InputField
                      id="final-exam"
                      label="Exam Score"
                      sublabel="40% weight"
                      value={inputs.finalExam}
                      onChange={setField('finalExam')}
                      iconClass="fa-solid fa-pencil"
                      accentColor="#2dd4bf"
                    />
                  </div>
                </div>
              </div>

              {/* Formula + Buttons row on desktop */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Formula preview */}
                <div className="flex-1 rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-xs text-slate-400 leading-relaxed font-mono space-y-1">
                  <p className="font-600 text-slate-300 not-italic text-xs mb-1.5">Formula</p>
                  <p>Midterm&nbsp;=&nbsp;(60%&nbsp;×&nbsp;CS)&nbsp;+&nbsp;(40%&nbsp;×&nbsp;Exam)</p>
                  <p>FinalTerm&nbsp;=&nbsp;(60%&nbsp;×&nbsp;CS)&nbsp;+&nbsp;(40%&nbsp;×&nbsp;Exam)</p>
                  <p className="text-slate-300">FPG&nbsp;=&nbsp;(Midterm&nbsp;+&nbsp;FinalTerm)&nbsp;/&nbsp;2</p>
                </div>

                {/* Buttons */}
                <div className="flex lg:flex-col gap-3 lg:justify-end lg:min-w-[220px]">
                  <button
                    id="calculate-btn"
                    onClick={handleCalculate}
                    disabled={!allFilled}
                    className={`
                      flex-1 lg:flex-none py-3.5 lg:py-4 rounded-xl font-700 text-sm transition-all duration-200
                      ${allFilled
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 glow-brand cursor-pointer'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {calculated ? 'Recalculate' : 'Calculate Grade'}
                  </button>
                  <button
                    id="reset-btn"
                    onClick={handleReset}
                    className="px-5 py-3.5 lg:py-4 rounded-xl font-600 text-sm border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all duration-200 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ── Results panel (below inputs) ── */}
            <div>
              {result ? (
                <ResultCard key={JSON.stringify(result)} result={result} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          {/* ── PDF Analyzer Section ── */}
          <div className="mt-16 pt-10 border-t border-slate-700/50">
             <PDFAnalyzer />
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700/40 py-6 text-center text-xs text-slate-600">
          <p>QCU Grade Calculator · Based on the official QCU Grading System 2025</p>
          <p className="mt-1">For reference only. Always verify with your instructor.</p>
        </footer>
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="glass-card rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-center text-center lg:text-left gap-6 min-h-[180px]">
    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 18px 2px #6366f144' }}>
      <i className="fa-solid fa-graduation-cap text-2xl lg:text-3xl" style={{ color: '#a5b4fc', filter: 'drop-shadow(0 0 6px #818cf8cc)' }} />
    </div>
    <div className="flex-1">
      <p className="text-lg font-700 text-slate-200 mb-1">No results yet</p>
      <p className="text-sm text-slate-500 max-w-sm lg:max-w-none">
        Fill in your Midterm and Final Term scores above, then click{' '}
        <strong className="text-indigo-400">Calculate Grade</strong>.
      </p>
      <div className="flex gap-2 flex-wrap justify-center lg:justify-start mt-3">
        {['Midterm CS', 'Midterm Exam', 'Final CS', 'Final Exam'].map((label) => (
          <span
            key={label}
            className="px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-400 text-xs border border-slate-700/60"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default App;
