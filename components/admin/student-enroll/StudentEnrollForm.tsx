"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Loading from "@/components/ui/loading";

// Updated interfaces based on DB schema
interface Degree {
  degree_id: number;
  degree_name: string;
  duration: number;
  department_id: number;
  school_id: number;
}

interface Batch {
  batch_id: number;
  intake: number;
  degree_id: number;
}

interface Section {
  section_id: number;
  batch_id: number;
  section_name: string;
}

interface Student {
  student_id: number;
  user_id: string;
  section_id: number;
  degree_id: number;
  created_at: string;
  updated_at: string;
  university_id: number;
  isSelected?: boolean;
}

// Add interface for Enrollment
interface Enrollment {
  student_id: number;
  course_id: number;
  status: 'pending' | 'approved' | 'completed';
}

// Update the Course interface to make optional fields nullable
interface Course {
  course_id: number;
  title: string;
  course_code: string;
  description?: string | null;
  prerequisite?: number | null;
  no_weeks?: number | null;
  school_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Updated schema to match DB fields
const enrollmentFormSchema = z.object({
  degree_id: z.number({
    required_error: "Degree is required",
  }),
  batch_id: z.number({
    required_error: "Batch is required",
  }),
  section_id: z.number({
    required_error: "Section is required",
  }),
  course_id: z.number({
    required_error: "Course is required",
  }),
});

type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export function StudentEnrollForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentFormSchema),
  });

  // Fetch degrees on component mount
  useEffect(() => {
    async function fetchDegrees() {
      try {
        const { data, error } = await supabase
          .from('degree')
          .select('degree_id, degree_name, duration, department_id, school_id');
        
        if (error) throw error;
        setDegrees(data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch degrees');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDegrees();
  }, []);

  // Fetch batches when degree is selected
  const onDegreeChange = async (degreeId: number) => {
    try {
      const { data, error } = await supabase
        .from('batch')
        .select('batch_id, intake, degree_id')
        .eq('degree_id', degreeId);
      
      if (error) throw error;
      setBatches(data || []);
      form.setValue('degree_id', degreeId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  // Fetch sections when batch is selected
  const onBatchChange = async (batchId: number) => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('section_id, section_name, batch_id')
        .eq('batch_id', batchId);
      
      if (error) throw error;
      setSections(data || []);
      form.setValue('batch_id', batchId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sections",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  // Fetch students when section is selected
  const onSectionChange = async (sectionId: number) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          student_id,
          user_id,
          section_id,
          degree_id,
          created_at,
          updated_at,
          university_id
        `)
        .eq('section_id', sectionId);
      
      if (error) throw error;
      setStudents(data?.map(student => ({ ...student, isSelected: false })) || []);
      form.setValue('section_id', sectionId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('course_id, title, course_code, description, prerequisite, no_weeks, school_id, created_at, updated_at');
        
        if (error) throw error;

        // Type assertion to ensure data matches Course interface
        const coursesData = (data || []) as Course[];
        setCourses(coursesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
      }
    }
    fetchCourses();
  }, []);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setStudents(students.map(student => ({ ...student, isSelected: checked })));
  };

  // Handle individual student selection
  const handleStudentSelect = (studentId: number, checked: boolean) => {
    setStudents(students.map(student =>
      student.student_id === studentId ? { ...student, isSelected: checked } : student
    ));
  };

  const resetForm = () => {
    form.reset();
    setStudents([]);
    setBatches([]);
    setSections([]);
    setSelectAll(false);
  };

  const onSubmit = async (values: EnrollmentFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedStudents = students.filter(student => student.isSelected);
      if (selectedStudents.length === 0) {
        throw new Error('Please select at least one student');
      }

      // Create enrollment records for selected students
      const enrollments = selectedStudents.map(student => ({
        student_id: student.student_id,
        course_id: values.course_id,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('enrollments')
        .insert(enrollments);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Students enrolled successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      // Reset all form states
      resetForm();
      
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll students",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Batch Enrollment</CardTitle>
          <CardDescription>
            Enroll multiple students in a course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Degree Selection */}
              <FormField
                control={form.control}
                name="degree_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Program</FormLabel>
                    <Select
                      onValueChange={(value) => onDegreeChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Degree Program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {degrees.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No degrees available
                          </SelectItem>
                        ) : (
                          degrees.map((degree) => (
                            <SelectItem
                              key={degree.degree_id}
                              value={String(degree.degree_id)}
                            >
                              {degree.degree_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Batch Selection */}
              <FormField
                control={form.control}
                name="batch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Intake</FormLabel>
                    <Select
                      onValueChange={(value) => onBatchChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Batch Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batches.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Please select a degree first
                          </SelectItem>
                        ) : (
                          batches.map((batch) => (
                            <SelectItem
                              key={batch.batch_id}
                              value={String(batch.batch_id)}
                            >
                              {batch.intake}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section Selection */}
              <FormField
                control={form.control}
                name="section_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={(value) => onSectionChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Please select a batch first
                          </SelectItem>
                        ) : (
                          sections.map((section) => (
                            <SelectItem
                              key={section.section_id}
                              value={String(section.section_id)}
                            >
                              {section.section_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Selection */}
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={(value) => form.setValue('course_id', Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No courses available
                          </SelectItem>
                        ) : (
                          courses.map((course) => (
                            <SelectItem
                              key={course.course_id}
                              value={String(course.course_id)}
                            >
                              {course.course_code} - {course.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Students Table */}
              {students.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>
                            <Checkbox
                              checked={student.isSelected}
                              onCheckedChange={(checked) =>
                                handleStudentSelect(student.student_id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !form.getValues('course_id')}
              >
                {isSubmitting ? "Enrolling..." : "Enroll Selected Students"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 