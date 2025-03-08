"use client";

import Loading from "@/components/ui/loading";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import MarkAttendancePage from "./teacherView";
import AttendanceDetails from "./studentView";

const AttendancePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return <Loading />;
  
  if (user.role === "instructor") {
    return <MarkAttendancePage />;
  } else if (user.role === "student") {
    return <AttendanceDetails />;
  } else {
    return <p>Access Denied</p>;
  }
};

export default AttendancePage;