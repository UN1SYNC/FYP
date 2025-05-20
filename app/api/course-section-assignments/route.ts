import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { section_id, course_id } = await request.json();

    // Check if the assignment already exists
    const { data: existingAssignment } = await supabase
      .from("course_section_assignments")
      .select("*")
      .eq("section_id", section_id)
      .eq("course_id", course_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { error: "This course is already assigned to this section" },
        { status: 400 }
      );
    }

    // Create new assignment
    const { data, error } = await supabase
      .from("course_section_assignments")
      .insert([
        {
          section_id,
          course_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating course section assignment:", error);
      return NextResponse.json(
        { error: "Failed to create course section assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in course section assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 