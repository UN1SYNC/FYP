"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const enrollmentFormSchema = z.object({
  student_id: z.number({
    required_error: "Student ID is required",
    invalid_type_error: "Student ID must be a number",
  }),
  course_id: z.number({
    required_error: "Course ID is required",
    invalid_type_error: "Course ID must be a number",
  }),
  status: z.enum(["pending", "approved", "completed"], {
    required_error: "Status is required",
  }).default("pending"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export function StudentEnrollForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Fetch students and courses on component mount
  useState(() => {
    async function fetchData() {
      const { data: studentsData } = await supabase
        .from('students')
        .select('student_id, name');
      
      const { data: coursesData } = await supabase
        .from('courses')
        .select('course_id, title, course_code');

      if (studentsData) setStudents(studentsData);
      if (coursesData) setCourses(coursesData);
    }

    fetchData();
  }, []);

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      status: "pending",
    },
  });

  const onSubmit = async (values: EnrollmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select()
        .eq('student_id', values.student_id)
        .eq('course_id', values.course_id)
        .single();

      if (existingEnrollment) {
        throw new Error('Student is already enrolled in this course');
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: values.student_id,
          course_id: values.course_id,
          status: values.status,
        })
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student enrolled successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      form.reset();
      router.refresh();
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enroll student",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Student Enrollment</CardTitle>
          <CardDescription>
            Enroll a student in a course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem 
                            key={student.student_id} 
                            value={student.student_id.toString()}
                          >
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem 
                            key={course.course_id} 
                            value={course.course_id.toString()}
                          >
                            {course.course_code} - {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enrolling..." : "Enroll Student"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 