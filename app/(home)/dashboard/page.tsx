import { AppSidebar } from "@/components/app-sidebar";
import { CourseCard } from "@/components/dashboard/course-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/server";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ProfileView from "@/components/dashboard/profile-view";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = await data.user;
  // console.log("user: ", data)
  // FETCH COURSE CARD DATA
  const fetchCourseCardData = async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    // Fetch student_id from the students table
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("student_id")
      .eq("user_id", user.id);

    if (studentError) {
      console.error("Error fetching student data:", studentError.message);
      return;
    }

    if (!studentData || studentData.length === 0) {
      console.log("No student found for this user.");
      return;
    }

    const studentId = studentData[0].student_id; // Get student_id from the first result

    // Now fetch course_id from the enrollments table using student_id
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error(
        "Error fetching enrollment data:",
        enrollmentsError.message
      );
    } else if (enrollmentsData && enrollmentsData.length > 0) {
      // Assuming you want the first course_id
    } else {
      console.log("No enrollment found for this student.");
    }

    // Now fetch course_id from the enrollments table using student_id
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("course_id", enrollmentsData[0].course_id);

    if (courseError) {
      console.error("Error fetching course data:", courseError.message);
    } else if (courseData && courseData.length > 0) {
      // console.log("courseData: ", courseData);
    } else {
      console.log("No course found for this student.");
    }

    // Now fetch course_id from the enrollments table using student_id
    const { data: facultyData, error: facultyError } = await supabase
      .from("instructors")
      .select("*")
      .eq("instructor_id", courseData[0].faculty_id);

    if (facultyError) {
      console.error("Error fetching factulty data:", facultyError.message);
    } else if (facultyData && facultyData.length > 0) {
      // console.log("facultyData: ", facultyData);
    } else {
      console.log("No faculty found for this student.");
    }

    return {
      courseTitle: courseData[0].title,
      courseDesc: courseData[0].description,
      instructorName: "Aslam Shahzad",
    };
  };

  const courseCardData = await fetchCourseCardData();
  // console.log("courseCardData: ", courseCardData)

  // RETURN TSX
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <ProfileView />
      <CourseCard courseCardData={courseCardData} />
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/80" >
            </div>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div> */}
    </div>
  );
}
