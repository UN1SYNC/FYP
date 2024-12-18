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
import { useSelector } from 'react-redux';
import { RootState } from '../store'; // Adjust the path to your store file

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

export function CourseCard() {
  const [data, setData] = useState([]);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user); // Access the user from auth slice
  console.log("user insdie course card: ", user)
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

  useEffect(() => {
    const fetchData = async () => {
        const { data, error } = await supabase.from("students").select("student_id").eq("user_id", user.id);;
        if (error) {
          console.error("Error fetching data:", error.message);
        } else {
          setData(data);
          console.log("Fetched data:", data);
        }
    };

    fetchData();
  }, []);

  // RETURN TSX
  return (
    <>
      <Link href="/dashboard">
        <Card className="w-[350px] h-[160px] hover:shadow-md hover:shadow-black">
          <CardHeader>
            <CardTitle>Theory Of Automata & Formal Lang</CardTitle>
            <CardDescription>Yusra Arshad</CardDescription>
          </CardHeader>
          <CardContent>
            <p>CS-352 Credits: 3.0 Active Class</p>
            <p>Attendance: 92.0% Fall 2024</p>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
      </CardFooter> */}
        </Card>
      </Link>

      <Link href="/dashboard">
        <Card className="w-[350px] h-[160px] hover:shadow-md hover:shadow-black">
          <CardHeader>
            <CardTitle>Theory Of Automata & Formal Lang</CardTitle>
            <CardDescription>Yusra Arshad</CardDescription>
          </CardHeader>
          <CardContent>
            <p>CS-352 Credits: 3.0 Active Class</p>
            <p>Attendance: 92.0% Fall 2024</p>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
  </CardFooter> */}
        </Card>
      </Link>
    </>
  );
}
