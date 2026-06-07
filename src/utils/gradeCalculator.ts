export interface GradeInputs {
  midtermClassStanding: number;
  midtermExam: number;
  finalClassStanding: number;
  finalExam: number;
}

export interface GradeResult {
  midtermGrade: number;
  finalTermGrade: number;
  finalPercentageGrade: number;
  numericalEquivalent: number;
  descriptiveRating: string;
  remarks: 'Passed' | 'Failed';
  academicStanding: AcademicStanding;
}

export type AcademicStanding = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

export interface GradeTableRow {
  range: string;
  min: number;
  max: number;
  numerical: number;
  descriptive: string;
}

export const GRADE_TABLE: GradeTableRow[] = [
  { range: '97–100', min: 97, max: 100, numerical: 1.00, descriptive: 'Excellent' },
  { range: '93–96',  min: 93, max: 96,  numerical: 1.25, descriptive: 'Excellent' },
  { range: '89–92',  min: 89, max: 92,  numerical: 1.50, descriptive: 'Very Good' },
  { range: '85–88',  min: 85, max: 88,  numerical: 1.75, descriptive: 'Very Good' },
  { range: '81–84',  min: 81, max: 84,  numerical: 2.00, descriptive: 'Good' },
  { range: '77–80',  min: 77, max: 80,  numerical: 2.25, descriptive: 'Good' },
  { range: '73–76',  min: 73, max: 76,  numerical: 2.50, descriptive: 'Fair' },
  { range: '69–72',  min: 69, max: 72,  numerical: 2.75, descriptive: 'Fair' },
  { range: '65–68',  min: 65, max: 68,  numerical: 3.00, descriptive: 'Poor' },
  { range: 'Below 65', min: 0, max: 64, numerical: 5.00, descriptive: 'Failed' },
];

function getNumericalEquivalent(percentage: number): number {
  for (const row of GRADE_TABLE) {
    if (percentage >= row.min && percentage <= row.max) {
      return row.numerical;
    }
  }
  return 5.00;
}

function getDescriptiveRating(percentage: number): string {
  for (const row of GRADE_TABLE) {
    if (percentage >= row.min && percentage <= row.max) {
      return row.descriptive;
    }
  }
  return 'Failed';
}

function getAcademicStanding(percentage: number): AcademicStanding {
  if (percentage >= 97) return 'Excellent';
  if (percentage >= 89) return 'Very Good';
  if (percentage >= 81) return 'Good';
  if (percentage >= 65) return 'Fair';
  return 'Poor';
}

export function calculateGrades(inputs: GradeInputs): GradeResult {
  const midtermGrade =
    0.6 * inputs.midtermClassStanding + 0.4 * inputs.midtermExam;

  const finalTermGrade =
    0.6 * inputs.finalClassStanding + 0.4 * inputs.finalExam;

  const finalPercentageGrade = (midtermGrade + finalTermGrade) / 2;

  const numericalEquivalent = getNumericalEquivalent(finalPercentageGrade);
  const descriptiveRating = getDescriptiveRating(finalPercentageGrade);
  const remarks = finalPercentageGrade >= 65 ? 'Passed' : 'Failed';
  const academicStanding = getAcademicStanding(finalPercentageGrade);

  return {
    midtermGrade: Math.round(midtermGrade * 100) / 100,
    finalTermGrade: Math.round(finalTermGrade * 100) / 100,
    finalPercentageGrade: Math.round(finalPercentageGrade * 100) / 100,
    numericalEquivalent,
    descriptiveRating,
    remarks,
    academicStanding,
  };
}
