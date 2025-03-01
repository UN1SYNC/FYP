"use client";

import { useState, useEffect } from "react";
import WeeksList from "./WeeksList";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Week } from "./types";

export default function Content({ course_id }: { course_id: string }) {
  const [courseInfo, setCourseInfo] = useState<{ weeks: Week[] }>({
    weeks: []
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', course_id)
        .order('week_no');

      if (error) {
        console.error('Error fetching course data:', error);
        return;
      }

      // Group materials by week
      const weekMap = data.reduce((acc: { [key: string]: Week }, item) => {
        const weekKey = `Week ${item.week_no}`;
        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: weekKey,
            topic: item.topic_name,
            materials: []
          };
        }
        // Since path is now an array, we spread it into materials array
        if (item.path && Array.isArray(item.path)) {
          acc[weekKey].materials.push(...item.path);
        }
        return acc;
      }, {});

      setCourseInfo({
        weeks: Object.values(weekMap)
      });
    };

    fetchCourseData();
  }, [course_id]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Content of course</h2>
        <WeeksList weeks={courseInfo.weeks} />
      </div>
    </div>
  );
} 