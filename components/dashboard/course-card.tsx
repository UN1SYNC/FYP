"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading"; // Import the Loading component
import { RootState } from "@/lib/store";

export function CourseCard({ courseCardData } : any) {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user); // Access Redux user state
  const router = useRouter();

  const handleCourseClick = (courseSlug: string) => {
    setLoading(true);
    router.push(`/cms/${courseSlug}`);
  };

  return (
    <div className="flex flex-wrap justify-between gap-y-4">
      {loading ? (
        <div className="w-full flex justify-center">
          <Loading />
        </div>
      ) : (
        courseCardData.map((course:any , index:any) => {
          const courseSlug = course.course_id

          return (
            <Card
              key={index}
              className="w-[330px] h-[160px] hover:shadow-md hover:shadow-black bg-muted/80 cursor-pointer"
              onClick={() => handleCourseClick(courseSlug)}
            >
              <CardHeader>
                <CardTitle>{course.title || "Untitled Course"}</CardTitle>
                <CardDescription>
                  {course.faculty_id ? `Faculty ID: ${course.faculty_id}` : "Unknown Faculty"}  
                  {/* faculty_id need to be changed to instructor_id and get from course_instructor table */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{course.description || "No description available."}</p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
