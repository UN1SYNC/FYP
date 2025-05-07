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
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { download } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface SubmissionInfo {
  submission_path: string | null;
  gained_grades: number;
  total_grade: number;
  student_id: number;
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
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchAssignmentAndSubmission = async () => {
      try {
        setIsLoading(true);
        const assignmentId = parseInt(submissionId);
        
        if (isNaN(assignmentId) || !user) {
          throw new Error('Invalid assignment ID or user not logged in');
        }

        // Get student ID for current user
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          throw studentError;
        }

        const studentId = studentData.student_id;

        // Fetch assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('assignment_id', assignmentId)
          .single();

        if (assignmentError) {
          throw assignmentError;
        }

        setAssignment(assignmentData);

        // Check for existing submission
        const { data: submissionData, error: submissionError } = await supabase
          .from('assignment_grades')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', studentId)
          .maybeSingle();

        if (submissionError) {
          throw submissionError;
        }

        // If student has a submission already
        if (submissionData) {
          setSubmissionInfo(submissionData);
        } else {
          // Create an empty submission record if one doesn't exist
          const { data: newSubmission, error: createError } = await supabase
            .from('assignment_grades')
            .insert({
              assignment_id: assignmentId,
              student_id: studentId,
              submission_path: null,
              gained_grades: 0,
              total_grade: 100
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setSubmissionInfo(newSubmission);
        }

        // Calculate time remaining
        if (assignmentData.due_date) {
          const dueDate = new Date(assignmentData.due_date);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentAndSubmission();
  }, [submissionId, user]);

  const handleFileSelect = (file: File, filePath: string) => {
    setSelectedFile(file);
    setSelectedFilePath(filePath);
    toast({
      title: "File selected",
      description: `${file.name} has been selected for upload.`,
      className: "bg-yellow-500 border-yellow-500 text-white",
      duration: 1000
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedFilePath || !submissionInfo) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to submit.",
      });
      return;
    }

    try {
      // Update the assignment_grades record with the file path
      const { error: updateError } = await supabase
        .from('assignment_grades')
        .update({
          submission_path: selectedFilePath,
          // File name can be stored if needed
          file_name: selectedFile.name,
        })
        .eq('assignment_id', parseInt(submissionId))
        .eq('student_id', submissionInfo.student_id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setSubmissionInfo({
        ...submissionInfo,
        submission_path: selectedFilePath
      });

      toast({
        title: "Success",
        description: "Your submission has been uploaded successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000
      });
      
      setIsModalOpen(false);
      setSelectedFile(null);
      setSelectedFilePath(null);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload your submission. Please try again.",
      });
    }
  };

  const handleDownload = async () => {
    if (!submissionInfo?.submission_path) return;
    
    try {
      // Ensure bucket exists
      const bucketName = 'submissions';
      try {
        // First try to get the bucket
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
  
        // If bucket doesn't exist (404 error)
        if (bucketError && bucketError.message?.includes('Bucket not found')) {
          console.log(`Bucket "${bucketName}" not found, creating it...`);
          
          // Create the bucket with public access
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true, // Make it publicly accessible
          });
  
          if (error) {
            throw new Error(`Failed to create bucket: ${error.message}`);
          }
          
          console.log(`Bucket "${bucketName}" created successfully`);
        } else if (bucketError) {
          throw bucketError;
        }
      } catch (error) {
        console.error('Error ensuring bucket exists:', error);
      }

      // Download the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(submissionInfo.submission_path);
        
      if (error) throw error;
      
      // Parse the file name from path
      const fileName = submissionInfo.submission_path.split('/').pop() || 'download';
      download(data, fileName);
      
      toast({
        title: "Success",
        description: "File downloaded successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Failed to download your submission.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

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

  const submissionStatus = submissionInfo?.submission_path ? "Submitted" : "No attempt";
  const gradingStatus = submissionInfo?.submission_path 
    ? (submissionInfo.gained_grades > 0 ? `${submissionInfo.gained_grades}/${submissionInfo.total_grade}` : "Not graded") 
    : "Not graded";

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
                <p className="text-sm">
                  <Badge variant={submissionStatus === "Submitted" ? "success" : "warning"}>
                    {submissionStatus}
                  </Badge>
                </p>
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
              
              {submissionInfo?.submission_path && (
              <div className="space-y-1">
                  <span className="text-sm font-semibold text-gray-700">Your submission</span>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-sm"
                    onClick={handleDownload}
                  >
                    <FileText size={14} className="mr-1" />
                    <span className="truncate max-w-[180px]">
                      {submissionInfo.submission_path.split('/').pop()}
                    </span>
                    <Download size={14} className="ml-1" />
                  </Button>
              </div>
              )}
            </div>

            {/* Add submission section */}
            <div className="flex flex-col items-start">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    {submissionInfo?.submission_path ? "Update submission" : "Add submission"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {submissionInfo?.submission_path ? "Update Submission" : "Add Submission"}
                    </DialogTitle>
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
                          onClick={() => {
                            setSelectedFile(null);
                            setSelectedFilePath(null);
                          }}
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
                {submissionInfo?.submission_path 
                  ? "You can update your submission until the due date."
                  : "You have not made a submission yet."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 