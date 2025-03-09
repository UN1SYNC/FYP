"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useSelector} from "react-redux"
import { RootState } from "@/lib/store";

interface Section {
  section_id: number;
  section_name: string;
  batch_id: number;
}

interface Degree {
  degree_id: number;
  degree_name: string;
  duration: number;
}

interface Batch {
  batch_id: number;
  intake: number;
  degree_id: number;
}

const studentFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(2, "Address is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  section_id: z.number({
    required_error: "Section is required",
  }).nullable(),
  degree_id: z.number({
    required_error: "Degree is required",
  }).nullable(),
  batch_id: z.number({
    required_error: "Batch is required",
  }).nullable(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userData = useSelector((state: RootState)=>state.auth.user)

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      section_id: null,
      degree_id: null,
      batch_id: null,
    },
  });

  // Fetch sections and degrees on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('section_id, section_name, batch_id');
        
        if (sectionsError) throw sectionsError;
        setSections(sectionsData || []);

        // Fetch degrees
        const { data: degreesData, error: degreesError } = await supabase
          .from('degree')
          .select('degree_id, degree_name, duration');
        
        if (degreesError) throw degreesError;
        setDegrees(degreesData || []);

        // Changed from 'batches' to 'batch'
        const { data: batchesData, error: batchesError } = await supabase
          .from('batch')
          .select('batch_id, intake, degree_id');

          console.log("batchesData: ", batchesData);
        
        if (batchesError) throw batchesError;
        setBatches(batchesData || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          className: "bg-red-500 border-red-500 text-white",
          duration: 2000,
        });
      }
    }
    fetchData();
  }, []);

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      // Format phone number (remove non-digits)
      const phoneNumber = parseInt(values.phone.replace(/\D/g, ''));

      // First create the auth user with formatted data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: `${values.firstName} ${values.lastName}`,
            address: values.address,
            phone: phoneNumber,
            role: "student",
          university_id: userData?.details?.uni_id,
          }
        }
      });

      if (authError) throw authError;

      // Then create the student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user!.id,
          section_id: values.section_id,
          degree_id: values.degree_id,
          university_id: userData?.details?.uni_id,
        });


      if (studentError) throw studentError;

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

  // Fetch batches when degree is selected
  const onDegreeChange = async (degreeId: number | null) => {
    try {
      setBatches([]);
      setSections([]);
      
      form.setValue('degree_id', degreeId);
      form.setValue('batch_id', null);
      form.setValue('section_id', null);

      if (degreeId) {
        const { data, error } = await supabase
          .from('batch')
          .select('batch_id, intake, degree_id')
          .eq('degree_id', degreeId)
          .order('intake', { ascending: false });
        
        if (error) throw error;
        setBatches(data || []);
      }
    } catch (error: any) {
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch batches",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  const onBatchChange = async (batchId: number | null) => {
    try {
      setSections([]);
      form.setValue('batch_id', batchId);
      form.setValue('section_id', null);

      if (batchId) {
        const { data, error } = await supabase
          .from('sections')
          .select('section_id, section_name, batch_id')
          .eq('batch_id', batchId);
        
        if (error) throw error;
        setSections(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch sections",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 md:p-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Register Student</CardTitle>
          <CardDescription>
            Add a new student to the system
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
                      <Input placeholder="Enter email" type="email" {...field} />
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
                      <Input placeholder="Enter password" type="password" {...field} />
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
                name="degree_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Program</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => {
                        const numValue = value ? Number(value) : null;
                        field.onChange(numValue);
                        onDegreeChange(numValue);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Degree Program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {degrees.map((degree) => (
                          <SelectItem
                            key={degree.degree_id}
                            value={String(degree.degree_id)}
                          >
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
                name="batch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Year</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => {
                        const numValue = value ? Number(value) : null;
                        field.onChange(numValue);
                        onBatchChange(numValue);
                      }}
                      disabled={!form.getValues('degree_id')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Batch Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem
                            key={batch.batch_id}
                            value={String(batch.batch_id)}
                          >
                            {batch.intake}
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
                name="section_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => {
                        const numValue = value ? Number(value) : null;
                        field.onChange(numValue);
                      }}
                      disabled={!form.getValues('batch_id')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem
                            key={section.section_id}
                            value={String(section.section_id)}
                          >
                            {section.section_name}
                          </SelectItem>
                        ))}
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
                {isSubmitting ? "Registering..." : "Register Student"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 