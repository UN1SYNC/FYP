"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Loading from "@/components/ui/loading";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface Assignment {
  assignment_id: number;
  title: string;
  due_date: string;
  description: string;
  status?: string;
}

const Submission = () => {
  const params = useParams();
  const courseId = parseInt(params.course_id as string);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (isNaN(courseId) || !user) {
          throw new Error('Invalid course ID or user not logged in');
        }

        // First, get the student_id for the current user
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          throw studentError;
        }

        const studentId = studentData.student_id;

        // Fetch assignments for this course
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId);

        if (assignmentsError) {
          throw assignmentsError;
        }

        // Fetch submission statuses from assignment_grades table
        const { data: gradesData, error: gradesError } = await supabase
          .from('assignment_grades')
          .select('assignment_id, submission_path')
          .eq('student_id', studentId);

        if (gradesError) {
          throw gradesError;
        }

        // Create a map of assignment_id to submission status
        const submissionMap = new Map();
        gradesData?.forEach(grade => {
          submissionMap.set(grade.assignment_id, grade.submission_path ? "Submitted" : "Not Submitted");
        });

        // Add status to each assignment
        const assignmentsWithStatus = assignmentsData.map(assignment => ({
          ...assignment,
          status: submissionMap.get(assignment.assignment_id) || "Not Submitted"
        }));

        setAssignments(assignmentsWithStatus);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId, user]);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-500">No assignments found</div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Link 
              href={`/cms/${courseId}/submission/${assignment.assignment_id}`}
              key={assignment.assignment_id}
            >
              <motion.div
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{assignment.title}</h2>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={assignment.status === "Submitted" ? "success" : "warning"}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submission;
