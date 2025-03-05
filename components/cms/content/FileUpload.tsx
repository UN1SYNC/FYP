"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/loading";

interface FileUploadProps {
  onUploadComplete: (paths: string[]) => void;
  bucketName: string;
  folderPath: string;
  multiple?: boolean;
}

export const FileUpload = ({ onUploadComplete, bucketName, folderPath, multiple = false }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      const uploadedPaths: string[] = [];

      for (const file of files) {
        // Validate file size (max 50MB)
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} exceeds 50MB limit`);
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const timestamp = Date.now();
        const fileName = `${file.name.split('.')[0]}-${timestamp}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        uploadedPaths.push(filePath);
      }

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully!`,
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });

      onUploadComplete(uploadedPaths);
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Failed to upload file(s). Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      await handleUpload(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8
        transition-colors duration-200 ease-in-out
        cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        {isUploading ? (
          <Loading />
        ) : (
          <Upload 
            className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-gray-400'}`}
          />
        )}
        <p className="text-center text-sm text-gray-600">
          {isUploading ? (
            "Uploading..."
          ) : isDragActive ? (
            "Drop your files here"
          ) : (
            <>
              Drag and drop your files here, or{" "}
              <span className="text-primary font-medium">click to select</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">
          Supported files: PDF, DOC, DOCX, PPT, PPTX, ZIP, JPG, PNG (Max size: 50MB)
        </p>
      </div>
    </div>
  );
}; 