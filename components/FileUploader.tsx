"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText, XCircle, CloudUpload, CheckCircle2, FolderOpen } from "lucide-react";

interface FileEntry {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

const FileUploader = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      })),
    ]);
  }, []);

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 500,
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6">
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
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-success" />
                  Max 500 files
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
            <button className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 btn-hover-lift flex items-center justify-center gap-2">
              <CloudUpload size={18} />
              Process Documents
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;