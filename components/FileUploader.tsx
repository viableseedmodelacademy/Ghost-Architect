"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText, XCircle, CloudUpload, CheckCircle2, FolderOpen, AlertTriangle } from "lucide-react";

interface FileEntry {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string;
}

interface FileUploaderProps {
  onFilesProcessed?: (files: FileEntry[]) => void;
  processedFiles?: FileEntry[];
}

const MAX_FILES = 500;

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesProcessed, processedFiles = [] }) => {
  const [files, setFiles] = useState<FileEntry[]>(processedFiles);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Check if adding these files would exceed the limit
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed. You currently have ${files.length} files and are trying to add ${acceptedFiles.length} more.`);
      return;
    }

    // Read file contents
    const filePromises = acceptedFiles.map((file) => {
      return new Promise<FileEntry>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            content: reader.result as string,
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file); // Read as base64 for PDF support
      });
    });

    Promise.all(filePromises)
      .then((newFiles) => {
        setFiles((prev) => [...prev, ...newFiles]);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [files.length]);

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: MAX_FILES,
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const handleProcessFiles = () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    // Pass files to parent component for chat integration
    if (onFilesProcessed) {
      onFilesProcessed(files);
    }
    
    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error animate-fade-in">
          <AlertTriangle size={20} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragActive
            ? "border-gold bg-gold/5 scale-[1.02]"
            : "border-border hover:border-gold/50 bg-surface/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
              isDragActive
                ? "bg-gold/20 scale-110"
                : "bg-surface"
            }`}
          >
            {isDragActive ? (
              <CloudUpload className="text-gold animate-bounce" size={32} />
            ) : (
              <FileUp className="text-gold" size={32} />
            )}
          </div>
          
          {isDragActive ? (
            <div className="animate-fade-in">
              <p className="text-lg font-semibold text-gold mb-1">Drop your files here</p>
              <p className="text-sm text-muted">Release to upload your legal documents</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-gold mb-2">
                Upload Legal Documents
              </p>
              <p className="text-sm text-muted mb-4">
                Drag & drop PDF files here, or click to browse
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-success" />
                  PDF only
                </span>
                <span className={`flex items-center gap-1 ${files.length >= MAX_FILES ? 'text-error' : ''}`}>
                  <CheckCircle2 size={14} className={files.length >= MAX_FILES ? "text-error" : "text-success"} />
                  {files.length}/{MAX_FILES} files
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-success" />
                  Secure upload
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-surface/30 rounded-2xl border border-border overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="text-gold" size={20} />
              <div>
                <h3 className="font-semibold text-gold">Uploaded Documents</h3>
                <p className="text-xs text-muted">
                  {files.length} file{files.length !== 1 ? "s" : ""} • {(totalSize / 1024 / 1024).toFixed(2)} MB total
                </p>
              </div>
            </div>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-muted hover:text-error transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* File List */}
          <ul className="max-h-64 overflow-y-auto divide-y divide-border">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="p-4 flex items-center justify-between hover:bg-surface/50 transition-colors group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-navy-dark flex items-center justify-center flex-shrink-0">
                    <FileText className="text-gold" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gold truncate">{file.name}</p>
                    <p className="text-xs text-muted">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                  }}
                  className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <XCircle size={18} />
                </button>
              </li>
            ))}
          </ul>

          {/* Process Button */}
          <div className="p-4 border-t border-border bg-surface/50">
            <button 
              onClick={handleProcessFiles}
              disabled={processing || files.length === 0}
              className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 btn-hover-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudUpload size={18} className={processing ? "animate-spin" : ""} />
              {processing ? "Processing..." : "Process Documents"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;