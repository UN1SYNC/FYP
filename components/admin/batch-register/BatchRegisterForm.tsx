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

// Define the form schema for batch registration
const batchFormSchema = z.object({
  schoolId: z.string({
    required_error: "Please select a school",
  }),
  degreeId: z.string({
    required_error: "Please select a degree program",
  }),
  intake: z.coerce.number().int().min(2000, {
    message: "Please enter a valid intake year",
  }).max(2100, {
    message: "Intake year cannot exceed 2100",
  }),
});

// Type for the form values
type BatchFormValues = z.infer<typeof batchFormSchema>;

export function BatchRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      schoolId: "",
      degreeId: "",
      intake: new Date().getFullYear(), // Current year as default
    },
  });

  // Watch the schoolId to filter degrees
  const watchSchoolId = form.watch("schoolId");

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

  // Fetch degrees
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

  // Filter degrees when school changes
  useEffect(() => {
    if (watchSchoolId && degrees.length > 0) {
      const filtered = degrees.filter(
        (degree) => degree.school_id === parseInt(watchSchoolId)
      );
      setFilteredDegrees(filtered);
      // Reset degree selection if the selected degree is not in the filtered list
      const currentDegreeId = form.getValues("degreeId");
      if (currentDegreeId && !filtered.some(d => d.degree_id.toString() === currentDegreeId)) {
        form.setValue("degreeId", "");
      }
    } else {
      setFilteredDegrees([]);
      form.setValue("degreeId", "");
    }
  }, [watchSchoolId, degrees, form]);

  const onSubmit = async (values: BatchFormValues) => {
    if (!userData?.details?.uni_id) {
      toast({
        title: "Error",
        description: "University ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert into the batch table
      const { error } = await supabase
        .from('batch')
        .insert({
          degree_id: parseInt(values.degreeId),
          intake: values.intake,
          university_id: userData.details.uni_id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Batch registered successfully",
        className: "bg-green-500 border-green-500 text-white",
      });

      form.reset({
        schoolId: "",
        degreeId: "",
        intake: new Date().getFullYear(),
      });
    } catch (error: any) {
      console.error('Error registering batch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register batch",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Batch</CardTitle>
        <CardDescription>
          Add a new batch for a degree program
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
              name="intake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Batch"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 