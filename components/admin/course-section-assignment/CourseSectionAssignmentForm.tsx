"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface School {
  id: number;
  name: string;
}

interface DegreeProgram {
  id: number;
  name: string;
  school_id: number;
  degree_id: number;
  degree_name: string;
}

interface Batch {
  id: number;
  name: string;
  degree_program_id: number;
  batch_id: number;
  intake: string;
}

interface Section {
  id: number;
  name: string;
  batch_id: number;
  section_id: number;
  section_name: string;
}

interface Course {
  course_id: number;
  title: string;
  course_code: string;
  school_id: number;
}

export function CourseSectionAssignmentForm() {
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);
  
  const [schools, setSchools] = useState<School[]>([]);
  const [degreePrograms, setDegreePrograms] = useState<DegreeProgram[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedDegreeProgram, setSelectedDegreeProgram] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('school')
          .select('*')
          .eq('uni_id', userData?.details?.uni_id);
          
        if (error) throw error;
        setSchools(data || []);
      } catch (error) {
        console.error("Error fetching schools:", error);
        toast({
          title: "Error",
          description: "Failed to fetch schools",
          variant: "destructive",
        });
      }
    };
    fetchSchools();
  }, [userData?.details?.uni_id, supabase, toast]);

  // Fetch degree programs when school is selected
  useEffect(() => {
    if (selectedSchool) {
      const fetchDegreePrograms = async () => {
        try {
          const { data, error } = await supabase
            .from('degree')
            .select('*')
            .eq('school_id', selectedSchool);
            
          if (error) throw error;
          setDegreePrograms(data || []);
        } catch (error) {
          console.error("Error fetching degree programs:", error);
          toast({
            title: "Error",
            description: "Failed to fetch degree programs",
            variant: "destructive",
          });
        }
      };
      fetchDegreePrograms();
    }
  }, [selectedSchool, supabase, toast]);

  // Fetch batches when degree program is selected
  useEffect(() => {
    if (selectedDegreeProgram) {
      const fetchBatches = async () => {
        try {
          const { data, error } = await supabase
            .from('batch')
            .select('*')
            .eq('degree_id', selectedDegreeProgram);
            
          if (error) throw error;
          setBatches(data || []);
        } catch (error) {
          console.error("Error fetching batches:", error);
          toast({
            title: "Error",
            description: "Failed to fetch batches",
            variant: "destructive",
          });
        }
      };
      fetchBatches();
    }
  }, [selectedDegreeProgram, supabase, toast]);

  // Fetch sections when batch is selected
  useEffect(() => {
    if (selectedBatch) {
      const fetchSections = async () => {
        try {
          const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('batch_id', selectedBatch);
            
          if (error) throw error;
          setSections(data || []);
        } catch (error) {
          console.error("Error fetching sections:", error);
          toast({
            title: "Error",
            description: "Failed to fetch sections",
            variant: "destructive",
          });
        }
      };
      fetchSections();
    }
  }, [selectedBatch, supabase, toast]);

  // Fetch courses when school is selected
  useEffect(() => {
    if (selectedSchool) {
      const fetchCourses = async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('school_id', selectedSchool);
            
          if (error) throw error;
          setCourses(data || []);
        } catch (error) {
          console.error("Error fetching courses:", error);
          toast({
            title: "Error",
            description: "Failed to fetch courses",
            variant: "destructive",
          });
        }
      };
      fetchCourses();
    }
  }, [selectedSchool, supabase, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection || !selectedCourse) {
      toast({
        title: "Error",
        description: "Please select both section and course",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting with values:", {
        section_id: parseInt(selectedSection),
        course_id: parseInt(selectedCourse),
      });
      
      // Check if the assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('course_section')
        .select('*')
        .eq('section_id', parseInt(selectedSection))
        .eq('course_id', parseInt(selectedCourse))
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Check error details:", checkError);
        throw checkError;
      }

      if (existingAssignment) {
        toast({
          title: "Error",
          description: "This course is already assigned to this section",
          variant: "destructive",
        });
        return;
      }

      // Create new assignment
      const { data, error } = await supabase
        .from('course_section')
        .insert([
          {
            section_id: parseInt(selectedSection),
            course_id: parseInt(selectedCourse),
          },
        ])
        .select();

      if (error) {
        console.error("Insert error details:", error);
        throw error;
      }

      console.log("Successfully inserted:", data);
      
      toast({
        title: "Success",
        description: "Course assigned to section successfully",
        className: "bg-green-500 border-green-500 text-white",
      });
      
      // Reset form
      setSelectedCourse("");
    } catch (error) {
      console.error("Error assigning course to section:", error);
      let errorMessage = "Failed to assign course to section";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Assign Course to Section</CardTitle>
        <CardDescription>
          Select a school, degree program, batch, section, and course to create an assignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">School</label>
              <Select
                value={selectedSchool}
                onValueChange={setSelectedSchool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Degree Program</label>
              <Select
                value={selectedDegreeProgram}
                onValueChange={setSelectedDegreeProgram}
                disabled={!selectedSchool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Degree Program" />
                </SelectTrigger>
                <SelectContent>
                  {degreePrograms.map((program) => (
                    <SelectItem key={program.degree_id} value={program.degree_id.toString()}>
                      {program.name || program.degree_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Batch</label>
              <Select
                value={selectedBatch}
                onValueChange={setSelectedBatch}
                disabled={!selectedDegreeProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.batch_id} value={batch.batch_id.toString()}>
                      {batch.name || batch.intake}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={!selectedBatch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.section_id} value={section.section_id.toString()}>
                      {section.name || section.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                disabled={!selectedSchool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_id} value={course.course_id.toString()}>
                      {course.course_code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Assign Course to Section"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 