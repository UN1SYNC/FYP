"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import { PlusCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  assignment_id: number;
  title: string;
  due_date: string;
  description: string;
  submissions_count?: number;
}

const InstructorSubmission = () => {
  const params = useParams();
  const courseId = parseInt(params.course_id as string);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: ""
  });
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      if (isNaN(courseId)) {
        throw new Error('Invalid course ID');
      }

      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId);

      if (error) {
        throw error;
      }

      // For each assignment, count the submissions
      const assignmentsWithSubmissionCount = await Promise.all(
        data.map(async (assignment) => {
          const { count, error: countError } = await supabase
            .from('assignment_grades')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.assignment_id)
            .not('submission_path', 'is', null);

          return {
            ...assignment,
            submissions_count: count || 0
          };
        })
      );

      setAssignments(assignmentsWithSubmissionCount);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      // Validate input
      if (!newAssignment.title.trim()) {
        toast({
          variant: "destructive",
          title: "Missing title",
          description: "Please enter a title for the assignment.",
        });
        return;
      }

      if (!newAssignment.due_date) {
        toast({
          variant: "destructive",
          title: "Missing due date",
          description: "Please select a due date for the assignment.",
        });
        return;
      }

      // Insert the new assignment into the database
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          course_id: courseId,
          title: newAssignment.title,
          description: newAssignment.description,
          due_date: new Date(newAssignment.due_date).toISOString(),
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        throw error;
      }

      // Close the modal and reset form
      setIsCreateModalOpen(false);
      setNewAssignment({
        title: "",
        description: "",
        due_date: ""
      });
      
      // Show success toast
      toast({
        title: "Success",
        description: "Assignment created successfully",
        className: "bg-green-500 border-green-500 text-white",
        duration: 2000,
      });

      // Refresh assignments list
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assignment",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Management</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2 items-center">
              <PlusCircle size={16} />
              <span>Create Assignment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input 
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  placeholder="Assignment title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description"
                  value={newAssignment.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAssignment({...newAssignment, description: e.target.value})}
                  placeholder="Assignment description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input 
                  id="due_date"
                  type="datetime-local"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No assignments created yet.</p>
          <p className="text-sm mt-2">Create your first assignment to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Link 
              href={`/cms/${courseId}/submission/${assignment.assignment_id}`}
              key={assignment.assignment_id}
            >
              <motion.div
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{assignment.title}</h2>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="flex gap-1 items-center">
                      <FileText size={14} />
                      <span>{assignment.submissions_count} submissions</span>
                    </Badge>
                    <Badge variant={new Date() > new Date(assignment.due_date) ? "destructive" : "default"}>
                      {new Date() > new Date(assignment.due_date) ? "Overdue" : "Active"}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorSubmission; 