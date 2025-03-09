import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { AssessmentForm } from "./AssessmentForm"
import { StudentsMarksTable } from "./StudentsMarksTable"

interface AddResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
  courseId: string;
}

export const AddResultModal = ({ 
  open, 
  onOpenChange,
  onSaveSuccess,
  courseId 
}: AddResultModalProps) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [type, setType] = useState("");
  const [studentMarks, setStudentMarks] = useState<Record<string, number>>({});

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_course_enrolled_students', {
      p_course_id: courseId
    });

    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  useEffect(() => {
    const initialMarks = students.reduce((acc, student) => ({
      ...acc,
      [student.id]: 0
    }), {});
    setStudentMarks(initialMarks);
  }, [students]);

  const handleMarksChange = (studentId: string, marks: number) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: marks
    }));
  };

  const handleSave = async () => {
    try {
      const {data: assessmentData, error: assessmentError} = await supabase.rpc('insert_assessment', {
        p_course_id: courseId,
        p_title: title,
        p_total_marks: totalMarks,
        p_type: type.toLowerCase(),
      });

      if (assessmentError) {
        console.error("Error creating assessment:", assessmentError);
        return;
      }

      const {data: assessmentResultData, error: assessmentResultError} = await supabase.rpc('insert_assessment_grades', {
        p_assessment_id: assessmentData,
        p_student_grades: studentMarks
      });

      if (assessmentResultError) {
        console.error("Error creating assessment results:", assessmentResultError);
        return;
      }

      onOpenChange(false);
      onSaveSuccess();
    } catch (error) {
      console.error("Error saving assessment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Assessment Result</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AssessmentForm
            title={title}
            setTitle={setTitle}
            totalMarks={totalMarks}
            setTotalMarks={setTotalMarks}
            type={type}
            setType={setType}
          />

          {loading ? (
            <div>Loading students...</div>
          ) : (
            <StudentsMarksTable
              students={students}
              totalMarks={totalMarks}
              onMarksChange={handleMarksChange}
            />
          )}

          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={!title || !type || !totalMarks}
          >
            Save Assessment Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 