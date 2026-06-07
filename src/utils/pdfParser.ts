// ─── PDF Parser (pdfjs-dist + Vite ?url worker) ──────────────────────────────
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { SubjectRow } from './gwaCalculator';

// Wire up the Vite-bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ── Type for detected document kind ──────────────────────────────────────────
export type DocType = 'grade-slip' | 'program-of-study' | 'unknown';

// ── Extract all text from every page of a PDF file ───────────────────────────
export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }
  return pages.join('\n');
}

// ── Detect document type from extracted text ──────────────────────────────────
export function detectDocumentType(text: string): DocType {
  const lower = text.toLowerCase();

  const gradeSlipKeywords = [
    'grade slip', 'final grade', 'midterm', 'final term',
    'semester', 'academic year', 'remarks', 'passed', 'failed',
    'instructor', 'faculty', 'class standing',
  ];

  const programKeywords = [
    'program of study', 'curriculum', 'first year', 'second year',
    'third year', 'fourth year', '1st year', '2nd year', '3rd year',
    '4th year', 'prerequisite', 'plan of study',
  ];

  const gradeScore = gradeSlipKeywords.filter((kw) => lower.includes(kw)).length;
  const programScore = programKeywords.filter((kw) => lower.includes(kw)).length;

  if (gradeScore === 0 && programScore === 0) return 'unknown';
  return gradeScore >= programScore ? 'grade-slip' : 'program-of-study';
}

// ── Parse subject rows from extracted text ────────────────────────────────────
// Strategy: scan line by line looking for patterns that contain:
//   - A subject code (e.g. "CC101", "MATH1", "GE 1")
//   - A number of units (1–6)
//   - A numerical grade (1.00–5.00 OR descriptive like "Passed"/"INC")
// This is intentionally loose to handle varied QCU PDF layouts.


export function parseSubjects(text: string): SubjectRow[] {
  const rows: SubjectRow[] = [];
  const seen = new Set<string>();

  // Global regex to split text into subject blocks
  const CODE_REGEX = /\b([A-Z]{2,5}\s*\d{1,4}[A-Z]?)\b/g;
  const matches = Array.from(text.matchAll(CODE_REGEX));

  if (matches.length === 0) return rows;

  for (let i = 0; i < matches.length; i++) {
    const codeMatch = matches[i];
    const code = codeMatch[1].replace(/\s+/g, '').toUpperCase();

    // Skip false positives (like PAGE 1, YEAR 2025, GRAD 5)
    if (/PAGE|YEAR|DATE|TIME|STUD|CODE|GRAD|UNIT|REMA/.test(code) || seen.has(code)) continue;

    const startIndex = codeMatch.index;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    
    // Get the segment, but limit it to max 200 chars to avoid parsing the entire end of document
    let segment = text.substring(startIndex, endIndex).replace(/\s+/g, ' ').trim();
    if (segment.length > 200) {
      segment = segment.substring(0, 200);
    }

    let grade = 0;
    let rawGrade = '';
    let units = 3;
    let passed = false;
    let name = '';

    const safeCode = codeMatch[1].replace(/\s+/g, '\\s*');

    // Strategy 1: Strict match with remarks (QCU Grade Slip format)
    // Pattern: [CODE] [NAME] [UNITS 1-6] [GRADE 1-5] [REMARKS]
    const strictWithRemarks = new RegExp(`^${safeCode}\\s+(.*?)\\s+([1-6](?:\\.0)?)\\s+([1-5](?:\\.\\d{1,2})?)\\s+(PASSED|FAILED|INC|DROP|WITHDRAWN)`, 'i');
    const match1 = strictWithRemarks.exec(segment);

    if (match1) {
      name = match1[1];
      units = Math.round(parseFloat(match1[2]));
      grade = parseFloat(match1[3]);
      rawGrade = match1[3];
      passed = grade <= 3.00 && grade >= 1.00;
    } else {
      // Strategy 2: Strict match WITHOUT remarks (e.g., Program of Study with grades)
      // Must use explicit decimal grade to avoid matching random numbers
      const strictDecimal = new RegExp(`^${safeCode}\\s+(.*?)\\s+([1-6](?:\\.0)?)\\s+([1-5]\\.(?:00|25|50|75))(?:\\s|$)`, 'i');
      const match2 = strictDecimal.exec(segment);

      if (match2) {
        name = match2[1];
        units = Math.round(parseFloat(match2[2]));
        grade = parseFloat(match2[3]);
        rawGrade = match2[3];
        passed = grade <= 3.00 && grade >= 1.00;
      } else {
        // Strategy 3: Descriptive grade only (e.g., 3 INC)
        const strictDescriptive = new RegExp(`^${safeCode}\\s+(.*?)\\s+([1-6](?:\\.0)?)\\s+(INC|DROP|WITHDRAWN|PASSED|FAILED)(?:\\s|$)`, 'i');
        const match3 = strictDescriptive.exec(segment);
        if (match3) {
          name = match3[1];
          units = Math.round(parseFloat(match3[2]));
          const desc = match3[3].toUpperCase();
          if (desc === 'PASSED') { grade = 3.00; passed = true; }
          else { grade = 5.00; passed = false; }
          rawGrade = desc;
        }
      }
    }

    // Only add if we successfully parsed a structured row
    if (grade > 0 && name.length > 1) {
      // Clean up name (remove weird trailing symbols if any)
      name = name.replace(/[^\w\s-]/g, '').trim();
      if (name.length > 50) name = name.substring(0, 50).trim() + '...';

      seen.add(code);
      rows.push({ code, name, units, grade, rawGrade, passed });
    }
  }

  return rows;
}
