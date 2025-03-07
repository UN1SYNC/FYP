"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { FileUpload } from "./FileUpload";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/loading";

interface TeacherUploadProps {
  courseId: number;
}

export function TeacherUpload({ courseId }: TeacherUploadProps) {
  const [title, setTitle] = useState("");
  const [weekNo, setWeekNo] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const supabase = createClient();
  const { toast } = useToast();

  const handleUploadComplete = (paths: string[]) => {
    setFilePaths((prevPaths) => [...prevPaths, ...paths]);
    toast({
      title: "Success",
      description: `${paths.length} file(s) selected successfully`,
      className: "bg-green-500 border-green-500 text-white",
      duration: 1000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic title",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    if (filePaths.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one file",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data, error } = await supabase
        .from('course_content')
        .insert({
          course_id: courseId,
          week_no: weekNo,
          topic_name: title,
          path: filePaths,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Content uploaded successfully!",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });
      
      // Reset form
      setTitle("");
      setWeekNo(1);
      setFilePaths([]);
    } catch (error) {
      console.error("Error uploading content:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'details' in error
          ? (error as { details: string }).details
          : "Failed to upload content. Please try again.";

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

  // Get the folder path based on the correct bucket structure
  const getFolderPath = () => {
    return `seecs-1/2023-1/ES101/content/week-${weekNo}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload Course Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Topic Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter topic title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="weekNo">Week Number</Label>
          <Input
            id="weekNo"
            type="number"
            min={1}
            max={16}
            value={weekNo}
            onChange={(e) => setWeekNo(parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <Label>Upload Files</Label>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            bucketName="NUST-1"
            folderPath={getFolderPath()}
            multiple={true}
          />
        </div>

        {filePaths.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files:</Label>
            <div className="bg-gray-50 p-2 rounded">
              {filePaths.map((path, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {path.split('/').pop()}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <Loading />
              <span className="ml-2">Uploading...</span>
            </div>
          ) : (
            "Add Content"
          )}
        </Button>
      </form>
    </div>
  );
} 