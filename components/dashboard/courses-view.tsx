"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/dashboard/course-card";
import { createClient } from "@/utils/supabase/client";
import Loading from "@/components/ui/loading"; // Import the Loading component

const CoursesView = () => {
  const [courseCardData, setCourseCardData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        setLoading(false);
        return;
      }
      setUser(data.user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCourseCardData = async () => {
      if (!user) {
        setCourseCardData([]);
        setLoading(false);
        return;
      }

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

      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", studentId);

      if (!enrollmentsData || enrollmentsData.length === 0) {
        console.log("No enrollments found.");
        setCourseCardData([]);
        setLoading(false);
        return;
      }

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .in(
          "course_id",
          enrollmentsData.map((e) => e.course_id)
        );

      setCourseCardData(courseData || []);
      setLoading(false);
    };

    if (user) fetchCourseCardData();
  }, [user]);

  if (loading) {
    return <Loading />; // Show loading component while data is being fetched
  }

  // RETURN TSX
  return (
    <div>
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
