import { Accordion } from "@/components/ui/accordion";
import { Week } from "./types";
import WeekItem from "./WeekItem";

export default function WeeksList({ weeks }: { weeks: Week[] }) {
  return (
    <Accordion type="multiple" className="w-full mt-4">
      {weeks.map((week, index) => (
        <WeekItem key={index} week={week} />
      ))}
    </Accordion>
  );
} 