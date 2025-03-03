"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/loading";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  submissionId: string;
  courseId: string;
}

export const FileUpload = ({ onFileSelect, submissionId, courseId }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      // Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit');
      }

      setIsUploading(true);
      
      // Log file details for debugging
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Create a unique file path following the exact bucket hierarchy
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${file.name.split('.')[0]}-${timestamp}.${fileExt}`;
      // Using the exact path structure from your Supabase bucket
      const filePath = `courses/${fileName}`;
      
      console.log('Upload path:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('NUST-1')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file');
      }

      console.log('Upload successful:', data);

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('NUST-1')
        .getPublicUrl(filePath);

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

      // Pass the file and its URL to the parent component
      onFileSelect(file);
      
      return publicUrl;
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: errorMessage,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      await handleUpload(file);
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
    },
    maxSize: 10 * 1024 * 1024, // 10MB
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
            "Drop your file here"
          ) : (
            <>
              Drag and drop your file here, or{" "}
              <span className="text-primary font-medium">click to select</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">
          Supported files: PDF, DOC, DOCX, ZIP (Max size: 10MB)
        </p>
      </div>
    </div>
  );
}; 