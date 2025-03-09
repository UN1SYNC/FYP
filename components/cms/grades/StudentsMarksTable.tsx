import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface Student {
  id: string;
  name: string;
}

interface StudentsMarksTableProps {
  students: Student[];
  totalMarks: number;
  onMarksChange: (studentId: string, marks: number) => void;
}

export const StudentsMarksTable = ({
  students,
  totalMarks,
  onMarksChange
}: StudentsMarksTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Marks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.id}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>
              <Input 
                type="number"
                className="w-20"
                max={totalMarks}
                min={0}
                defaultValue={0}
                onChange={(e) => onMarksChange(student.id, Number(e.target.value))}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 