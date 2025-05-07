"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

// Define the form schema for school registration
const schoolFormSchema = z.object({
  schoolName: z.string().min(2, {
    message: "School name must be at least 2 characters.",
  }),
});

// Type for the form values
type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export function SchoolRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      schoolName: "",
    },
  });

  const onSubmit = async (values: SchoolFormValues) => {
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
      // Insert into the school table
      const { error } = await supabase
        .from('school')
        .insert({
          name: values.schoolName,
          uni_id: userData.details.uni_id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "School registered successfully",
        className: "bg-green-500 border-green-500 text-white",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error registering school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register school",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New School</CardTitle>
        <CardDescription>
          Add a new school to your university structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="School of Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register School"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 