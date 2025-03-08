import { CourseRegisterForm } from "@/components/admin/course-register/CourseRegisterForm";

export default function CourseEnrollPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground">
              Fill in the details below to create a new course.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <CourseRegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
