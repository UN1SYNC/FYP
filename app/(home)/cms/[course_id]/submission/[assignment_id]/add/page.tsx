"use client";

import { AddSubmission } from "@/components/cms/submission/AddSubmission";

const AddSubmissionPage = ({ params }: { params: { assignment_id: string, course_id: string } }) => {
  return <AddSubmission assignmentId={params.assignment_id} courseId={params.course_id} />;
};

export default AddSubmissionPage; 