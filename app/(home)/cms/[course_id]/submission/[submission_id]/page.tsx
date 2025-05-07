"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { AddSubmission } from "@/components/cms/submission/AddSubmission";
import { InstructorAssignmentView } from "@/components/cms/submission/InstructorAssignmentView";
import Loading from "@/components/ui/loading";

const SubmissionPage = ({ params }: { params: { submission_id: string, course_id: string } }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return <Loading />;
  
  if (user.role === "instructor") {
    return <InstructorAssignmentView submissionId={params.submission_id} courseId={params.course_id} />;
  } else {
    return <AddSubmission submissionId={params.submission_id} courseId={params.course_id} />;
  }
};

export default SubmissionPage; 