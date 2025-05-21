import { useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const assignmentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export function CreateAssignment({ 
  onAssignmentCreated, 
  courseInstructorId 
}: { 
  onAssignmentCreated: () => void,
  courseInstructorId: number 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const courseId = parseInt(params.course_id as string);
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      const dueDate = new Date(values.due_date);
      
      const { error } = await supabase
        .from('assignments')
        .insert({
          title: values.title,
          description: values.description,
          due_date: dueDate.toISOString().split('T')[0],
          course_id: courseId,
          course_instructor_id: courseInstructorId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      form.reset();
      setIsOpen(false);
      onAssignmentCreated();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment for your students.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Assignment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Assignment description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 