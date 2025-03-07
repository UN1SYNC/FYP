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

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;

      try {
        // Fetch student_id based on user_id
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("student_id")
          .eq("user_id", user.id)
          .single();

        if (studentError || !studentData) {
          console.error("Error fetching student_id:", studentError);
          setLoading(false);
          return;
        }

        // Fetch course data
        const { data: assessments, error: courseError } = await supabase
          .from("assessment")
          .select("*")
          .eq("course_id", course_id)

        if (courseError || !assessments) {
          console.error("Error fetching course data:", courseError);
          setLoading(false);
          return;
        }

        // Fetch grades data
        const { data: gradesData, error: gradesError } = await supabase
          .from("assessment_grades")
          .select("*")
          .in("assessment_id", assessments.map(assessment => assessment.assessment_id));

        if (gradesError || !gradesData) {
          console.error("Error fetching grades data:", gradesError);
          setLoading(false);
          return;
        }

        const data = assessments.reduce((acc: any, assessment: any) => {
          const grades = gradesData.filter((grade: any) => grade.assessment_id === assessment.assessment_id && grade.student_id === studentData.student_id);
          const total = grades.reduce((acc: number, grade: any) => acc + grade.total_grades, 0);
          const obtained = grades.reduce((acc: number, grade: any) => acc + grade.grade, 0);
          const percentage = (obtained / total) * 100;

          if (!acc[assessment.type]) {
            acc[assessment.type] = [];
          }

          acc[assessment.type].push({
            name: assessment.title,
            total,
            obtained,
            average: total / grades.length,
            percentage,
          });

          return acc;
        }, {}); 

        console.log(data);

        setCourseData(data);

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
            className={`px-4 py-2 font-medium ${
              selectedTab === "course"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Course
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className={`px-4 py-2 font-medium ${
              selectedTab === "lab"
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