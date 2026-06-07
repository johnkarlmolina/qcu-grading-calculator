import React, { useCallback, useRef, useState } from 'react';

export interface UploadedFile {
  id: string;
  file: File;
  status: 'queued' | 'parsing' | 'done' | 'error';
  errorMsg?: string;
}

interface PDFUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemove: (id: string) => void;
}

const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  onFilesAdded,
  uploadedFiles,
  onRemove,
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const pdfs = Array.from(files).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      if (pdfs.length > 0) onFilesAdded(pdfs);
    },
    [onFilesAdded]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const statusIcon: Record<UploadedFile['status'], React.ReactNode> = {
    queued:  <i className="fa-solid fa-clock text-slate-400" />,
    parsing: <i className="fa-solid fa-spinner fa-spin text-indigo-400" />,
    done:    <i className="fa-solid fa-circle-check text-emerald-400" />,
    error:   <i className="fa-solid fa-circle-exclamation text-red-400" />,
  };

  const statusLabel: Record<UploadedFile['status'], string> = {
    queued:  'Queued',
    parsing: 'Parsing…',
    done:    'Done',
    error:   'Error',
  };

  const statusColor: Record<UploadedFile['status'], string> = {
    queued:  'text-slate-400 bg-slate-700/40 border-slate-600/40',
    parsing: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
    done:    'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    error:   'text-red-300 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8
          flex flex-col items-center justify-center gap-3 text-center
          transition-all duration-200 select-none
          ${dragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-600/60 hover:border-indigo-500/60 hover:bg-indigo-500/5 bg-slate-800/30'
          }
        `}
      >
        {/* Animated upload icon */}
        <div
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200
            ${dragging
              ? 'bg-indigo-500/20 border border-indigo-400/50'
              : 'bg-slate-700/50 border border-slate-600/40'
            }
          `}
          style={dragging ? { boxShadow: '0 0 20px #6366f155' } : {}}
        >
          <i
            className={`fa-solid fa-file-arrow-up text-2xl transition-all duration-200 ${
              dragging ? 'text-indigo-300' : 'text-slate-400'
            }`}
          />
        </div>

        <div>
          <p className="text-sm font-600 text-slate-200">
            {dragging ? 'Drop PDF files here' : 'Drag & drop PDF files'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            or <span className="text-indigo-400 font-600">click to browse</span> · Multiple files allowed
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {['Grade Slip', 'Program of Study'].map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/40 text-xs text-slate-400"
            >
              <i className="fa-solid fa-file-pdf text-red-400 mr-1" />
              {t}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadedFiles.map((uf) => (
            <div
              key={uf.id}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border
                transition-all duration-300 ${statusColor[uf.status]}
              `}
            >
              <i className="fa-solid fa-file-pdf text-red-400 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-slate-200 truncate">{uf.file.name}</p>
                {uf.errorMsg && (
                  <p className="text-xs text-red-400 mt-0.5 truncate">{uf.errorMsg}</p>
                )}
              </div>

              <span className="flex items-center gap-1.5 text-xs font-600 shrink-0">
                {statusIcon[uf.status]}
                {statusLabel[uf.status]}
              </span>

              {(uf.status === 'done' || uf.status === 'error') && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(uf.id); }}
                  className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-600/40 transition-colors"
                  aria-label="Remove file"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFUploadZone;
