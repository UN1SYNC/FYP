"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Loading from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";

const MarkAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // Mapping: student_id -> status
  const [existingAttendance, setExistingAttendance] = useState<Record<string, string>>({});
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);

  // Get course_id from URL (adjust if using Next.js routing parameters)
  const course_id = window.location.pathname.split("/")[2];

  // Get today's date and current time.
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().split(" ")[0];
  // Get today's day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const todayDayIndex = new Date().getDay();

  // Fetch current session and enrolled students.
  useEffect(() => {
    const fetchSessionAndStudents = async () => {
      if (!user) return;
      const teacher_id = user.details.user_id; // Assuming teacher's id is stored here

      // 1. Try to fetch an active class session for today.
      let { data: sessionData, error: sessionError } = await supabase
        .from("class_sessions")
        .select("*")
        .eq("course_id", course_id)
        .eq("teacher_id", teacher_id)
        .eq("session_date", today)
        // Ensure currentTime falls between start_time and end_time.
        .lte("start_time", currentTime)
        .gte("end_time", currentTime);

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setLoading(false);
        return;
      }

      // If no session exists, check for a matching recurring session.
      if (!sessionData || sessionData.length === 0) {
        const { data: recurringData, error: recurringError } = await supabase
          .from("recurring_sessions")
          .select("*")
          .eq("course_id", course_id)
          .eq("teacher_id", teacher_id)
          .eq("day_of_week", todayDayIndex);

        if (recurringError) {
          console.error("Error fetching recurring session:", recurringError);
          setLoading(false);
          return;
        }

        if (recurringData && recurringData.length > 0) {
          // Assume one recurring session per day per course.
          const recurringSession = recurringData[0];
          console.log("Recurring session found:", recurringSession);
          // Check if the current time is within the recurring session’s times.
          if (
            currentTime >= recurringSession.start_time &&
            currentTime <= recurringSession.end_time
          ) {
            // Auto-create a new class session for today.
            console.log("Creating new session for today...");
            const { data: newSession, error: newSessionError } = await supabase
              .from("class_sessions")
              .insert({
                course_id,
                teacher_id: teacher_id,
                session_date: today,
                start_time: recurringSession.start_time,
                end_time: recurringSession.end_time,
                room_number: recurringSession.room_number,
              })
              .select("*")
              .single();

            if (newSessionError) {
              console.error("Error creating session:", newSessionError);
              setLoading(false);
              return;
            }

            setSession(newSession);
          } else {
            // No active session: current time is outside the recurring time window.
            setSession(null);
          }
        } else {
          // No recurring session is defined for today.
          setSession(null);
        }
      } else {
        // An active session exists.
        setSession(sessionData[0]);
      }

      // 2. Fetch enrolled students for the course.
      // We are joining with the users table to get each student's name.
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select(`
          *,
          user:users (name)
        `);

      if (studentError) {
        console.error("Error fetching students:", studentError);
        setLoading(false);
        return;
      }

      if (studentData) {
        setStudents(studentData);
      }

      setLoading(false);
    };

    fetchSessionAndStudents();
  }, [user, course_id, today, currentTime, todayDayIndex, supabase]);

  // Fetch existing attendance records for the active session.
  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!session) return;
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendances")
        .select("*")
        .eq("session_id", session.session_id);

      if (attendanceError) {
        console.error("Error fetching existing attendance:", attendanceError);
        return;
      }

      if (attendanceData) {
        const attendanceMap: Record<string, string> = {};
        attendanceData.forEach((record: any) => {
          attendanceMap[record.student_id] = record.status;
        });
        setExistingAttendance(attendanceMap);
      }
    };

    fetchExistingAttendance();
  }, [session, supabase]);

  // Fetch previous sessions for the current week (excluding today)
  useEffect(() => {
    const fetchPreviousSessions = async () => {
      if (!user) return;
      const teacher_id = user.details.user_id;
      const now = new Date();
      const day = now.getDay(); // 0 for Sunday
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("class_sessions")
        // Include join to fetch attendance for summary
        .select("*, attendances(*)")
        .eq("course_id", course_id)
        .eq("teacher_id", teacher_id)
        .gte("session_date", weekStartStr)
        .lt("session_date", today); // previous sessions only

      if (sessionsError) {
        console.error("Error fetching previous sessions:", sessionsError);
        return;
      }
      console.log("Previous sessions:", sessionsData);
      setPreviousSessions(sessionsData || []);
    };

    fetchPreviousSessions();
  }, [user, course_id, today, supabase]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "No active session found.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }
    // Build attendance records only for students who have not been marked already.
    const attendanceRecords = students
      .filter((student) => !existingAttendance[student.student_id])
      .map((student) => ({
        session_id: session.session_id,
        student_id: student.student_id,
        course_id: course_id,
        status: attendance[student.student_id] || "absent",
        date: today,
      }));

    if (attendanceRecords.length === 0) {
      toast({
        title: "Error",
        description: "No new attendance records to submit.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    const { data, error } = await supabase
      .from("attendances")
      .insert(attendanceRecords);

    if (error) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to submit attendance.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
    } else {
      toast({
        title: "Success",
        description: "Attendance submitted successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });
      // Update the existingAttendance state to reflect the new records.
      setExistingAttendance((prev) => {
        const updated = { ...prev };
        attendanceRecords.forEach((record) => {
          updated[record.student_id] = record.status;
        });
        return updated;
      });
    }
  };

  // Determine if there are any students left to mark attendance.
  const canSubmit = students.some((student) => !existingAttendance[student.student_id]);

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {session ? (
        <>
          <h1 className="text-xl font-semibold mb-4">
            Mark Attendance for {session.session_date} in Room {session.room_number}
          </h1>
          <table className="min-w-full border border-gray-300 mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Sr. no</th>
                <th className="px-4 py-2 border">Student Name</th>
                <th className="px-4 py-2 border">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border">{student.user.name}</td>
                  <td className="px-4 py-2 border text-center">
                    {existingAttendance[student.student_id] ? (
                      <span>
                        Marked: {existingAttendance[student.student_id].toUpperCase()}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          handleAttendanceChange(student.student_id, e.target.value)
                        }
                        value={attendance[student.student_id] || "absent"}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Only show the Submit button if there are unmarked students */}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit Attendance
            </button>
          )}
        </>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">No Active Session</h2>
          <p>
            There is no active class session for this course at the moment. Please check your schedule.
          </p>
        </div>
      )}

      {/* Previous Sessions Box */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Previous Sessions (This Week)</h2>
        {previousSessions.length === 0 ? (
          <p>No previous sessions found for this week.</p>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Sr. No.</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Room</th>
                <th className="px-4 py-2 border">Present</th>
                <th className="px-4 py-2 border">Absent</th>
              </tr>
            </thead>
            <tbody>
              {previousSessions.map((sess, idx) => {
                // Calculate attendance counts from the joined attendances
                const presentCount = sess.attendances
                  ? sess.attendances.filter((att: any) => att.status === "present").length
                  : 0;
                const absentCount = sess.attendances
                  ? sess.attendances.filter((att: any) => att.status === "absent").length
                  : 0;
                return (
                  <tr key={sess.session_id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border text-center">{sess.session_date}</td>
                    <td className="px-4 py-2 border text-center">{sess.room_number}</td>
                    <td className="px-4 py-2 border text-center">{presentCount}</td>
                    <td className="px-4 py-2 border text-center">{absentCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MarkAttendancePage;
