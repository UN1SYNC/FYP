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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

// Define types
interface School {
  id: number;
  name: string;
}

interface Degree {
  degree_id: number;
  degree_name: string;
  school_id: number;
}

interface Batch {
  batch_id: number;
  intake: number;
  degree_id: number;
}

// Define the form schema for section registration
const sectionFormSchema = z.object({
  schoolId: z.string({
    required_error: "Please select a school",
  }),
  degreeId: z.string({
    required_error: "Please select a degree program",
  }),
  batchId: z.string({
    required_error: "Please select a batch",
  }),
  sectionName: z.string().min(1, {
    message: "Section name is required",
  }).max(50, {
    message: "Section name cannot exceed 50 characters",
  }),
});

// Type for the form values
type SectionFormValues = z.infer<typeof sectionFormSchema>;

export function SectionRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      schoolId: "",
      degreeId: "",
      batchId: "",
      sectionName: "",
    },
  });

  // Watch for form field changes
  const watchSchoolId = form.watch("schoolId");
  const watchDegreeId = form.watch("degreeId");

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      if (!userData?.details?.uni_id) return;

      try {
        const { data, error } = await supabase
          .from('school')
          .select('*')
          .eq('uni_id', userData.details.uni_id);

        if (error) throw error;
        setSchools(data || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast({
          title: "Error",
          description: "Failed to load schools",
          variant: "destructive",
        });
      }
    };

    fetchSchools();
  }, [userData, supabase, toast]);

  // Fetch all degrees
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const { data, error } = await supabase
          .from('degree')
          .select('*');

        if (error) throw error;
        setDegrees(data || []);
      } catch (error) {
        console.error('Error fetching degrees:', error);
        toast({
          title: "Error",
          description: "Failed to load degree programs",
          variant: "destructive",
        });
      }
    };

    fetchDegrees();
  }, [supabase, toast]);

  // Fetch all batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data, error } = await supabase
          .from('batch')
          .select('*');

        if (error) throw error;
        setBatches(data || []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast({
          title: "Error",
          description: "Failed to load batches",
          variant: "destructive",
        });
      }
    };

    fetchBatches();
  }, [supabase, toast]);

  // Filter degrees when school changes
  useEffect(() => {
    if (watchSchoolId && degrees.length > 0) {
      const filtered = degrees.filter(
        (degree) => degree.school_id === parseInt(watchSchoolId)
      );
      setFilteredDegrees(filtered);
      
      // Reset degree and batch selection if needed
      const currentDegreeId = form.getValues("degreeId");
      if (currentDegreeId && !filtered.some(d => d.degree_id.toString() === currentDegreeId)) {
        form.setValue("degreeId", "");
        form.setValue("batchId", "");
      }
    } else {
      setFilteredDegrees([]);
      form.setValue("degreeId", "");
      form.setValue("batchId", "");
    }
  }, [watchSchoolId, degrees, form]);

  // Filter batches when degree changes
  useEffect(() => {
    if (watchDegreeId && batches.length > 0) {
      const filtered = batches.filter(
        (batch) => batch.degree_id === parseInt(watchDegreeId)
      );
      setFilteredBatches(filtered);
      
      // Reset batch selection if needed
      const currentBatchId = form.getValues("batchId");
      if (currentBatchId && !filtered.some(b => b.batch_id.toString() === currentBatchId)) {
        form.setValue("batchId", "");
      }
    } else {
      setFilteredBatches([]);
      form.setValue("batchId", "");
    }
  }, [watchDegreeId, batches, form]);

  const onSubmit = async (values: SectionFormValues) => {
    setIsSubmitting(true);
    try {
      // Insert into the sections table
      const { error } = await supabase
        .from('sections')
        .insert({
          batch_id: parseInt(values.batchId),
          section_name: values.sectionName,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section registered successfully",
        className: "bg-green-500 border-green-500 text-white",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error registering section:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register section",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Section</CardTitle>
        <CardDescription>
          Add a new section to a batch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
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
              name="degreeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree Program</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!watchSchoolId || filteredDegrees.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a degree program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredDegrees.map((degree) => (
                        <SelectItem key={degree.degree_id} value={degree.degree_id.toString()}>
                          {degree.degree_name}
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
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!watchDegreeId || filteredBatches.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredBatches.map((batch) => (
                        <SelectItem key={batch.batch_id} value={batch.batch_id.toString()}>
                          {`Intake ${batch.intake}`}
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
              name="sectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A, B, Morning, Evening" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Section"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 