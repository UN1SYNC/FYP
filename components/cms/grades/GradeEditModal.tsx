import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssessmentData, StudentResult } from "./types"
import { createClient } from "@/utils/supabase/client";
interface GradeEditModalProps {
  assessment: AssessmentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
}

export const GradeEditModal = ({ 
  assessment, 
  open, 
  onOpenChange,
  onSaveSuccess 
}: GradeEditModalProps) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  // Track changed student marks
  const [changedRecords, setChangedRecords] = useState<Record<string, number>>({});
  
  // Handle input change
  const handleMarksChange = (studentId: string, newMarks: number) => {
    setChangedRecords(prev => ({
      ...prev,
      [studentId]: newMarks
    }));
  };
  
  // Handle save button click
  const handleSave = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase.rpc('update_student_grades', {
        p_assessment_id: assessment.assessment_id,
        p_student_grades: changedRecords
      });

      if (assessmentError) {
        console.error("Error updating assessment marks:", assessmentError);
        return;
      }

      console.log("Assessment marks updated successfully:", assessmentData);
      
      // Close the modal
      onOpenChange(false);
      
      // Refresh the data
      onSaveSuccess();
      
    } catch (error) {
      console.error("Error saving grades:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit {assessment.name} Records</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Marks</TableHead>
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
                    <TableCell>
                      <input 
                        type="number"
                        className="w-20 p-1 border rounded"
                        defaultValue={student.marks}
                        max={assessment.total}
                        min={0}
                        onChange={(e) => handleMarksChange(studentId, Number(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 