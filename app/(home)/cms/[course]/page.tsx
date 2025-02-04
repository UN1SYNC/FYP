
import React from "react";
import { Button } from "@/components/ui/button";

const CourseDashboard = ({params}) => {
  console.log("params.course: ", params.course)
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold text-gray-800">
          MGT-272 Entrepreneurship BSCS-11 2K21 ABC
          <span className="block text-sm font-normal text-gray-600">
            (MGT-272-Fall'24 BSCS-11 2K21 ABC)
          </span>
        </h1>

        {/* Breadcrumb */}
        <div className="mt-2 text-sm text-gray-500">
          <span className="mr-2">Dashboard</span>
          <span className="mr-2">&gt;</span>
          <span>MGT-272 Entrepreneurship BSCS-11 2K21 ABC</span>
        </div>

        {/* Note Section */}
        <div className="mt-4 p-4 bg-orange-100 text-orange-700 text-sm rounded border border-orange-200">
          Note: The video files will be retained in LMS courses till end of the semester.
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white p-6 rounded shadow flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">SEECS</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">UG</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">BSCS-11</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">Fall 2024</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">2K21</span>
          </div>
          <div className="text-sm text-gray-700 font-medium">Maajid Maqbool</div>
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
    </div>
  );
};

export default CourseDashboard;