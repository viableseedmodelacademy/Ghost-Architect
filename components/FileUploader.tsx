import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText, XCircle } from "lucide-react";

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

  return (
    <div className="border-2 border-dashed border-gold p-6 rounded-lg text-center cursor-pointer hover:bg-navy-light transition-colors">
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center min-h-[150px]"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-gold text-lg">Drop the PDFs here ...</p>
        ) : (
          <p className="text-gold text-lg">
            <FileUp className="inline-block mr-2" size={24} />
            Drag & drop legal PDFs here, or click to select files (Max 500)
          </p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="text-xl font-semibold mb-3">Uploaded Files:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between bg-navy-dark p-3 rounded-md shadow-sm"
              >
                <div className="flex items-center">
                  <FileText className="mr-3 text-gold" size={20} />
                  <span className="text-white">{file.name}</span>
                  <span className="ml-4 text-sm text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-gold hover:text-red-500 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
