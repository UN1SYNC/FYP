"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { StudentSubmission } from "@/components/cms/submission/StudentSubmission";
import { InstructorSubmissionView } from "@/components/cms/submission/InstructorSubmissionView";
import Loading from "@/components/ui/loading";

export default function AssignmentPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return user.role === "student" ? (
    <StudentSubmission />
  ) : (
    <InstructorSubmissionView />
  );
} 