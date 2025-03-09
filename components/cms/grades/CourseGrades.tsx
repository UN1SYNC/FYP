import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GradeTable } from "./GradeTable";

interface CourseGradesProps {
  courseData: Record<string, any[]>;
}

export const CourseGrades = ({ courseData }: CourseGradesProps) => {
  return (
    <Accordion type="multiple" className="w-full">
      {Object.entries(courseData).map(([category, items]) => (
        <AccordionItem key={category} value={category} className="border-b">
          <AccordionTrigger className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <GradeTable items={items} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}; 