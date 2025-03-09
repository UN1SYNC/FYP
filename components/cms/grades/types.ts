export interface StudentResult {
  [key: string]: {
    name: string;
    marks: number;
  };
}

export interface AssessmentData {
  id?: string;
  assessment_id: string;
  name: string;
  total: number;
  average: number;
  students_results: StudentResult[];
}

export interface InstructorDataProps {
  instructorData: {
    final?: AssessmentData[];
    midterm?: AssessmentData[];
    [key: string]: AssessmentData[] | undefined;
  };
} 