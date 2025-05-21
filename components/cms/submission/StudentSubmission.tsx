import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  course_instructor_id: number;
}

interface Submission {
  submission_id: number;
  file_url: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

export function StudentSubmission() {
  const params = useParams();
  const assignmentId = parseInt(params.assignment_id as string);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) {
          setError('User information not found. Please sign in again.');
          setIsLoading(false);
          return;
        }

        console.log('Fetching student ID for user:', user.id);
        // Fetch student ID
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          console.error('Error fetching student data:', studentError);
          if (studentError.code === 'PGRST116') {
            // No student record found
            setError(`No student record found for your user account. Please contact support.`);
            setIsLoading(false);
            return;
          }
          throw studentError;
        }

        console.log('Found student ID:', studentData?.student_id);
        setStudentId(studentData.student_id);

        console.log('Fetching assignment details for assignment ID:', assignmentId);
        // Fetch assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('assignment_id', assignmentId)
          .single();

        if (assignmentError) {
          console.error('Error fetching assignment details:', assignmentError);
          throw assignmentError;
        }

        console.log('Found assignment details:', assignmentData);
        setAssignment(assignmentData);

        console.log('Checking for existing submission');
        // Fetch student's submission if exists
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', studentData.student_id)
          .single();

        if (submissionError) {
          if (submissionError.code !== 'PGRST116') { // Not found is expected
            console.error('Error checking submission:', submissionError);
          }
        } else {
          console.log('Found existing submission:', submissionData);
          setSubmission(submissionData);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, user?.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student information not found",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${Date.now()}.${fileExt}`;
      const filePath = `assignments/${assignmentId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create submission record
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: studentId,
          file_url: filePath,
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      setSubmission(submissionData);
      toast({
        title: "Success",
        description: "Assignment submitted successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
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
        Assignment not found
      </div>
    );
  }

  const isOverdue = (() => {
    const today = new Date();
    const dueDate = new Date(assignment.due_date);
    
    // Reset time components for date-only comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return today > dueDate;
  })();

  return (
    <div className="p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-gray-500">
              Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {isOverdue && !submission && (
              <Badge variant="warning">Overdue</Badge>
            )}
          </div>
        </div>

        {submission ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">Submitted</Badge>
              <span className="text-sm text-gray-500">
                on {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {submission.grade !== null && (
              <div>
                <p className="font-semibold">Grade: {submission.grade}%</p>
                {submission.feedback && (
                  <p className="text-gray-600 mt-1">{submission.feedback}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isSubmitting}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                asChild
              >
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Uploading..." : "Upload Submission"}
                </div>
              </Button>
            </label>
            {isOverdue && (
              <p className="text-sm text-orange-500 mt-2">
                Note: This submission will be marked as late
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
} 