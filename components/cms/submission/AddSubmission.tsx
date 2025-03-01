"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { calculateTimeRemaining } from "@/lib/utils/date";
import { FileUpload } from "./FileUpload";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import Loading from "@/components/ui/loading";

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  file_path: string | null;
}

interface AddSubmissionProps {
  submissionId: string;
  courseId: string;
}

export const AddSubmission = ({ submissionId, courseId }: AddSubmissionProps) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Hardcoded status values
  const submissionStatus = "No attempt";
  const gradingStatus = "Not graded";

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const assignmentId = parseInt(submissionId);
        if (isNaN(assignmentId)) {
          throw new Error('Invalid assignment ID');
        }

        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('assignment_id', assignmentId)
          .single();

        if (error) {
          throw error;
        }

        setAssignment(data);

        // Calculate time remaining
        if (data.due_date) {
          const dueDate = new Date(data.due_date);
          const now = new Date();
          setIsOverdue(now > dueDate);
          
          // Update time remaining initially
          const remaining = calculateTimeRemaining(dueDate);
          setTimeRemaining(remaining);
          
          // Update time remaining every minute
          const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(dueDate));
          }, 60000);

          return () => clearInterval(timer);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch assignment details');
      }
    };

    fetchAssignment();
  }, [submissionId]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "File selected",
      description: `${file.name} has been selected for upload.`,
      className: "bg-yellow-500 border-yellow-500 text-white",
      duration: 1000
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to submit.",
      });
      return;
    }

    try {
      // Here you would implement your file upload logic
      toast({
        title: "Success",
        description: "Your submission has been uploaded successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000
      });
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload your submission. Please try again.",
      });
    }
  };

  if (error) {
    return (
      <div className="w-full p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <Card className="w-full">
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-6">{assignment.title}</h1>
          
          <div className="space-y-6">
            {/* Grid layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Description</span>
                <p className="text-sm">{assignment.description}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Submission status</span>
                <p className="text-sm">{submissionStatus}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Grading status</span>
                <p className="text-sm">{gradingStatus}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Due date</span>
                <p className="text-sm">{new Date(assignment.due_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Time remaining</span>
                <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-green-500'}`}>
                  {isOverdue 
                    ? `Assignment is overdue by ${timeRemaining}`
                    : `Assignment is due in ${timeRemaining}`
                  }
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Last modified</span>
                <p className="text-sm">{assignment.file_path ? new Date(assignment.created_at).toLocaleString() : '-'}</p>
              </div>
            </div>

            {/* Add submission section */}
            <div className="flex flex-col items-start">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">Add submission</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add Submission</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Upload Submission</h3>
                      <FileUpload 
                        onFileSelect={handleFileSelect} 
                        submissionId={submissionId}
                        courseId={courseId}
                      />
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm truncate">{selectedFile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedFile}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <p className="text-sm text-gray-500 mt-4">
                {submissionStatus === "No attempt" ? "You have not made a submission yet." : "Your submission is pending review."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 