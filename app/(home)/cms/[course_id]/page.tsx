
import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

const CourseDashboard = async ({ params }:any ) => {
  const {course_id} = params;
  const supabase = await createClient();

  const { data: courseData, error } = await supabase
  .from('course_instructor')
  .select(`
    *,
    instructors:instructors (
      *,
      user:users ( name )
    )
  `)
  .eq('course_id', course_id);

  if (error) {
    console.error("Error fetching course data: ", error);
    return
  }

  const instructorName = courseData[0].instructors.user.name;

  console.log("CourseData: ",courseData);

  const courseInfo = courseData[0].course_info;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
    {courseData.length > 0 ? (
      <>
        {/* Header Section */}
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-gray-800">
            {courseInfo.title}
            <span className="block text-sm font-normal text-gray-600">
              ({courseInfo.description})
            </span>
          </h1>

          <div className="mt-4 p-4 bg-orange-100 text-orange-700 text-sm rounded border border-orange-200">
            Note: The video files will be retained in LMS courses till end of the semester.
          </div>
        </div>

        <div className="my-6 bg-white p-6 rounded shadow flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">SEECS</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">UG</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">BSCS-11</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">Fall 2024</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">2K21</span>
            </div>
            <div className="text-sm text-gray-700 font-medium">{instructorName}</div>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
              Activities Summary
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
              Download Center
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
              Participants
            </Button>
          </div>
        </div>

        {/* Course Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Course Description</h2>
          <p className="text-gray-700 mt-2">{courseInfo.description}</p>
        </div>

        {/* Learning Objectives */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Learning Objectives</h2>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {courseInfo.objectives?.map((objective:any, index:any) => (
              <li key={index}>{objective}</li>
            ))}
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
            ))}
          </ul>
        </div>

        {/* Evaluation System */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Description of Evaluation System</h2>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Quizzes: {courseInfo.evaluation?.quizzes}</li>
            <li>Mid-Semester Exam (MSE): {courseInfo.evaluation?.mse}</li>
            <li>Assignments: {courseInfo.evaluation?.assignments}</li>
            <li>End-Semester Exam (ESE): {courseInfo.evaluation?.ese}</li>
          </ul>
        </div>
      </>
    
    ) : (
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
    )}
    </div>
  );
};

export default CourseDashboard;