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
  courseInstructorId: string;
}

export const AddResultModal = ({ 
  open, 
  onOpenChange,
  onSaveSuccess,
  courseInstructorId 
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
    try {
      // Get course_id from course_instructor table
      const { data: courseInstructorData, error: courseInstructorError } = await supabase
        .from('course_instructor')
        .select('course_id')
        .eq('id', courseInstructorId)
        .single();
      
      if (courseInstructorError) {
        console.error('Error fetching course instructor data:', courseInstructorError);
        setLoading(false);
        return;
      }
      
      // Get enrolled students for this course
      const { data: enrolledStudents, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          students (
            student_id,
            user_id,
            users (
              name
            )
          )
        `)
        .eq('course_id', courseInstructorData.course_id);
        
      if (enrollmentError) {
        console.error('Error fetching enrolled students:', enrollmentError);
        setLoading(false);
        return;
      }

      // Format student data
      const formattedStudents = (enrolledStudents || []).map(enrollment => {
        const studentRow = Array.isArray(enrollment.students) ? enrollment.students[0] : null;
        const userRow = studentRow && Array.isArray(studentRow.users) ? studentRow.users[0] : null;
        const studentName = userRow?.name || '';
        return { id: enrollment.student_id, name: studentName };
      });
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
    } finally {
      setLoading(false);
    }
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
      // Insert the assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment')
        .insert({
          title: title,
          total_marks: totalMarks,
          type: type.toLowerCase(),
          course_instructor_id: courseInstructorId
        })
        .select()
        .single();

      if (assessmentError) {
        console.error("Error creating assessment:", assessmentError);
        return;
      }

      // Insert grades for each student
      const gradesData = Object.entries(studentMarks).map(([studentId, grade]) => ({
        assessment_id: assessmentData.assessment_id,
        student_id: parseInt(studentId),
        grade: grade,
        total_grades: totalMarks
      }));

      const { error: gradesError } = await supabase
        .from('assessment_grades')
        .insert(gradesData);

      if (gradesError) {
        console.error("Error creating assessment grades:", gradesError);
        return;
      }

      // Success - close modal and refresh data
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