"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const Gradebook = () => {
  const [isActive, setIsActive] = useState(true); // Toggle for Active/Previous Course
  const [selectedTab, setSelectedTab] = useState("course"); // Tabs for Course/Lab

  // Dummy Grade Data (Example)
  const gradesData = {
    assignments: [
      { name: "Assignment 1", total: 10, obtained: 9, average: 7, percentage: 90 },
      { name: "Assignment 2", total: 10, obtained: 8, average: 7.5, percentage: 80 },
    ],
    quizzes: [
      { name: "Quiz 1", total: 20, obtained: 18, average: 15, percentage: 90 },
      { name: "Quiz 2", total: 20, obtained: 16, average: 14, percentage: 80 },
    ],
    midterm: [{ name: "Midterm Exam", total: 50, obtained: 42, average: 38, percentage: 84 }],
    final: [{ name: "Final Exam", total: 100, obtained: 85, average: 75, percentage: 85 }],
    project: [{ name: "Final Project", total: 50, obtained: 45, average: 40, percentage: 90 }],
  };

  const labGradesData = {
    labs: [
        { name: "Lab 1", total: 10, obtained: 9, average: 7, percentage: 90 },
        { name: "Lab 2", total: 10, obtained: 8, average: 7.5, percentage: 80 },
        ],
    quizzes: [
        { name: "Quiz 1", total: 20, obtained: 18, average: 15, percentage: 90 },
        { name: "Quiz 2", total: 20, obtained: 16, average: 14, percentage: 80 },
        ],
    final: [{ name: "Final Exam", total: 100, obtained: 85, average: 75, percentage: 85 }],
  };

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
          <Accordion type="multiple" className="w-full">
            {Object.entries(gradesData).map(([category, items]) => (
              <AccordionItem key={category} value={category} className="border-b">
                <AccordionTrigger className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Total Marks</th>
                        <th className="px-4 py-2 border">Obtained Marks</th>
                        <th className="px-4 py-2 border">Average</th>
                        <th className="px-4 py-2 border">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-50">
                          <td className="px-4 py-2 border">{item.name}</td>
                          <td className="px-4 py-2 border text-center">{item.total}</td>
                          <td className="px-4 py-2 border text-center">{item.obtained}</td>
                          <td className="px-4 py-2 border text-center">{item.average}</td>
                          <td className="px-4 py-2 border text-center">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* Lab Tab Content (Placeholder) */}
        <TabsContent value="lab" className="mt-4">
            <Accordion type="multiple" className="w-full">
                {Object.entries(labGradesData).map(([category, items]) => (
                <AccordionItem key={category} value={category} className="border-b">
                    <AccordionTrigger className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Total Marks</th>
                            <th className="px-4 py-2 border">Obtained Marks</th>
                            <th className="px-4 py-2 border">Average</th>
                            <th className="px-4 py-2 border">Percentage</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50">
                            <td className="px-4 py-2 border">{item.name}</td>
                            <td className="px-4 py-2 border text-center">{item.total}</td>
                            <td className="px-4 py-2 border text-center">{item.obtained}</td>
                            <td className="px-4 py-2 border text-center">{item.average}</td>
                            <td className="px-4 py-2 border text-center">{item.percentage}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gradebook;