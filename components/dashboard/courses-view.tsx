"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/dashboard/course-card";
import { createClient } from "@/utils/supabase/client";
import Loading from "@/components/ui/loading"; // Import the Loading component
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

// Define User type based on the Redux auth slice shape
type User = {
  id: string;
  email: string;
  role: string;
  name: string;
  lastSignIn: string;
  createdAt: string;
  details: {
    uni_id: number;
    user_id: number;
    uni_name: string;
    specialization: string;
  };
} | null;

// Define the CourseInstructor type
interface CourseInstructor {
  id: number; // This is the course_instructor_id
  course_id: number;
  instructor_id: number;
  section_id: number;
  course_info: any;
}

const CoursesView = () => {
  const [courseCardData, setCourseCardData] = useState<any[]>([]); // Track course card data
  const user = useSelector((state: RootState) => state.auth.user) as User; // Get user from Redux
  const [loading, setLoading] = useState(true); // Track loading state
  const supabase = createClient();

  useEffect(() => {
    const fetchCourseCardData = async () => {
      if (!user) {
        setCourseCardData([]);
        setLoading(false);
        return;
      }

      try {
        if (user.role === "student") {
          // Fetch courses for student
          console.log("Fetching courses for student");
          const { data: studentData } = await supabase
            .from("students")
            .select("student_id")
            .eq("user_id", user.id);

          if (!studentData || studentData.length === 0) {
            console.log("No student found for this user.");
            setCourseCardData([]);
            setLoading(false);
            return;
          }

          const studentId = studentData[0].student_id;

          // Get enrollments with course_instructor_id instead of just course_id
          const { data: enrollmentsData } = await supabase
            .from("enrollments")
            .select("course_instructor_id")
            .eq("student_id", studentId);

          if (!enrollmentsData || enrollmentsData.length === 0) {
            console.log("No enrollments found.");
            setCourseCardData([]);
            setLoading(false);
            return;
          }

          // Get course instructor data
          const { data: courseInstructorData, error: ciError } = await supabase
            .from("course_instructor")
            .select(
              "id, course_id, instructor_id, section_id, course_info, courses(course_id, title, description)"
            )
            .in(
              "id",
              enrollmentsData.map((e) => e.course_instructor_id)
            );
          console.log("EnrollmentsData:", enrollmentsData);
          console.log("Fetched courseInstructorData:", courseInstructorData, "| Error:", ciError);

          if (ciError || !courseInstructorData || courseInstructorData.length === 0) {
            setCourseCardData([]);
            setLoading(false);
            return;
          }

          // Transform the data to include both course info and course_instructor_id
          const transformedData = courseInstructorData.map(ci => ({
            ...ci.courses,
            course_instructor_id: ci.id,
            instructor_id: ci.instructor_id,
            section_id: ci.section_id,
            course_info: ci.course_info
          }));
          console.log("TransformedData for course cards:", transformedData);
          
          setCourseCardData(transformedData);
        } else if (user.role === "instructor") {
          // Fetch courses for instructor
          console.log("Fetching courses for instructor");
          const { data: instructorData } = await supabase
            .from("instructors")
            .select("instructor_id")
            .eq("user_id", user.id);

          if (!instructorData || instructorData.length === 0) {
            console.log("No instructor found for this user.");
            setCourseCardData([]);
            setLoading(false);
            return;
          }

          const instructorId = instructorData[0].instructor_id;

          // Get course instructor data directly with course details joined
          const { data: courseInstructorData } = await supabase
            .from("course_instructor")
            .select(`
              id,
              course_id,
              instructor_id,
              section_id,
              course_info,
              courses(*)
            `)
            .eq("instructor_id", instructorId);

          if (!courseInstructorData || courseInstructorData.length === 0) {
            console.log("No courses assigned to this instructor.");
            setCourseCardData([]);
            setLoading(false);
            return;
          }

          // Transform the data to include both course info and course_instructor_id
          const transformedData = courseInstructorData.map(ci => ({
            ...ci.courses,
            course_instructor_id: ci.id,
            instructor_id: ci.instructor_id,
            section_id: ci.section_id,
            course_info: ci.course_info
          }));
          
          setCourseCardData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setCourseCardData([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCourseCardData();
  }, [user]);

  if (loading) {
    return <Loading />; // Show loading component while data is being fetched
  }

  // RETURN TSX
  return (
    <div className="container mx-auto px-4 py-6">
      {courseCardData.length > 0 ? (
        <CourseCard courseCardData={courseCardData} />
      ) : (
        <p className="text-center text-muted-foreground font-medium flex justify-center items-center h-40">
          No courses found.
        </p>
      )}
    </div>
  );
};

export default CoursesView;
