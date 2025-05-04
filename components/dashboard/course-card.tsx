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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className="w-full h-40 hover:shadow-md hover:shadow-black cursor-pointer"
              onClick={() => handleCourseClick(courseSlug)}
            >
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl px-6 py-4">
                <CardTitle className="text-lg font-semibold">
                  {course.title || "Untitled Course"}
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-sm text-muted-foreground text-left px-6 py-2">
                {course.faculty_id
                  ? `Faculty ID: ${course.faculty_id}`
                  : "Unknown Faculty"}
              </CardDescription>
              <CardContent className="border-t border-muted p-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  {course.description || "No description available."}
                </p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
