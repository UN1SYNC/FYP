"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";

const Submission = () => {
  const params = useParams();
  const courseId = params.course_id;

  // Sample data - replace with dynamic data later
  const submissions = [
    {
      id: "assignment-1",
      title: "Assignment 1",
      dueDate: "2024-03-20",
      status: "Not Submitted",
      totalMarks: "100",
      description: "Write a 1000-word essay on modern software architecture patterns.",
    },
    {
      id: "lab-5",
      title: "Lab 5",
      dueDate: "2024-03-25",
      status: "Not Submitted",
      totalMarks: "50",
      description: "Implement a basic REST API using Node.js and Express.",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Link 
            href={`/cms/${courseId}/submission/${submission.id}`}
            key={submission.id}
          >
            <motion.div
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">{submission.title}</h2>
                  <p className="text-sm text-gray-600">Due: {submission.dueDate}</p>
                  <p className="text-sm text-gray-600">Total Marks: {submission.totalMarks}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={submission.status === "Submitted" ? "success" : "warning"}>
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Submission;
