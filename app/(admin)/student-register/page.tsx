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

// Form validation schema
const studentFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rollNumber: z.string().min(8, "Roll number must be at least 8 characters"),
  department: z.string().min(2, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
  section: z.string().min(1, "Section is required"),
  phone: z.string()
    .regex(/^\d+$/, {
      message: "Phone number must contain only digits",
    })
    .transform((val) => {
      const number = parseInt(val, 10);
      if (isNaN(number)) {
        throw new Error('Invalid phone number');
      }
      return number;
    })
});

const StudentRegister = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Initialize form
  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      rollNumber: "",
      department: "",
      semester: "",
      section: "",
      phone: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof studentFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Convert phone to integer and verify type
      const phoneNumber = parseInt(values.phone.replace(/\D/g, ''), 10);
      
      // Console log to verify types before sending
      console.log('Data types before sending:', {
        email: typeof values.email,
        password: typeof values.password,
        name: typeof values.firstName + ' ' + typeof values.lastName,
        address: typeof values.address,
        phone: typeof phoneNumber
      });
      
      console.log('Phone value and type:', phoneNumber, typeof phoneNumber);

      // Verify phoneNumber is actually a number
      if (isNaN(phoneNumber)) {
        throw new Error('Phone number must be a valid number');
      }

      const { data, error } = await supabase.auth.signUp({
        email: String(values.email),
        password: String(values.password),
        options: {
          data: {
            name: String(values.firstName + ' ' + values.lastName),
            address: String(values.address),
            phone: phoneNumber  // This is now guaranteed to be a number
          }
        }
      });

      // Log the data being sent to Supabase
      console.log('Data sent to Supabase:', {
        email: values.email,
        name: values.firstName + ' ' + values.lastName,
        address: values.address,
        phone: phoneNumber,
        phoneType: typeof phoneNumber
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student registered successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      form.reset();
      router.refresh();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register student",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Student Registration</CardTitle>
          <CardDescription>
            Enter student details to register them in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                      <Input placeholder="21BSCS-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="BSCS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Student"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegister;