"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
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

interface School {
  id: number;
  name: string;
  uni_id: number;
}

const courseFormSchema = z.object({
  title: z.string().min(2, "Course title is required"),
  course_code: z.string().min(2, "Course code is required"),
  description: z.string().optional(),
  no_weeks: z.number().min(1, "Number of weeks must be at least 1"),
  school_id: z.number().nullable(),
  credit_hours: z.number().min(1, "Credit hours must be at least 1"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export function CourseRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      course_code: "",
      description: "",
      no_weeks: 1,
      school_id: null,
      credit_hours: 3,
    },
  });

  useEffect(() => {
    async function fetchSchools() {
      if (!userData?.university_id) return;
      
      try {
        const { data, error } = await supabase
          .from('school')
          .select('id, name, uni_id')
          .eq('uni_id', userData?.university_id);
        
        if (error) throw error;
        setSchools(data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch schools",
          variant: "destructive",
        });
      }
    }
    
    fetchSchools();
  }, [userData, supabase, toast]);

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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Register Course</CardTitle>
          <CardDescription>
            Add a new course to the system
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
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select School" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No schools available
                              </SelectItem>
                            ) : (
                              schools.map((school) => (
                                <SelectItem
                                  key={school.id}
                                  value={String(school.id)}
                                >
                                  {school.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credit_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="3"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
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