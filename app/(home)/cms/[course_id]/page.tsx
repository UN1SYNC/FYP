import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

const CourseDashboard = async ({ params }:any ) => {
  // Now course_id param actually contains the course_instructor_id
  const courseInstructorId = params.course_id;
  const supabase = await createClient();

  // Query course_instructor table using its primary key (id)
  const { data: courseData, error } = await supabase
  .from('course_instructor')
  .select(`
    *,
    instructors:instructors (
      *,
      user:users ( name )
    ),
    courses:courses (*)
  `)
  .eq('id', courseInstructorId)
  .single();

  if (error) {
    console.error("Error fetching course data: ", error);
    return
  }

  console.log("CourseData: ", courseData);

  // Check if courseData exists 
  if (!courseData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-gray-800">
            Course Not Found
          </h1>
          <div className="mt-4 p-4 bg-orange-100 text-orange-700 text-sm rounded border border-orange-200">
            The course you are looking for does not exist.
          </div>
        </div>
      </div>
    );
  }

  // Safely access the instructor name with optional chaining
  const instructorName = courseData?.instructors?.user?.name || "Unknown Instructor";

  // Get course info from course_info field or from the courses relation
  const courseInfo = courseData?.course_info || {};
  const courseDetails = courseData?.courses || {};

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold text-gray-800">
          {courseDetails.title || courseInfo.title || "Untitled Course"}
          <span className="block text-sm font-normal text-gray-600">
            ({courseDetails.description || courseInfo.description || "No description available"})
          </span>
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Instructor: {instructorName}
        </p>

        <div className="mt-4 p-4 bg-orange-100 text-orange-700 text-sm rounded border border-orange-200">
          Note: The video files will be retained in LMS courses till end of the semester.
        </div>
      </div>

      {/* Course Description */}
      <div className="my-6">
        <h2 className="text-xl font-semibold">Course Description</h2>
        <p className="text-gray-700 mt-2">{courseDetails.description || courseInfo.description || "No description available"}</p>
      </div>

      {/* Learning Objectives */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Learning Objectives</h2>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          {courseInfo.objectives?.map((objective:any, index:any) => (
            <li key={index}>{objective}</li>
          )) || <li>No learning objectives available</li>}
        </ul>
      </div>

      {/* Reference Books */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Course Text / Reference Books</h2>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          {courseInfo.referenceBooks?.map((book:any, index:any) => (
            <li key={index}>
              <strong>{book.title}</strong> - {book.author} ({book.year}) - ISBN: {book.isbn}
            </li>
          )) || <li>No reference books available</li>}
        </ul>
      </div>

      {/* Evaluation System */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Description of Evaluation System</h2>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li>Quizzes: {courseInfo.evaluation?.quizzes || "N/A"}</li>
          <li>Mid-Semester Exam (MSE): {courseInfo.evaluation?.mse || "N/A"}</li>
          <li>Assignments: {courseInfo.evaluation?.assignments || "N/A"}</li>
          <li>End-Semester Exam (ESE): {courseInfo.evaluation?.ese || "N/A"}</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseDashboard;