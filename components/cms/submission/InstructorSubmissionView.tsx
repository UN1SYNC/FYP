import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Loading from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Edit, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Submission {
  submission_id: number;
  student_id: number;
  student_name: string;
  submitted_at: string;
  file_url: string;
  grade?: number | null;
  feedback?: string;
}

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  course_instructor_id: number;
  total_marks?: number | null;
}

const gradeSchema = z.object({
  grade: z.string().transform((val) => val ? Number(val) : null),
  feedback: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeSchema>;
type FormValues = {
  grade: string;
  feedback: string;
};

const GradeSubmissionDialog = ({ 
  submission, 
  totalMarks,
  onGradeSubmit 
}: { 
  submission: Submission, 
  totalMarks?: number | null,
  onGradeSubmit: (submissionId: number, values: GradeFormValues) => Promise<void>
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(gradeSchema) as any,
    defaultValues: {
      grade: submission.grade !== null && submission.grade !== undefined ? submission.grade.toString() : "",
      feedback: submission.feedback || "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const parsedValues = gradeSchema.parse(values);
      
      // Validate grade is not greater than total marks
      if (totalMarks && parsedValues.grade && parsedValues.grade > totalMarks) {
        toast({
          title: "Error",
          description: `Grade cannot exceed the total marks (${totalMarks})`,
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }
      
      await onGradeSubmit(submission.submission_id, parsedValues);
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Submission graded successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grade submission",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Edit className="h-4 w-4 mr-2" />
          Grade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade {totalMarks ? `(out of ${totalMarks})` : '(%)'}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max={totalMarks?.toString() || "100"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export function InstructorSubmissionView() {
  const params = useParams();
  const assignmentId = parseInt(params.assignment_id as string);
  const courseId = parseInt(params.course_id as string);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        setError('User information not found. Please sign in again.');
        setIsLoading(false);
        return;
      }

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

      console.log('Found assignment:', assignmentData);
      setAssignment(assignmentData);

      console.log('Fetching instructor_id for user:', user.id);
      // First get instructor_id for the current user
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructors')
        .select('instructor_id')
        .eq('user_id', user.id);

      if (instructorError) {
        console.error('Error fetching instructor data:', instructorError);
        throw instructorError;
      }

      if (!instructorData || instructorData.length === 0) {
        console.error('No instructor record found for user:', user.id);
        setError('No instructor record found for your user account.');
        setIsLoading(false);
        return;
      }

      console.log('Found instructor records:', instructorData);

      // Check if any of the user's instructor records have access to this assignment
      let hasAccess = false;
      let validCourseInstructorId = null;

      for (const instructor of instructorData) {
        console.log(`Checking course_instructor for instructor_id: ${instructor.instructor_id} and course_id: ${courseId}`);
        const { data: courseInstructorData, error: courseInstructorError } = await supabase
          .from('course_instructor')
          .select('id')
          .eq('course_id', courseId)
          .eq('instructor_id', instructor.instructor_id);

        if (courseInstructorError) {
          console.error('Error fetching course_instructor:', courseInstructorError);
          continue;
        }

        if (!courseInstructorData || courseInstructorData.length === 0) {
          continue;
        }

        // Check if this instructor has access to this assignment through any of their course_instructor records
        for (const courseInstructor of courseInstructorData) {
          if (assignmentData.course_instructor_id === courseInstructor.id) {
            hasAccess = true;
            validCourseInstructorId = courseInstructor.id;
            break;
          }
        }

        if (hasAccess) break;
      }

      if (!hasAccess) {
        console.error('User does not have access to this assignment');
        setError('You do not have access to view submissions for this assignment');
        setIsLoading(false);
        return;
      }

      console.log('User has access to view this assignment through course_instructor_id:', validCourseInstructorId);

      console.log('Fetching submissions for assignment_id:', assignmentId);
      // Fetch submissions with student details
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          students (
            student_id,
            users (
              name
            )
          )
        `)
        .eq('assignment_id', assignmentId);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw submissionsError;
      }

      console.log('Found submissions:', submissionsData);

      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      const formattedSubmissions = submissionsData.map(submission => {
        if (!submission.students || !submission.students.users) {
          console.warn('Submission missing student data:', submission);
          return {
            submission_id: submission.submission_id,
            student_id: submission.student_id,
            student_name: 'Unknown Student',
            submitted_at: submission.submitted_at,
            file_url: submission.file_url,
            grade: submission.grade,
            feedback: submission.feedback
          };
        }

        return {
          submission_id: submission.submission_id,
          student_id: submission.students.student_id,
          student_name: submission.students.users.name,
          submitted_at: submission.submitted_at,
          file_url: submission.file_url,
          grade: submission.grade,
          feedback: submission.feedback
        };
      });

      console.log('Formatted submissions:', formattedSubmissions);
      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId, courseId, user?.id]);

  const handleDownload = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .download(fileUrl);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileUrl.split('/').pop() || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  const handleGradeSubmit = async (submissionId: number, values: GradeFormValues) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: values.grade,
          feedback: values.feedback
        })
        .eq('submission_id', submissionId);

      if (error) throw error;
      
      // Update local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.submission_id === submissionId 
            ? { ...sub, grade: values.grade, feedback: values.feedback }
            : sub
        )
      );
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
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

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href={`/cms/${courseId}/submission`} className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Assignments
        </Link>
      </div>
      
      <Card className="p-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Due Date:</span> {new Date(assignment.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {assignment.total_marks && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Total Marks:</span> {assignment.total_marks}
              </p>
            )}
          </div>
        </div>
      </Card>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-500 mt-6">
          No submissions yet
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.submission_id}>
                <TableCell>{submission.student_name}</TableCell>
                <TableCell>
                  {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    (() => {
                      // Convert both dates to Date objects and compare just the date part
                      const submissionDate = new Date(submission.submitted_at);
                      const dueDate = new Date(assignment.due_date);
                      
                      // Reset time components for date-only comparison
                      submissionDate.setHours(0, 0, 0, 0);
                      dueDate.setHours(0, 0, 0, 0);
                      
                      return submissionDate <= dueDate ? "success" : "warning";
                    })()
                  }>
                    {(() => {
                      const submissionDate = new Date(submission.submitted_at);
                      const dueDate = new Date(assignment.due_date);
                      
                      // Reset time components for date-only comparison
                      submissionDate.setHours(0, 0, 0, 0);
                      dueDate.setHours(0, 0, 0, 0);
                      
                      return submissionDate <= dueDate ? "On Time" : "Late";
                    })()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {submission.grade !== null && submission.grade !== undefined ? 
                    `${submission.grade}${assignment.total_marks ? `/${assignment.total_marks}` : '%'}` : 
                    'Not graded'}
                </TableCell>
                <TableCell className="flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(submission.file_url)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <GradeSubmissionDialog 
                    submission={submission}
                    totalMarks={assignment.total_marks} 
                    onGradeSubmit={handleGradeSubmit} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 