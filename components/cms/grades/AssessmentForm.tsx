import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AssessmentFormProps {
  title: string;
  setTitle: (title: string) => void;
  totalMarks: number;
  setTotalMarks: (marks: number) => void;
  type: string;
  setType: (type: string) => void;
}

export const AssessmentForm = ({
  title,
  setTitle,
  totalMarks,
  setTotalMarks,
  type,
  setType
}: AssessmentFormProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assessment Title"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Total Marks</label>
        <Input
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(Number(e.target.value))}
          min={0}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Type</label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MIDTERM">Midterm</SelectItem>
            <SelectItem value="FINAL">Final</SelectItem>
            <SelectItem value="QUIZ">Quiz</SelectItem>
            <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 