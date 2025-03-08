"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CourseGrades } from "@/components/cms/grades/CourseGrades";
import { LabGrades } from "@/components/cms/grades/LabGrades";

const Gradebook = () => {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const course_id = window.location.pathname.split("/")[2];
  const [isActive, setIsActive] = useState(true); // Toggle for Active/Previous Course
  const [selectedTab, setSelectedTab] = useState("course"); // Tabs for Course/Lab
  const [courseData, setCourseData] = useState<any>({});

  const fetchStudentData = async (user: any) => {


    const { data: assessmentData, error: assessmentError } = await supabase.rpc('get_student_assessment_data', {
      p_course_id: course_id,
      p_user_id: user.id
    });
    
    
    if (assessmentError) {
      console.error('Error:', assessmentError);
    } else {
      console.log('Assessment Data:', assessmentData);
      // Process your data as needed
    }

          // console.log(data);
          setCourseData(assessmentData);
        }

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;

      try {
        // Fetch student_id based on user_id

        console.log("user: ", user);

        if (user.role === "student") {
          fetchStudentData(user);
        }

        // Fetch lab data

      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [user]);


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">

      {/* Tabs for Course and Lab */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="flex border-b">
          <TabsTrigger
            value="course"
            className={`px-4 py-2 font-medium ${selectedTab === "course"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
              }`}
          >
            Course
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className={`px-4 py-2 font-medium ${selectedTab === "lab"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
              }`}
          >
            Lab
          </TabsTrigger>
        </TabsList>

        {/* Course Tab Content */}
        <TabsContent value="course" className="mt-4">
          <CourseGrades courseData={courseData} />
        </TabsContent>

        {/* Lab Tab Content (Placeholder) */}
        <TabsContent value="lab" className="mt-4">
          <LabGrades />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gradebook;