"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function CsvUploadDropzone({ onFileSelected, disabled }: { onFileSelected: (file: File) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-base-300"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <UploadCloud size={28} className="mx-auto mb-2 opacity-50" />
      <p className="font-medium">Drag your CSV here, or click to browse</p>
      <p className="text-sm opacity-60 mt-1">Columns: date, type, category, amount, description</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
