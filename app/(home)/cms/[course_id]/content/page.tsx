"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { TeacherUpload } from "@/components/cms/content/TeacherUpload";
import Content from "@/components/cms/content/Content";
import Loading from "@/components/ui/loading";

interface ContentPageProps {
  params: {
    course_id: string; // This is now course_instructor_id
  };
}

const ContentPage = ({ params }: ContentPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  // Get user from Redux state
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Check if user is instructor directly from Redux state
  const isInstructor = user?.role === 'instructor';

  // The course_id in the URL is actually the course_instructor_id
  const courseInstructorId = params.course_id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6">
      {isInstructor && (
        <TeacherUpload courseInstructorId={parseInt(courseInstructorId)} />
      )}
      <Content courseInstructorId={courseInstructorId} />
    </div>
  );
};

export default ContentPage;