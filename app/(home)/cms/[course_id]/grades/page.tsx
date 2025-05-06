"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CourseGrades } from "@/components/cms/grades/CourseGrades";
import { LabGrades } from "@/components/cms/grades/LabGrades";
import { InstructorCourseGrades } from "@/components/cms/grades/InstructorCourseGrades";

const Gradebook = () => {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  // The course_id in the URL is actually the course_instructor_id
  const courseInstructorId = window.location.pathname.split("/")[2];
  const [isActive, setIsActive] = useState(true);
  const [selectedTab, setSelectedTab] = useState("course");
  const [courseData, setCourseData] = useState<any>({});
  const [instructorData, setInstructorData] = useState<any>({});

  const fetchStudentData = async (user: any) => {
    try {
      // Fetch the student's internal ID from the students table
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select('student_id')
        .eq('user_id', user.id)
        .single();
      if (studentError) {
        console.error('Error fetching student record:', studentError);
        return;
      }
      const studentId = studentRecord.student_id;

      // Fetch assessment data for the student
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessment')
        .select(
          `
          assessment_id,
          title,
          total_marks,
          type,
          assessment_grades(
            grade,
            total_grades,
            students (
              student_id,
              user_id,
              users (
                name
              )
            )
          )
          `
        )
        .eq('course_instructor_id', courseInstructorId)
        .eq('assessment_grades.student_id', studentId);

      if (assessmentError) {
        console.error('Error fetching student assessments:', assessmentError);
        return;
      }

      // Process and organize data by assessment type
      const processedData: Record<string, any[]> = {};
      
      assessments?.forEach(assessment => {
        const type = assessment.type || 'other';
        if (!processedData[type]) {
          processedData[type] = [];
        }
        
        // Extract grade from assessment_grades (should be only one entry)
        const gradeInfo = assessment.assessment_grades?.[0];
        const grade = gradeInfo?.grade || 0;
        const totalGrades = gradeInfo?.total_grades || assessment.total_marks;
        
        // Extract student name
        const studentRow = gradeInfo?.students?.[0];
        const userRow = studentRow?.users?.[0];
        const studentName = userRow?.name || '';

        processedData[type].push({
          name: assessment.title,
          total: totalGrades,
          obtained: grade,
          percentage: totalGrades > 0 ? ((grade / totalGrades) * 100).toFixed(1) : '0.0',
          average: grade, // Placeholder
          student_name: studentName
        });
      });
      
      setCourseData(processedData);
    } catch (error) {
      console.error('Error in fetchStudentData:', error);
    }
  };

  const fetchInstructorData = async () => {
    try {
      // Fetch all assessments for this course
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessment')
        .select(`
          assessment_id,
          title,
          total_marks,
          type
        `)
        .eq('course_instructor_id', courseInstructorId);

      if (assessmentError) {
        console.error('Error fetching assessments:', assessmentError);
        return;
      }

      // Process data for instructor view
      const processedData: Record<string, any[]> = {};
      
      // For each assessment, fetch student grades and calculate stats
      for (const assessment of assessments || []) {
        const type = assessment.type || 'other';
        if (!processedData[type]) {
          processedData[type] = [];
        }
        
        // Fetch all student grades for this assessment
        const { data: grades, error: gradesError } = await supabase
          .from('assessment_grades')
          .select(`
            grade,
            total_grades,
            student_id,
            students (
              student_id,
              user_id,
              users!students_user_id_fkey (
                name
              )
            )
        `)        
          .eq('assessment_id', assessment.assessment_id);
          
        if (gradesError) {
          console.error(`Error fetching grades for assessment ${assessment.assessment_id}:`, gradesError);
          continue;
        }
        console.log(grades);
        
        // Calculate average grade
        const totalStudents = grades?.length || 0;
        const totalGrade = grades?.reduce((sum, grade) => sum + (grade.grade || 0), 0) || 0;
        const averageGrade = totalStudents > 0 ? totalGrade / totalStudents : 0;
        
        // Format student results for the component
        const studentsResults = (grades || []).map(grade => {
          const studentRow = grade.students;
          const userRow = studentRow?.users;
          const studentName = userRow?.name || '';
          
          return {
            [grade.student_id]: {
              name: studentName,
              marks: grade.grade || 0
            }
          };
        });
        
        
        processedData[type].push({
          assessment_id: assessment.assessment_id,
          name: assessment.title,
          total: assessment.total_marks,
          average: averageGrade,
          students_results: studentsResults
        });
      }
      
      setInstructorData(processedData);
    } catch (error) {
      console.error('Error in fetchInstructorData:', error);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;

      try {
        if (user.role === "student") {
          fetchStudentData(user);
        }
        else if (user.role === "instructor") {
          fetchInstructorData();
        }

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
      {loading ? (
        <div className="text-center py-8">Loading grades data...</div>
      ) : (
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
            {user?.role === "student" ? (
              <CourseGrades courseData={courseData} />
            ) : (
              <InstructorCourseGrades instructorData={instructorData} />
            )}
          </TabsContent>

          {/* Lab Tab Content (Placeholder) */}
          <TabsContent value="lab" className="mt-4">
            <LabGrades />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Gradebook;