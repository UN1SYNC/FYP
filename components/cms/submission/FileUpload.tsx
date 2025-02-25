"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8
        transition-colors duration-200 ease-in-out
        cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        hover:border-primary hover:bg-primary/5
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload 
          className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-gray-400'}`}
        />
        <p className="text-center text-sm text-gray-600">
          {isDragActive ? (
            "Drop your file here"
          ) : (
            <>
              Drag and drop your file here, or{" "}
              <span className="text-primary font-medium">click to select</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">
          Supported files: PDF, DOC, DOCX, ZIP
        </p>
      </div>
    </div>
  );
}; 