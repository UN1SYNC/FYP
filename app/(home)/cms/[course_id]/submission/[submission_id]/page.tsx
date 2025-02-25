import { AddSubmission } from "@/components/cms/submission/AddSubmission";

const SubmissionPage = async ({ params }: { params: { submission_id: string, course_id: string } }) => {
  // Here you can fetch the specific submission details using the submission_id
  // const submissionDetails = await fetchSubmissionDetails(params.submission_id);
  
  return <AddSubmission submissionId={params.submission_id} courseId={params.course_id} />;
};

export default SubmissionPage; 