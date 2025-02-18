
"use client"
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AttendanceDetails = () => {
  const [selectedTab, setSelectedTab] = useState("lecture");

  const attendanceData = [
    { id: 1, date: "2024-09-10", status: "Present", fine: "" },
    { id: 2, date: "2024-09-11", status: "Present", fine: "" },
    { id: 3, date: "2024-09-11", status: "Present", fine: "" },
    { id: 4, date: "2024-09-18", status: "Present", fine: "" },
    { id: 5, date: "2024-09-18", status: "Present", fine: "" },
    { id: 6, date: "2024-09-24", status: "Present", fine: "" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="flex border-b">
          <TabsTrigger
            value="lecture"
            className={`px-4 py-2 font-medium ${
              selectedTab === "lecture"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            LECTURE
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className={`px-4 py-2 font-medium ${
              selectedTab === "lab"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            LAB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lecture" className="mt-4">
          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="font-semibold">Course:</p>
              <p>Network Security</p>
            </div>
            <div>
              <p className="font-semibold">Academic Term:</p>
              <p>Fall 2024</p>
            </div>
            <div>
              <p className="font-semibold">Course Code:</p>
              <p>CS-381-Fall-24-SEECS/BSE/2021F-A-lecture</p>
            </div>
            <div>
              <p className="font-semibold">Attendance Percentage:</p>
              <p>88.57%</p>
            </div>
            <div>
              <p className="font-semibold">Number of classes Conducted:</p>
              <p>35</p>
            </div>
            <div>
              <p className="font-semibold">Number of classes Attended:</p>
              <p>31</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Sr. no</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Fine</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row, index) => (
                  <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border text-center">{row.date}</td>
                    <td
                      className={`px-4 py-2 border text-center ${
                        row.status === "Present"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {row.status}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {row.fine || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="lab" className="mt-4">
          <p>Lab details will go here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceDetails;
