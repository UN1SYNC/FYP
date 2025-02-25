"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { calculateTimeRemaining } from "@/lib/utils/date";
import { FileUpload } from "./FileUpload";
import { useToast } from "@/hooks/use-toast";

interface AddSubmissionProps {
  submissionId: string;
  courseId: string;
}

export const AddSubmission = ({ submissionId, courseId }: AddSubmissionProps) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sample data - replace with dynamic data later
  const submissionDetails = {
    title: "Assignment 2",
    attemptNumber: "This is attempt 1",
    submissionStatus: "No attempt",
    gradingStatus: "Not graded",
    dueDate: "Sunday, 17 November 2024, 11:59 PM",
    timeRemaining: "97 days 2 hours", // This should be calculated dynamically
    lastModified: "-",
    comments: 0,
  };

  useEffect(() => {
    const dueDate = new Date("2024-11-17T23:59:00"); // Replace with actual due date
    
    // Update time remaining initially
    setTimeRemaining(calculateTimeRemaining(dueDate));
    
    // Update time remaining every minute
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dueDate));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "File selected",
      description: `${file.name} has been selected for upload.`,
      className:"bg-yellow-500 border-yellow-500 text-white",
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
      // For example, using Supabase storage:
      // const { data, error } = await supabase.storage
      //   .from('submissions')
      //   .upload(`${courseId}/${submissionId}/${selectedFile.name}`, selectedFile);

      toast({
        title: "Success",
        description: "Your submission has been uploaded successfully.",
        className:"bg-green-500 border-green-500 text-white",
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

  return (
    <div className="w-full p-4 md:p-6">
      <Card className="w-full">
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-6">{submissionDetails.title}</h1>
          
          <div className="space-y-6">
            {/* Grid layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Attempt number</span>
                <p className="text-sm">{submissionDetails.attemptNumber}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Submission status</span>
                <p className="text-sm">{submissionDetails.submissionStatus}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Grading status</span>
                <p className="text-sm">{submissionDetails.gradingStatus}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Due date</span>
                <p className="text-sm">{submissionDetails.dueDate}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Time remaining</span>
                <p className="text-sm text-red-500">Assignment is overdue by {timeRemaining}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Last modified</span>
                <p className="text-sm">{submissionDetails.lastModified}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Submission comments</span>
                <p className="text-sm">Comments ({submissionDetails.comments})</p>
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
                    <FileUpload onFileSelect={handleFileSelect} />
                    
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
                You have not made a submission yet.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 