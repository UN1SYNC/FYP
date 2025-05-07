"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Submission from "@/components/cms/submission/Submission";
import InstructorSubmission from "@/components/cms/submission/InstructorSubmission";
import Loading from "@/components/ui/loading";

const SubmissionPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return <Loading />;
  
  if (user.role === "instructor") {
    return <InstructorSubmission />;
  } else {
    return <Submission />;
  }
};

export default SubmissionPage;
