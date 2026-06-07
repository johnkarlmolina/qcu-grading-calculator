import React, { useState, useEffect, useCallback } from 'react';
import PDFUploadZone, { type UploadedFile } from './PDFUploadZone';
import PDFResultCard, { type PDFAnalysisResult } from './PDFResultCard';
import { extractTextFromPDF, detectDocumentType, parseSubjects } from '../utils/pdfParser';
import { computeGWA } from '../utils/gwaCalculator';

const PDFAnalyzer: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<PDFAnalysisResult[]>([]);

  // Load initial results from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qcu_pdf_results');
      if (stored) {
        setResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load stored results', e);
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    try {
      if (results.length > 0) {
        localStorage.setItem('qcu_pdf_results', JSON.stringify(results));
      } else {
        localStorage.removeItem('qcu_pdf_results');
      }
    } catch (e) {
      console.error('Failed to save results', e);
    }
  }, [results]);

  const processFile = async (uploadedFile: UploadedFile) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'parsing' } : f))
    );

    try {
      const rawText = await extractTextFromPDF(uploadedFile.file);
      const docType = detectDocumentType(rawText);
      const subjects = parseSubjects(rawText);
      const gwaResult = computeGWA(subjects);

      const newResult: PDFAnalysisResult = {
        fileName: uploadedFile.file.name,
        docType,
        subjects,
        gwaResult,
        rawText,
        analyzedAt: Date.now(),
      };

      // Add to results, replacing any previous result with the same filename
      setResults((prev) => {
        const filtered = prev.filter((r) => r.fileName !== newResult.fileName);
        return [newResult, ...filtered];
      });

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'done' } : f))
      );
    } catch (error) {
      console.error('Failed to parse PDF', error);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: 'error', errorMsg: (error as Error).message || 'Failed to parse PDF' }
            : f
        )
      );
    }
  };

  const handleFilesAdded = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'queued',
    }));

    setUploadedFiles((prev) => [...newFiles, ...prev]);

    // Process all new files concurrently
    newFiles.forEach((file) => processFile(file));
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove && fileToRemove.status === 'done') {
         setResults((rPrev) => rPrev.filter((r) => r.fileName !== fileToRemove.file.name));
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);
  
  const handleClearAll = () => {
    setUploadedFiles([]);
    setResults([]);
    localStorage.removeItem('qcu_pdf_results');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section for the analyzer */}
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-xl font-800 text-white flex items-center gap-2">
             <i className="fa-solid fa-file-pdf text-red-400" />
             PDF Academic Analyzer
           </h3>
           <p className="text-sm text-slate-400 mt-1">
             Upload your Grade Slip or Program of Study to automatically compute your GWA and Latin Honor eligibility.
           </p>
        </div>
        {results.length > 0 && (
          <button 
             onClick={handleClearAll}
             className="px-3 py-1.5 rounded-lg text-xs font-600 text-slate-400 border border-slate-700/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            Clear Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
        {/* Left: Upload Zone */}
        <div className="glass-card rounded-3xl p-6 lg:p-8">
          <PDFUploadZone
            onFilesAdded={handleFilesAdded}
            uploadedFiles={uploadedFiles}
            onRemove={handleRemoveFile}
          />
        </div>

        {/* Right: Results */}
        <div>
          {results.length > 0 ? (
            <PDFResultCard results={results} />
          ) : (
             <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px] h-full opacity-60">
                <i className="fa-solid fa-magnifying-glass-chart text-4xl text-slate-500" />
                <div>
                   <p className="text-sm font-600 text-slate-300">No PDF analyzed yet</p>
                   <p className="text-xs text-slate-500 mt-1">Upload a document to see your academic standing.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAnalyzer;
