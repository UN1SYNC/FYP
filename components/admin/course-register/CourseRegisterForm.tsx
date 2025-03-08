"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
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

const courseFormSchema = z.object({
  title: z.string().min(2, "Course title is required"),
  course_code: z.string().min(2, "Course code is required"),
  description: z.string().optional(),
  no_weeks: z.number().min(1, "Number of weeks must be at least 1"),
  prerequisite: z.number().nullable(),
  school_id: z.number().nullable(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export function CourseRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      course_code: "",
      description: "",
      no_weeks: 1,
      prerequisite: null,
      school_id: null,
    },
  });

  async function onSubmit(data: CourseFormValues) {
    setIsLoading(true);
    try {
        console.log("Data:", data)
      const { error } = await supabase
        .from('courses')
        .insert(data)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course has been successfully registered",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Course Registration</CardTitle>
          <CardDescription>
            Enter course details to register in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Programming" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="course_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Course description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="no_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Weeks</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="16"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prerequisite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prerequisite ID</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School ID</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Course"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 