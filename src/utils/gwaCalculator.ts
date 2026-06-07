// ─── GWA Calculator ──────────────────────────────────────────────────────────
// QCU uses a 1.00–5.00 numerical grading scale (lower = better).
// GWA = Σ(grade × units) / Σ(units)

export interface SubjectRow {
  code: string;
  name: string;
  units: number;
  grade: number;
  rawGrade: string; // original string from PDF
  passed: boolean;
}

export type LatinHonor =
  | 'Summa Cum Laude'
  | 'Magna Cum Laude'
  | 'Cum Laude'
  | 'Not Eligible';

export type GWAStanding =
  | 'Excellent'
  | 'Very Good'
  | 'Good'
  | 'Fair'
  | 'Poor';

export interface GWAResult {
  gwa: number;
  totalUnits: number;
  subjectCount: number;
  latinHonor: LatinHonor;
  standing: GWAStanding;
  passedSubjects: number;
  failedSubjects: number;
}

/**
 * Compute GWA from an array of subject rows.
 * Only subjects with a valid numerical grade and units > 0 are counted.
 */
export function computeGWA(subjects: SubjectRow[]): GWAResult {
  const valid = subjects.filter(
    (s) => s.units > 0 && s.grade >= 1.0 && s.grade <= 5.0
  );

  const totalWeighted = valid.reduce((sum, s) => sum + s.grade * s.units, 0);
  const totalUnits = valid.reduce((sum, s) => sum + s.units, 0);

  const gwa = totalUnits > 0 ? totalWeighted / totalUnits : 0;
  const rounded = Math.round(gwa * 100) / 100;

  return {
    gwa: rounded,
    totalUnits,
    subjectCount: valid.length,
    latinHonor: getLatinHonor(rounded),
    standing: getGWAStanding(rounded),
    passedSubjects: valid.filter((s) => s.passed).length,
    failedSubjects: valid.filter((s) => !s.passed).length,
  };
}

/**
 * QCU Latin Honor criteria (based on general Philippine university standards):
 * Summa Cum Laude  : GWA 1.00 – 1.20
 * Magna Cum Laude  : GWA 1.21 – 1.45
 * Cum Laude        : GWA 1.46 – 1.75
 * Not Eligible     : GWA > 1.75 or no subjects
 */
export function getLatinHonor(gwa: number): LatinHonor {
  if (gwa === 0) return 'Not Eligible';
  if (gwa <= 1.20) return 'Summa Cum Laude';
  if (gwa <= 1.45) return 'Magna Cum Laude';
  if (gwa <= 1.75) return 'Cum Laude';
  return 'Not Eligible';
}

/**
 * Map GWA range to academic standing descriptor.
 */
export function getGWAStanding(gwa: number): GWAStanding {
  if (gwa === 0) return 'Poor';
  if (gwa <= 1.50) return 'Excellent';
  if (gwa <= 1.75) return 'Very Good';
  if (gwa <= 2.25) return 'Good';
  if (gwa <= 3.00) return 'Fair';
  return 'Poor';
}
