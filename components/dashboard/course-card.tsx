"use client";
// import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // Adjust the path to your store file

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

export function CourseCard({courseCardData}) {
  const [data, setData] = useState([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user); // Access the user from auth slice
  // console.log("user insdie course card: ", user);
  // GETTIG STUDENT FROM BACKEND
  // useEffect(() => {
  //   const fetchData = async () => {
  //       const { data, error } = await supabase.from("students").select("*");
  //       if (error) {
  //         console.error("Error fetching data:", error.message);
  //       } else {
  //         setData(data);
  //         console.log("Fetched data:", data);
  //       }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //       const { data, error } = await supabase.from("students").select("student_id").eq("user_id", user.id);
  //       if (error) {
  //         console.error("Error fetching data:", error.message);
  //       } else {
  //         setData(data);
  //         console.log("Fetched data:", data);
  //       }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const fetchCourseId = async () => {
  //     if (!user) {
  //       console.log("No user logged in");
  //       return;
  //     }

  //     // Fetch student_id from the students table
  //     const { data: studentData, error: studentError } = await supabase
  //       .from("students")
  //       .select("student_id")
  //       .eq("user_id", user.id);

  //     if (studentError) {
  //       console.error("Error fetching student data:", studentError.message);
  //       return;
  //     }

  //     if (!studentData || studentData.length === 0) {
  //       console.log("No student found for this user.");
  //       return;
  //     }

  //     const studentId = studentData[0].student_id; // Get student_id from the first result

  //     // Now fetch course_id from the enrollments table using student_id
  //     const { data: enrollmentsData, error: enrollmentsError } = await supabase
  //       .from("enrollments")
  //       .select("course_id")
  //       .eq("student_id", studentId);

  //     if (enrollmentsError) {
  //       console.error(
  //         "Error fetching enrollment data:",
  //         enrollmentsError.message
  //       );
  //     } else if (enrollmentsData && enrollmentsData.length > 0) {
  //       // Assuming you want the first course_id
  //       setCourseId(enrollmentsData[0].course_id);
  //     } else {
  //       console.log("No enrollment found for this student.");
  //     }

  //     // Now fetch course_id from the enrollments table using student_id
  //     const { data: courseData, error: courseError } = await supabase
  //       .from("courses")
  //       .select("*")
  //       .eq("course_id", enrollmentsData[0].course_id);

  //     if (courseError) {
  //       console.error("Error fetching course data:", courseError.message);
  //     } else if (courseData && courseData.length > 0) {
  //       // Assuming you want the first course_id
  //       // setCourseId(enrollmentsData[0].course_id);
  //       console.log("courseData: ", courseData);
  //     } else {
  //       console.log("No course found for this student.");
  //     }

  //     // Now fetch course_id from the enrollments table using student_id
  //     const { data: facultyData, error: facultyError } = await supabase
  //       .from("instructors")
  //       .select("*")
  //       .eq("instructor_id", courseData[0].faculty_id);

  //     if (facultyError) {
  //       console.error("Error fetching factulty data:", facultyError.message);
  //     } else if (facultyData && facultyData.length > 0) {
  //       // Assuming you want the first course_id
  //       // setCourseId(enrollmentsData[0].course_id);
  //       console.log("facultyData: ", facultyData);
  //     } else {
  //       console.log("No faculty found for this student.");
  //     }


  //     // Now fetch course_id from the enrollments table using student_id
  //     const { data: instrcutorData, error: instrcutorError } = await supabase
  //     .from("auth.users")
  //     .select("*")
  //     .eq("user_id", facultyData[0].user_id);

  //   if (instrcutorError) {
  //     console.error("Error fetching factulty data:", instrcutorError.message);
  //   } else if (instrcutorData && instrcutorData.length > 0) {
  //     // Assuming you want the first course_id
  //     // setCourseId(enrollmentsData[0].course_id);
  //     console.log("instrcutorData: ", instrcutorData);
  //   } else {
  //     console.log("No instructor found for this student.");
  //   }
  //   };

  //   fetchCourseId();
  // }, [user, supabase]); // Dependency on user


  // RETURN TSX
  return (
    <>
      <Link href={`/cms/${courseCardData.courseTitle.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <Card className="w-[350px] h-[160px] hover:shadow-md hover:shadow-black">
          <CardHeader>
            <CardTitle>{courseCardData.courseTitle}</CardTitle>
            <CardDescription>{courseCardData.instructorName}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{courseCardData.courseDesc}</p>
            <p>Attendance: 92.0% Fall 2024</p>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
      </CardFooter> */}
        </Card>
      </Link>
    
    </>
  );
}
