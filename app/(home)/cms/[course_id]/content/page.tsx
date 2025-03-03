import Content from "@/components/cms/content/Content";

export default function CourseMaterial({ params }: { params: { course_id: string } }) {
  return <Content course_id={params.course_id} />;
}