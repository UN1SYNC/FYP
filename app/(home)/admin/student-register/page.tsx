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
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  address: z.string().min(1, {
    message: "Address is required",
  }),
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
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof studentFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Convert phone to integer and verify type
      const phoneNumber = parseInt(values.phone.toString(), 10);

      // Verify phoneNumber is actually a number
      if (isNaN(phoneNumber)) {
        throw new Error('Phone number must be a valid number');
      }

      const { data, error } = await supabase.auth.signUp({
        email: String(values.email),
        password: String(values.password),
        options: {
          data: {
            name: String(values.name),
            address: String(values.address),
            phone: phoneNumber  // This is now guaranteed to be a number
          }
        }
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
    <div className="flex w-full  justify-center p-4 ">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Student Registration
          </CardTitle>
          <CardDescription className="text-slate-600">
            Register a new student account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          className="border-slate-200 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                          className="border-slate-200 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="border-slate-200 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+92 300 1234567" 
                          {...field}
                          className="border-slate-200 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter complete address" 
                        {...field}
                        className="border-slate-200 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Registering...</span>
                  </div>
                ) : (
                  "Register Student"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegister;