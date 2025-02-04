"use client";
// import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // Adjust the path to your store file

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

export function CourseCard({ courseCardData }) {
  const [data, setData] = useState([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user); // Access the user from auth slice
  // console.log("user insdie course card: ", user);
  // GETTIG STUDENT FROM BACKEND
  // useEffect(() => {
  //   const fetchData = async () => {
  //       const { data, error } = await supabase.from("students").select("*");
  //       if (error) {
  //         console.error("Error fetching data:", error.message);
  //       } else {
  //         setData(data);
  //         console.log("Fetched data:", data);
  //       }
  //   };

  //   fetchData();
  // }, []);

  // RETURN TSX
  return (
    <div className="flex flex-wrap justify-between gap-y-4">
      {Array(4).fill(courseCardData).map((courseCardData, index) => (
        <Link
          key={index}
          href={`/cms/${courseCardData.courseTitle
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          <Card className="w-[330px] h-[160px] hover:shadow-md hover:shadow-black bg-muted/80">
            <CardHeader>
              <CardTitle>{courseCardData.courseTitle}</CardTitle>
              <CardDescription>{courseCardData.instructorName}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{courseCardData.courseDesc}</p>
              <p>Attendance: 92.0% Fall 2024</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
  
}
