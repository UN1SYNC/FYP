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

interface School {
  id: number;
  name: string;
  uni_id: number;
}

const adminFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(2, "Address is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  schoolId: z.number({
    required_error: "School is required",
  }).nullable(),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export function AdminRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState) => state.auth.user);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      schoolId: null,
    },
  });

  useEffect(() => {
    const fetchSchools = async () => {
      if (!userData?.details?.uni_id) return;
      
      try {
        const { data, error } = await supabase
          .from('school')
          .select('id, name, uni_id')
          .eq('uni_id', userData.details.uni_id);
        
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

  const onSubmit = async (values: AdminFormValues) => {
    setIsSubmitting(true);
    try {
      const phoneNumber = parseInt(values.phone.replace(/\D/g, ''));

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: `${values.firstName} ${values.lastName}`,
            address: values.address,
            phone: phoneNumber,
            role: "admin",
            university_id: userData?.details?.uni_id,
          }
        }
      });

      if (authError) throw authError;

      // Then create the admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert({
          user_id: authData.user!.id,
          school_id: values.schoolId,
        });

      if (adminError) throw adminError;

      toast({
        title: "Success",
        description: "Admin registered successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      form.reset();
      router.refresh();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register admin",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 md:p-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Register Admin</CardTitle>
          <CardDescription>
            Add a new admin to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
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
                      <Input placeholder="Enter last name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select School" />
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
                              value={String(school.id)}
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Admin"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 