import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Week } from "./types";
import MaterialsList from "./MaterialsList";

export default function WeekItem({ week }: { week: Week }) {
  return (
    <AccordionItem value={week.week} className="border-b">
      <AccordionTrigger className="p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition">
        {week.week}: {week.topic}
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <MaterialsList materials={week.materials} />
      </AccordionContent>
    </AccordionItem>
  );
} 