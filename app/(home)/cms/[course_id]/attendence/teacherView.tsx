"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Loading from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MarkAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // Mapping: student_id -> status
  const [existingAttendance, setExistingAttendance] = useState<Record<string, string>>({});
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  // New states for session creation
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [sessionCreating, setSessionCreating] = useState(false);
  // New states for recurring sessions
  const [activeTab, setActiveTab] = useState("sessions");
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState(1); // Monday is default
  const [recurringStartTime, setRecurringStartTime] = useState("");
  const [recurringEndTime, setRecurringEndTime] = useState("");
  const [recurringRoomNumber, setRecurringRoomNumber] = useState("");
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringCreating, setRecurringCreating] = useState(false);
  const [recurringSessionsList, setRecurringSessionsList] = useState<any[]>([]);
  
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);

  // Get course_id from URL (adjust if using Next.js routing parameters)
  const course_id = window.location.pathname.split("/")[2];

  // Get today's date and current time.
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().split(" ")[0];
  // Get today's day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const todayDayIndex = new Date().getDay();

  // Days of the week array for display
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  // Fetch current session and enrolled students.
  useEffect(() => {
    const fetchSessionAndStudents = async () => {
      if (!user || !user.details) return;
      const teacher_id = user.details.user_id || ""; // Add null check with default value

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
          // Check if the current time is within the recurring session's times.
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
      if (!user || !user.details) return;
      const teacher_id = user.details.user_id || ""; // Add null check with default value
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

  // Fetch recurring sessions
  useEffect(() => {
    const fetchRecurringSessions = async () => {
      if (!user || !user.details) return;
      const teacher_id = user.details.user_id || "";
      
      const { data: recurringData, error: recurringError } = await supabase
        .from("recurring_sessions")
        .select("*")
        .eq("course_id", course_id)
        .eq("teacher_id", teacher_id);
        
      if (recurringError) {
        console.error("Error fetching recurring sessions:", recurringError);
        return;
      }
      
      if (recurringData) {
        setRecurringSessionsList(recurringData);
      }
    };
    
    fetchRecurringSessions();
  }, [user, course_id, supabase]);

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

  // Create a new session
  const handleCreateSession = async () => {
    if (!user || !user.details) {
      toast({
        title: "Error",
        description: "User information not available.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    // Validate input
    if (!sessionDate || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    setSessionCreating(true);
    
    const teacher_id = user.details.user_id;
    try {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from("class_sessions")
        .insert({
          course_id: parseInt(course_id),
          teacher_id: teacher_id,
          session_date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          room_number: roomNumber || null,
        })
        .select("*")
        .single();

      if (sessionError) {
        console.error("Error creating session:", sessionError);
        toast({
          title: "Error",
          description: "Failed to create session.",
          className: "bg-red-500 border-red-500 text-white",
          duration: 1000,
        });
        setSessionCreating(false);
        return;
      }

      // If session is created for today and current time is within the session time window, set it as active
      if (
        sessionDate === today &&
        startTime <= currentTime &&
        endTime >= currentTime
      ) {
        setSession(newSession);
        // Refresh attendance data for the new session
        setExistingAttendance({});
      }

      toast({
        title: "Success",
        description: "Session created successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });

      // Close modal and reset fields
      setShowSessionModal(false);
      setSessionDate(new Date().toISOString().split("T")[0]);
      setStartTime("");
      setEndTime("");
      setRoomNumber("");
      
      // Refresh previous sessions if the created session is for a past date
      if (sessionDate < today) {
        const fetchPreviousSessions = async () => {
          if (!user?.details?.user_id) return;
          
          const now = new Date();
          const day = now.getDay();
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
          const weekStartStr = weekStart.toISOString().split("T")[0];
          
          const { data: sessionsData } = await supabase
            .from("class_sessions")
            .select("*, attendances(*)")
            .eq("course_id", course_id)
            .eq("teacher_id", teacher_id)
            .gte("session_date", weekStartStr)
            .lt("session_date", today);
            
          if (sessionsData) {
            setPreviousSessions(sessionsData);
          }
        };
        
        fetchPreviousSessions();
      }
    } catch (error) {
      console.error("Unexpected error creating session:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
    } finally {
      setSessionCreating(false);
    }
  };

  // Create a recurring session
  const handleCreateRecurringSession = async () => {
    if (!user || !user.details) {
      toast({
        title: "Error",
        description: "User information not available.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    // Validate input
    if (!recurringStartTime || !recurringEndTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return;
    }

    setRecurringCreating(true);
    
    const teacher_id = user.details.user_id;
    try {
      // Create new recurring session
      const { data: newRecurringSession, error: recurringError } = await supabase
        .from("recurring_sessions")
        .insert({
          course_id: parseInt(course_id),
          teacher_id: teacher_id,
          day_of_week: recurringDayOfWeek,
          start_time: recurringStartTime,
          end_time: recurringEndTime,
          room_number: recurringRoomNumber || null,
        })
        .select("*")
        .single();

      if (recurringError) {
        console.error("Error creating recurring session:", recurringError);
        toast({
          title: "Error",
          description: "Failed to create recurring session.",
          className: "bg-red-500 border-red-500 text-white",
          duration: 1000,
        });
        setRecurringCreating(false);
        return;
      }

      // If the created recurring session is for today and current time is within the session time window,
      // create a new class session automatically
      if (
        todayDayIndex === recurringDayOfWeek &&
        recurringStartTime <= currentTime &&
        recurringEndTime >= currentTime &&
        !session // No active session yet
      ) {
        // Auto-create a new class session for today
        const { data: newSession, error: newSessionError } = await supabase
          .from("class_sessions")
          .insert({
            course_id: parseInt(course_id),
            teacher_id: teacher_id,
            session_date: today,
            start_time: recurringStartTime,
            end_time: recurringEndTime,
            room_number: recurringRoomNumber || null,
          })
          .select("*")
          .single();

        if (!newSessionError && newSession) {
          setSession(newSession);
          setExistingAttendance({});
        }
      }

      toast({
        title: "Success",
        description: "Recurring session created successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });

      // Close modal and reset fields
      setShowRecurringModal(false);
      setRecurringStartTime("");
      setRecurringEndTime("");
      setRecurringRoomNumber("");
      
      // Refresh recurring sessions list
      const { data: recurringData } = await supabase
        .from("recurring_sessions")
        .select("*")
        .eq("course_id", course_id)
        .eq("teacher_id", teacher_id);
        
      if (recurringData) {
        setRecurringSessionsList(recurringData);
      }
    } catch (error) {
      console.error("Unexpected error creating recurring session:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
    } finally {
      setRecurringCreating(false);
    }
  };

  // Delete a recurring session
  const handleDeleteRecurringSession = async (recurringSessionId: string) => {
    try {
      const { error } = await supabase
        .from("recurring_sessions")
        .delete()
        .eq("recurring_session_id", recurringSessionId);
        
      if (error) {
        console.error("Error deleting recurring session:", error);
        toast({
          title: "Error",
          description: "Failed to delete recurring session.",
          className: "bg-red-500 border-red-500 text-white",
          duration: 1000,
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Recurring session deleted successfully.",
        className: "bg-green-500 border-green-500 text-white",
        duration: 1000,
      });
      
      // Update recurring sessions list
      setRecurringSessionsList(prev => 
        prev.filter(session => session.recurring_session_id !== recurringSessionId)
      );
    } catch (error) {
      console.error("Unexpected error deleting recurring session:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        className: "bg-red-500 border-red-500 text-white", 
        duration: 1000,
      });
    }
  };

  // Determine if there are any students left to mark attendance.
  const canSubmit = students.some((student) => !existingAttendance[student.student_id]);

  if (loading) return <Loading />;

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex border-b w-full mb-4">
          <TabsTrigger
            value="sessions"
            className={`px-4 py-2 font-medium ${
              activeTab === "sessions"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="recurring"
            className={`px-4 py-2 font-medium ${
              activeTab === "recurring"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Recurring Schedule
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="mt-4">
          {/* Session Creation Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowSessionModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create New Session
            </button>
          </div>
          
          {/* Active Session */}
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
                      <td className="px-4 py-2 border">{student?.user?.name || 'Unknown Student'}</td>
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
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
              <h2 className="text-xl font-semibold mb-2 text-yellow-700">No Active Session</h2>
              <p className="text-yellow-600">
                There is no active class session for this course at the moment. Please create a new session using the button above.
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
                    <th className="px-4 py-2 border">Time</th>
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
                        <td className="px-4 py-2 border text-center">
                          {formatTime(sess.start_time)} - {formatTime(sess.end_time)}
                        </td>
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
        </TabsContent>
        
        <TabsContent value="recurring" className="mt-4">
          {/* Recurring Session Creation Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowRecurringModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Recurring Session
            </button>
          </div>
          
          {/* Recurring Sessions List */}
          <h2 className="text-lg font-semibold mb-2">Recurring Sessions</h2>
          {recurringSessionsList.length === 0 ? (
            <p>No recurring sessions set up yet.</p>
          ) : (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Day</th>
                  <th className="px-4 py-2 border">Time</th>
                  <th className="px-4 py-2 border">Room</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringSessionsList.map((session) => (
                  <tr key={session.recurring_session_id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {daysOfWeek[session.day_of_week]}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </td>
                    <td className="px-4 py-2 border text-center">{session.room_number || "N/A"}</td>
                    <td className="px-4 py-2 border text-center">
                      <button 
                        onClick={() => handleDeleteRecurringSession(session.recurring_session_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-blue-800 mb-2">How Recurring Sessions Work</h3>
            <p className="text-blue-700">
              Recurring sessions automatically create class sessions on specified days of the week.
              When the current time falls within a recurring session's time window, a new class session
              will be created automatically, allowing you to mark attendance without having to manually
              create a session.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Session Creation Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Class Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room Number:</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={sessionCreating || !sessionDate || !startTime || !endTime}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sessionCreating ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recurring Session Creation Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Recurring Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week:</label>
                <select
                  value={recurringDayOfWeek}
                  onChange={(e) => setRecurringDayOfWeek(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Time:</label>
                <input
                  type="time"
                  value={recurringStartTime}
                  onChange={(e) => setRecurringStartTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Time:</label>
                <input
                  type="time"
                  value={recurringEndTime}
                  onChange={(e) => setRecurringEndTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room Number:</label>
                <input
                  type="text"
                  value={recurringRoomNumber}
                  onChange={(e) => setRecurringRoomNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRecurringModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecurringSession}
                disabled={recurringCreating || !recurringStartTime || !recurringEndTime}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recurringCreating ? "Creating..." : "Create Recurring Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
