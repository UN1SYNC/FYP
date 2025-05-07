"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { download } from "@/lib/utils";
import Loading from "@/components/ui/loading";
import { FileIcon, Download, Clock, Calendar, User } from "lucide-react";
import Link from "next/link";

interface Submission {
  submission_id?: string;
  assignment_id: number;
  student_id: number;
  created_at: string;
  submission_path: string | null;
  file_name?: string;
  gained_grades: number;
  total_grade: number;
  student: {
    name: string;
    email: string;
  };
}

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface InstructorAssignmentViewProps {
  submissionId: string;
  courseId: string;
}

export function InstructorAssignmentView({ submissionId, courseId }: InstructorAssignmentViewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchAssignmentAndSubmissions = async () => {
      try {
        setIsLoading(true);
        const assignmentId = parseInt(submissionId);
        
        if (isNaN(assignmentId)) {
          throw new Error('Invalid assignment ID');
        }

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

        // Fetch submissions for this assignment from assignment_grades
        const { data: gradesData, error: gradesError } = await supabase
          .from('assignment_grades')
          .select(`
            *,
            students (
              student_id,
              users (
                name,
                email
              )
            )
          `)
          .eq('assignment_id', assignmentId)
          .order('student_id', { ascending: true });

        if (gradesError) {
          throw gradesError;
        }

        // Format submissions data
        const formattedSubmissions = gradesData
          .filter(grade => grade.submission_path !== null) // Only include actual submissions
          .map((grade: any) => ({
            assignment_id: grade.assignment_id,
            student_id: grade.student_id,
            created_at: grade.updated_at || grade.created_at,
            submission_path: grade.submission_path as string,
            file_name: grade.file_name || grade.submission_path?.split('/').pop() || 'Unnamed file',
            gained_grades: grade.gained_grades,
            total_grade: grade.total_grade,
            student: {
              name: grade.students?.users?.name || 'Unknown Student',
              email: grade.students?.users?.email || 'No email'
            }
          }));

        setSubmissions(formattedSubmissions);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentAndSubmissions();
  }, [submissionId, supabase]);

  const handleDownload = async (submissionPath: string, fileName: string) => {
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

      // Get file from storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(submissionPath);

      if (error) {
        throw error;
      }

      // Download file
      download(data, fileName);

      toast({
        title: "Success",
        description: "File downloaded successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file",
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
      <div className="w-full p-6 text-center text-gray-500">
        <p>Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <Link href={`/cms/${courseId}/submission`} className="text-sm text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to assignments
        </Link>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2">
          <Badge className="flex items-center gap-1">
            <Calendar size={14} />
            <span>
              Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </Badge>
          <Badge className="flex items-center gap-1">
            <Clock size={14} />
            <span>
              Time: {new Date(assignment.due_date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </Badge>
          <Badge className="flex items-center gap-1">
            <User size={14} />
            <span>{submissions.length} submissions</span>
          </Badge>
        </div>
        <p className="mt-4 text-gray-700">{assignment.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border rounded-lg">
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={`${submission.assignment_id}-${submission.student_id}`} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{submission.student.name}</div>
                      <div className="text-sm text-gray-500">{submission.student.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(submission.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Grade: {submission.gained_grades > 0 ? 
                          `${submission.gained_grades}/${submission.total_grade}` : 
                          "Not graded"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FileIcon size={16} className="text-blue-500" />
                        <span className="text-sm">{submission.file_name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleDownload(
                          submission.submission_path, 
                          submission.file_name || 'download'
                        )}
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 