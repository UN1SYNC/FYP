import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssessmentData } from "./types"

interface StudentGradesTableProps {
  assessment: AssessmentData;
}

export const StudentGradesTable = ({ assessment }: StudentGradesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Marks</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessment.students_results.map((studentObj, studentIndex) => {
          const studentId = Object.keys(studentObj)[0];
          const student = studentObj[studentId];
          
          return (
            <TableRow key={studentIndex}>
              <TableCell>{studentId}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.marks}/{assessment.total}</TableCell>
              <TableCell>
                {((student.marks / assessment.total) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}; 