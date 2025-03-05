"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { TeacherUpload } from "@/components/cms/content/TeacherUpload";
import Content from "@/components/cms/content/Content";
import Loading from "@/components/ui/loading";

interface ContentPageProps {
  params: {
    course_id: string;
  };
}

const ContentPage = ({ params }: ContentPageProps) => {
  const [isInstructor, setIsInstructor] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const supabase = createClient();

  // useEffect(() => {
  //   const checkUserRole = async () => {
  //     if (!user) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       const { data: instructorData, error } = await supabase
  //         .from('instructors')
  //         .select('instructor_id')
  //         .eq('user_id', user.id)
  //         .single();
  //       console.log("instructorData: ", instructorData);
  //       if (error) {
  //         console.error("Error checking instructor role:", error);
  //         setIsInstructor(false);
  //       } else {
  //         setIsInstructor(!!instructorData);
  //       }
  //     } catch (error) {
  //       console.error("Error checking user role:", error);
  //       setIsInstructor(false);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkUserRole();
  // }, [user]);

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[200px]">
  //       <Loading />
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      {isInstructor && (
        <TeacherUpload courseId={parseInt(params.course_id)} />
      )}
      <Content course_id={params.course_id} />
    </div>
  );
};

export default ContentPage;