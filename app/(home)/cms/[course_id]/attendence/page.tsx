"use client";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/loading";

const AttendanceDetails = () => {
  const [selectedTab, setSelectedTab] = useState("lecture");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const course_id = window.location.pathname.split("/")[2];
  const [course, setCourse] = useState<any>();
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        // Fetch student_id based on user_id
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("student_id")
          .eq("user_id", user.id)
          .single();

        if (studentError || !studentData) {
          console.error("Error fetching student_id:", studentError);
          setLoading(false);
          return;
        }

        setStudentId(studentData.student_id);

        // Fetch attendance using student_id
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendances")
          .select("*")
          .eq("student_id", studentData.student_id)
          .eq("course_id", course_id);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
          setLoading(false);
          return;
        }

        setAttendanceData(attendance || []);
        setPresentCount(attendance.filter((row) => row.status === "present").length);
        setAbsentCount(attendance.filter((row) => row.status === "absent").length);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("course_id", course_id)
          .single();

        if (courseError || !courseData) {
          console.error("Error fetching course:", courseError);
          return;
        }

        console.log("Course data:", courseData);

        setCourse(courseData);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };
  
    fetchCourse();
  }
  , [course_id]);

  useEffect(() => {
    console.log("Updated attendanceData:", attendanceData);
  }, [attendanceData]);

  if (loading) {
      return <Loading />; // Show loading component while data is being fetched
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="flex border-b">
          <TabsTrigger
            value="lecture"
            className={`px-4 py-2 font-medium ${
              selectedTab === "lecture"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            LECTURE
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className={`px-4 py-2 font-medium ${
              selectedTab === "lab"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            LAB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lecture" className="mt-4">
          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="font-semibold">Course:</p>
              <p>{course?.title}</p>
            </div>
            <div>
              <p className="font-semibold">Academic Term:</p>
              <p>Fall 2024</p>
            </div>
            <div>
              <p className="font-semibold">Course Code:</p>
              <p>{course?.course_code}</p>
            </div>
            <div>
              <p className="font-semibold">Attendance Percentage:</p>
              <p>{attendanceData.length>0 ? presentCount*100/attendanceData.length : 0} %</p>
            </div>
            <div>
              <p className="font-semibold">Number of classes Conducted:</p>
              <p>{attendanceData.length}</p>
            </div>
            <div>
              <p className="font-semibold">Number of classes Attended:</p>
              <p>{presentCount}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Sr. no</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Fine</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((row, index) => (
                    <tr key={row.attendance_id} className="odd:bg-white even:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{index + 1}</td>
                      <td className="px-4 py-2 border text-center">{row.date}</td>
                      <td
                        className={`px-4 py-2 border text-center ${
                          row.status === "present" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {row.status}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {row.fine || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="lab" className="mt-4">
          <p>Lab details will go here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceDetails;
