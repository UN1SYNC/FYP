"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

// Define types for the data we'll be working with
type Batch = {
  batch_id: number;
  intake: string; // Year value
  degree_id: number;
};

type School = {
  id: number;
  name: string;
  uni_id: number;
};

type Degree = {
  degree_id: number;
  degree_name: string;
  school_id: number;
};

type Section = {
  section_id: number;
  section_name: string;
  batch_id: number;
};

type Course = {
  course_id: number;
  title: string;
  course_section_id: number; // Make this required, not optional
};

type Instructor = {
  instructor_id: number;
  name: string;
};

const assignmentFormSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  degreeId: z.string().min(1, "Degree is required"),
  batchId: z.string().min(1, "Batch is required"),
  sectionId: z.string().min(1, "Section is required"),
  courseId: z.string().min(1, "Course is required"),
  instructorId: z.string().min(1, "Instructor is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export function CourseAssignmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      schoolId: "",
      degreeId: "",
      batchId: "",
      sectionId: "",
      courseId: "",
      instructorId: "",
    },
  });

  // Fetch schools based on user's university
  useEffect(() => {
    const fetchSchools = async () => {
      if (!userData?.university_id) return;
      
      try {
        const { data, error } = await supabase
          .from('school')
          .select('id, name, uni_id')
          .eq('uni_id', userData?.university_id);
        
        if (error) {
          console.error("Error fetching schools:", error);
          toast({
            title: "Error",
            description: "Failed to load schools",
            className: "bg-red-500 border-red-500 text-white",
            duration: 2000,
          });
          return;
        }
        
        setSchools(data || []);
      } catch (error: any) {
        console.error("Error fetching schools:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load schools",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
      }
    };

    fetchSchools();
  }, [userData, supabase, toast]);

  // Fetch all degrees on component mount
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const { data, error } = await supabase
          .from('degree')
          .select('degree_id, degree_name, school_id')
          .order('degree_name');
        
        if (error) {
          console.error("Error fetching degrees:", error);
          toast({
            title: "Error",
            description: "Failed to load degrees",
            className: "bg-red-500 border-red-500 text-white",
            duration: 2000,
          });
          return;
        }
        
        setDegrees(data || []);
      } catch (error: any) {
        console.error("Error fetching degrees:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load degrees",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
      }
    };

    fetchDegrees();
  }, [supabase, toast]);

  // Filter degrees when school changes
  useEffect(() => {
    if (!selectedSchoolId) {
      setFilteredDegrees([]);
      return;
    }

    const schoolId = parseInt(selectedSchoolId);
    const filtered = degrees.filter(degree => degree.school_id === schoolId);
    setFilteredDegrees(filtered);
  }, [selectedSchoolId, degrees]);

  // Fetch all batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      const { data, error } = await supabase
        .from("batch")
        .select("batch_id, intake, degree_id")
        .eq('university_id', userData?.university_id)
        .order("intake", { ascending: false });

      if (error) {
        console.error("Error fetching batches:", error);
        toast({
          title: "Error",
          description: "Failed to load batches",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }

      setBatches(data || []);
    };

    fetchBatches();
  }, [supabase, toast]);

  // Filter batches when degree changes
  useEffect(() => {
    if (!selectedDegreeId) {
      setFilteredBatches([]);
      return;
    }

    const degreeId = parseInt(selectedDegreeId);
    const filtered = batches.filter(batch => batch.degree_id === degreeId);
    setFilteredBatches(filtered);
  }, [selectedDegreeId, batches]);

  // Fetch all sections on component mount
  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("section_id, section_name, batch_id")
        .order("section_name");

      if (error) {
        console.error("Error fetching sections:", error);
        toast({
          title: "Error",
          description: "Failed to load sections",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }

      setSections(data || []);
    };

    fetchSections();
  }, [supabase, toast]);

  // Filter sections when batch changes
  useEffect(() => {
    if (!selectedBatchId) {
      setFilteredSections([]);
      return;
    }

    const batchId = parseInt(selectedBatchId);
    const filtered = sections.filter(section => section.batch_id === batchId);
    setFilteredSections(filtered);
  }, [selectedBatchId, sections]);

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      if (!userData?.university_id) return;
      
      const { data, error } = await supabase
        .from("instructors")
        .select(`
          instructor_id,
          user_id,
          users (
            name
          )
        `)
        .eq('university_id', userData?.university_id);

      if (error) {
        console.error("Error fetching instructors:", error);
        toast({
          title: "Error",
          description: "Failed to load instructors",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }

      if (!data) {
        setInstructors([]);
        return;
      }

      const formattedInstructors = data.map(instructor => {
        return {
          instructor_id: instructor.instructor_id,
          name: typeof instructor.users === 'object' && instructor.users !== null
            ? (Array.isArray(instructor.users)
              ? (instructor.users[0]?.name || 'Unknown instructor')
              : ((instructor.users as any).name || 'Unknown instructor'))
            : 'Unknown instructor'
        };
      });

      setInstructors(formattedInstructors);
    };

    fetchInstructors();
  }, [supabase, toast, userData?.university_id]);

  // Fetch courses when section changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedSectionId) {
        setCourses([]);
        return;
      }

      // Get course_ids and course_section_ids from course_section for the selected section
      const { data: courseSectionData, error: courseSectionError } = await supabase
        .from("course_section")
        .select("id, course_id") // Also get the id (course_section_id)
        .eq("section_id", selectedSectionId);

      if (courseSectionError) {
        console.error("Error fetching course sections:", courseSectionError);
        toast({
          title: "Error",
          description: "Failed to load courses for section",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }

      if (!courseSectionData || courseSectionData.length === 0) {
        setCourses([]);
        return;
      }

      // Extract course IDs
      const courseIds = courseSectionData.map(cs => cs.course_id);

      // Now fetch course details
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("course_id, title")
        .in("course_id", courseIds)
        .order("title");

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        toast({
          title: "Error",
          description: "Failed to load course details",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        return;
      }

      // Combine course data with course_section_id
      const coursesWithSectionId = coursesData?.map(course => {
        // Find the matching course_section record to get its id
        const courseSectionRecord = courseSectionData.find(cs => cs.course_id === course.course_id);
        return {
          ...course,
          course_section_id: courseSectionRecord?.id
        };
      }) || [];

      setCourses(coursesWithSectionId);
    };

    fetchCourses();
  }, [selectedSectionId, supabase, toast]);

  // Handle school change
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    form.setValue("schoolId", schoolId);
    
    // Reset dependent fields
    setSelectedDegreeId(null);
    setSelectedBatchId(null);
    setSelectedSectionId(null);
    form.setValue("degreeId", "");
    form.setValue("batchId", "");
    form.setValue("sectionId", "");
    form.setValue("courseId", "");
  };

  // Handle degree change
  const handleDegreeChange = (degreeId: string) => {
    setSelectedDegreeId(degreeId);
    form.setValue("degreeId", degreeId);
    
    // Reset dependent fields
    setSelectedBatchId(null);
    setSelectedSectionId(null);
    form.setValue("batchId", "");
    form.setValue("sectionId", "");
    form.setValue("courseId", "");
  };

  // Handle batch change
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    form.setValue("batchId", batchId);
    
    // Reset dependent fields
    setSelectedSectionId(null);
    form.setValue("sectionId", "");
    form.setValue("courseId", "");
  };

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Get the course_section_id for the selected course and section
      const selectedCourse = courses.find(course => course.course_id.toString() === values.courseId);
      
      if (!selectedCourse || !selectedCourse.course_section_id) {
        toast({
          title: "Error",
          description: "Could not find the course-section relationship",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        setIsSubmitting(false);
        return;
      }

      // Check if the assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from("course_instructor")
        .select("id")
        .eq("section_id", values.sectionId)
        .eq("course_id", values.courseId)
        .eq("instructor_id", values.instructorId);

      if (checkError) {
        throw checkError;
      }

      if (existingAssignment && existingAssignment.length > 0) {
        toast({
          title: "Error",
          description: "This course is already assigned to this instructor for the selected section",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
        setIsSubmitting(false);
        return;
      }

      // Create the course-instructor assignment
      const { error: assignmentError } = await supabase
        .from("course_instructor")
        .insert({
          section_id: parseInt(values.sectionId),
          course_id: parseInt(values.courseId),
          instructor_id: parseInt(values.instructorId),
          course_section_id: selectedCourse.course_section_id,
          course_info: {} // Empty JSON object for now
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Success",
        description: "Course assigned to instructor successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      // Reset form and state variables
      form.reset();
      // Reset all selection states
      setSelectedSchoolId(null);
      setSelectedDegreeId(null);
      setSelectedBatchId(null);
      setSelectedSectionId(null);
      // Reset filtered data
      setFilteredDegrees([]);
      setFilteredBatches([]);
      setFilteredSections([]);
      setCourses([]);
    } catch (error: any) {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign course to instructor",
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
          <CardTitle className="text-2xl">Assign Course to Instructor</CardTitle>
          <CardDescription>
            Assign courses to instructors for specific sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* School Selection */}
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value) => handleSchoolChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No schools available
                          </SelectItem>
                        ) : (
                          schools.map((school) => (
                            <SelectItem
                              key={school.id}
                              value={school.id.toString()}
                            >
                              {school.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Degree Selection */}
              <FormField
                control={form.control}
                name="degreeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Program</FormLabel>
                    <Select
                      onValueChange={(value) => handleDegreeChange(value)}
                      defaultValue={field.value}
                      disabled={!selectedSchoolId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedSchoolId ? "Select a degree" : "First select a school"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDegrees.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {selectedSchoolId 
                              ? "No degrees available for this school" 
                              : "Please select a school first"}
                          </SelectItem>
                        ) : (
                          filteredDegrees.map((degree) => (
                            <SelectItem
                              key={degree.degree_id}
                              value={degree.degree_id.toString()}
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

              {/* Batch Selection - Update to use filteredBatches */}
              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch (Intake Year)</FormLabel>
                    <Select
                      onValueChange={(value) => handleBatchChange(value)}
                      defaultValue={field.value}
                      disabled={!selectedDegreeId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDegreeId ? "Select a batch" : "First select a degree"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredBatches.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {selectedDegreeId 
                              ? "No batches available for this degree" 
                              : "Please select a degree first"}
                          </SelectItem>
                        ) : (
                          filteredBatches.map((batch) => (
                            <SelectItem
                              key={batch.batch_id}
                              value={batch.batch_id.toString()}
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

              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedSectionId(value);
                        form.setValue("courseId", ""); // Reset course when section changes
                      }}
                      defaultValue={field.value}
                      disabled={!selectedBatchId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedBatchId ? "Select a section" : "First select a batch"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSections.map((section) => (
                          <SelectItem
                            key={section.section_id}
                            value={section.section_id.toString()}
                          >
                            {section.section_name}
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
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedSectionId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedSectionId ? "Select a course" : "First select a section"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {selectedSectionId 
                              ? "No courses available for this section" 
                              : "Please select a section first"}
                          </SelectItem>
                        ) : (
                          courses.map((course) => (
                            <SelectItem
                              key={course.course_id}
                              value={course.course_id.toString()}
                            >
                              {course.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem
                            key={instructor.instructor_id}
                            value={instructor.instructor_id.toString()}
                          >
                            {instructor.name}
                          </SelectItem>
                        ))}
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
                {isSubmitting ? "Assigning..." : "Assign Course to Instructor"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 