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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateAssignment } from "./CreateAssignment";

interface Assignment {
  assignment_id: number;
  title: string;
  due_date: string;
  description: string;
  status?: string;
  course_id: number;
  course_instructor_id?: number;
}

interface CourseInstructor {
  id: number;
  course_id: number;
  instructor_id: number;
}

const StudentView = ({ assignments }: { assignments: Assignment[] }) => {
  return (
    <div className="grid gap-4">
      {assignments.map((assignment) => (
        <Link 
          href={`/cms/${assignment.course_id}/submission/${assignment.assignment_id}`}
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
  );
};

const InstructorView = ({ assignments, onAssignmentCreated, courseInstructorId }: { 
  assignments: Assignment[], 
  onAssignmentCreated: () => void,
  courseInstructorId: number | null
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {courseInstructorId && (
          <CreateAssignment onAssignmentCreated={onAssignmentCreated} courseInstructorId={courseInstructorId} />
        )}
      </div>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Link 
            href={`/cms/${assignment.course_id}/submission/${assignment.assignment_id}`}
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
                  <Badge variant="default">
                    View Submissions
                  </Badge>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Submission = () => {
  const params = useParams();
  const courseId = parseInt(params.course_id as string);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInstructorId, setCourseInstructorId] = useState<number | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchAssignments = async () => {
    try {
      if (isNaN(courseId)) {
        throw new Error('Invalid course ID');
      }

      if (user?.role === 'student') {
        // Get student_id first
        console.log('Fetching student_id for user:', user.id);
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user.id)
          .single();

        if (studentError) {
          console.error('Error fetching student data:', studentError);
          if (studentError.code === 'PGRST116') {
            setError('No student record found for your user account.');
            setIsLoading(false);
            return;
          }
          throw studentError;
        }

        const studentId = studentData.student_id;
        console.log('Found student_id:', studentId);

        // For students, fetch all assignments for the course
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId);

        if (error) {
          console.error('Error fetching assignments for student:', error);
          throw error;
        }

        console.log('Fetched assignments for student:', data);

        // Fetch submission status
        const assignmentsWithStatus = await Promise.all(
          data.map(async (assignment) => {
            try {
              const { data: submissionData, error: submissionError } = await supabase
                .from('submissions')
                .select('*')
                .eq('assignment_id', assignment.assignment_id)
                .eq('student_id', studentId)
                .single();

              if (submissionError && submissionError.code !== 'PGRST116') {
                console.error('Error fetching submission status:', submissionError);
              }

              return {
                ...assignment,
                status: submissionData ? "Submitted" : "Not Submitted"
              };
            } catch (err) {
              console.error('Error processing assignment:', err);
              return {
                ...assignment,
                status: "Error"
              };
            }
          })
        );
        setAssignments(assignmentsWithStatus);
      } else if (user?.role === 'instructor') {
        // First get the instructor_id for the current user
        console.log('Fetching instructor_id for user:', user.id);
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
        
        // For each instructor ID, find course_instructor records and fetch assignments
        let allAssignments: Assignment[] = [];
        let courseInstructorIdFound = null;

        for (const instructor of instructorData) {
          // Get course_instructor for this instructor and course
          console.log(`Checking course_instructor for instructor_id: ${instructor.instructor_id} and course_id: ${courseId}`);
          const { data: courseInstructorData, error: courseInstructorError } = await supabase
            .from('course_instructor')
            .select('id')
            .eq('course_id', courseId)
            .eq('instructor_id', instructor.instructor_id);

          if (courseInstructorError) {
            console.error('Error fetching course_instructor data:', courseInstructorError);
            continue; // Try next instructor record
          }

          if (courseInstructorData && courseInstructorData.length > 0) {
            console.log('Found course_instructor records:', courseInstructorData);
            
            // Use the first matching course_instructor record
            const courseInstructorId = courseInstructorData[0].id;
            courseInstructorIdFound = courseInstructorId;
            
            console.log('Using course_instructor_id:', courseInstructorId);
            
            // Fetch assignments for this course_instructor
            const { data: assignmentsData, error: assignmentsError } = await supabase
              .from('assignments')
              .select('*')
              .eq('course_id', courseId)
              .eq('course_instructor_id', courseInstructorId);

            if (assignmentsError) {
              console.error('Error fetching assignments:', assignmentsError);
              continue;
            }

            console.log('Fetched assignments:', assignmentsData);
            
            if (assignmentsData && assignmentsData.length > 0) {
              allAssignments = [...allAssignments, ...assignmentsData];
            }
          }
        }

        // Set the found course_instructor_id for the "Create Assignment" button
        setCourseInstructorId(courseInstructorIdFound);
        
        // Set all found assignments
        console.log('Setting assignments:', allAssignments);
        setAssignments(allAssignments);
      }
    } catch (error) {
      console.error('Error in fetchAssignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
      {assignments.length === 0 ? (
        <div className="text-center text-gray-500">
          {user?.role === 'instructor' && courseInstructorId ? (
            <div className="flex flex-col items-center gap-4">
              <p>No assignments found</p>
              <CreateAssignment onAssignmentCreated={fetchAssignments} courseInstructorId={courseInstructorId} />
            </div>
          ) : (
            "No assignments found"
          )}
        </div>
      ) : (
        user?.role === 'student' ? (
          <StudentView assignments={assignments} />
        ) : (
          <InstructorView 
            assignments={assignments} 
            onAssignmentCreated={fetchAssignments} 
            courseInstructorId={courseInstructorId}
          />
        )
      )}
    </div>
  );
};

export default Submission;
