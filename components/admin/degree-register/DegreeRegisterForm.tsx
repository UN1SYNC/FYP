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

// Define the School type
interface School {
  id: number;
  name: string;
  uni_id: number;
}

// Define the form schema for degree program registration
const degreeFormSchema = z.object({
  schoolId: z.string({
    required_error: "Please select a school",
  }),
  degreeName: z.string().min(2, {
    message: "Degree name must be at least 2 characters.",
  }),
  duration: z.coerce.number().int().min(1, {
    message: "Duration must be at least 1 year.",
  }).max(10, {
    message: "Duration cannot exceed 10 years.",
  }),
});

// Type for the form values
type DegreeFormValues = z.infer<typeof degreeFormSchema>;

export function DegreeRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<DegreeFormValues>({
    resolver: zodResolver(degreeFormSchema),
    defaultValues: {
      schoolId: "",
      degreeName: "",
      duration: 4, // Default duration of 4 years
    },
  });

  // Fetch the list of schools for the dropdown
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

  const onSubmit = async (values: DegreeFormValues) => {
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
      // Insert into the degree table
      const { error } = await supabase
        .from('degree')
        .insert({
          degree_name: values.degreeName,
          duration: values.duration,
          school_id: parseInt(values.schoolId),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Degree program registered successfully",
        className: "bg-green-500 border-green-500 text-white",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error registering degree program:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register degree program",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Degree Program</CardTitle>
        <CardDescription>
          Add a new degree program to a school
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
              name="degreeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bachelor of Science in Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Degree Program"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 