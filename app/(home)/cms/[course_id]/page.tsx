
import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

const CourseDashboard = async ({ params }:any ) => {
  const {course_id} = params;
  const supabase = await createClient();

  const courseInfo = {
    description:
      "The course introduces students to technical management and engineering concepts and principles. Course covers principles and applications to effectively manage technical projects, people, budgets, and schedules.",
    objectives: [
      "Demonstrate the ability to optimize project plans using Engineering Project Management concepts.",
      "Analyze and utilize tools and techniques to plan, organize, and manage a project with cost-effectiveness.",
      "Design and plan real-world projects using a project management approach.",
    ],
    referenceBooks: [
      { title: "Management for Engineers", author: "Payne, Andrew C.", year: "1996", isbn: "0-4719-5603-1" },
      { title: "The Technology Management Handbook", author: "Dorf, Richard C.", year: "1999", isbn: "0-8493-8577-6" },
      { title: "Culture, Self-Identity, and Work", author: "Erez, Miriam", year: "1993", isbn: "0-1950-7580-3" },
    ],
    evaluation: {
      quizzes: "10%",
      mse: "30%",
      assignments: "10%",
      ese: "50%",
    },
  }

  const { data: courseData, error } = await supabase
  .from('courses')
  .select(`
    *,
    instructors:instructors (
      *,
      user:users ( name )
    )
  `)
  .eq('course_id', course_id);

  if (error) {
    return
  }

  const instructorName = courseData[0].instructors.user.name;

  console.log(courseData);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
    {courseData.length > 0 ? (
      <>
        {/* Header Section */}
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold text-gray-800">
            {courseData[0].title}
            <span className="block text-sm font-normal text-gray-600">
              ({courseData[0].description})
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
            {courseInfo.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        {/* Reference Books */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Course Text / Reference Books</h2>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {courseInfo.referenceBooks.map((book, index) => (
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
            <li>Quizzes: {courseInfo.evaluation.quizzes}</li>
            <li>Mid-Semester Exam (MSE): {courseInfo.evaluation.mse}</li>
            <li>Assignments: {courseInfo.evaluation.assignments}</li>
            <li>End-Semester Exam (ESE): {courseInfo.evaluation.ese}</li>
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