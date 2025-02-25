"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "../../../utils/supabase/supabase";
import { InfoIcon } from "lucide-react";

const modulesData = [
  { key: "course_material", name: "Course Content", url: "/content" },
  { key: "attendance", name: "Attendance", url: "/attendence" },
  { key: "grading", name: "Grade Book", url: "/grades" },
  { key: "submission", name: "Submission", url: "/submission" },
  { key: "project_management", name: "Project Management", url: "/project-management" },
  { key: "notification_system", name: "Notifications", url: "/notifications" },
  { key: "fee_management", name: "Fee Management", url: "/fee-management" },
  { key: "timetable_generation", name: "Timetable", url: "/timetable" },
];

const Topbar = () => {
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Get the current URL and format it dynamically
  const currentUrl = `/${window.location.pathname.split("/").slice(1, 3).join("/")}`;

  useEffect(() => {
    const fetchModules = async () => {
      if (!supabase) {
        setError("Supabase client is not initialized.");
        return;
      }

      let { data, error } = await supabase.from("modules").select("*");
      if (error) {
        setError(error.message);
      } else if (data && data.length > 0) {
        setModules(data[0]); // Use the first university's data
      }
    };

    fetchModules();
  }, []);

  return (
    <section className="py-4">
      <div className="container">
        <nav className="flex">
          <div className="flex items-center flex-wrap gap-2">
            <Button className="bg-black/90 text-white hover:bg-black/60">
              <Link href={`${currentUrl}`}><InfoIcon size={24} /></Link>
            </Button>
            {modulesData
              .filter((module) => modules[module.key]) // Show only enabled modules
              .map((module) => (
                <Button key={module.key} className="bg-black/90 text-white hover:bg-black/60">
                  <Link href={`${currentUrl}${module.url}`}>{module.name}</Link>
                </Button>
              ))}
          </div>
        </nav>
      </div>
    </section>
  );
};

export default Topbar;