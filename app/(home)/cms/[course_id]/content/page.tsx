"use client";

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const CourseMaterial = () => {
  const [selectedWeek, setSelectedWeek] = useState("");

  // Dummy Course Data
  const courseInfo = {
    weeks: [
      { week: "Week 1", topic: "Introduction to Engineering Management", materials: ["Week1_Intro.pdf", "EngineeringMgmt.pptx"] },
      { week: "Week 2", topic: "Personality & Perception", materials: ["Week2_Personality.pdf", "PerceptionSlides.pptx"] },
      { week: "Week 3", topic: "Organization Culture", materials: ["Week3_Culture.pdf", "CulturalFramework.docx"] },
      { week: "Week 4", topic: "Four Functions of Management", materials: ["Week4_Functions.pdf"] },
      { week: "Week 5", topic: "Individualism vs. Collectivism", materials: ["Week5_Individualism.pdf"] },
      { week: "Week 6", topic: "Groups and Teams in the Organization", materials: ["Week6_Teams.pdf"] },
    ],
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Lesson Plan (Weeks & Materials) */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Content of course</h2>
        {/* <Accordion type="multiple" className="w-full mt-4" defaultValue={courseInfo.weeks.map((week) => week.week)}> */}
        <Accordion type="multiple" className="w-full mt-4">
          {courseInfo.weeks.map((week, index) => (
            <AccordionItem key={index} value={week.week} className="border-b">
              <AccordionTrigger className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                {week.week}: {week.topic}
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <ul className="list-disc list-inside text-gray-700">
                  {week.materials.map((file, idx) => (
                    <li key={idx} className="text-blue-600 hover:underline cursor-pointer">{file}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CourseMaterial;