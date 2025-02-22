"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { InfoIcon } from "lucide-react";

type ModuleType = {
  id: number;
  attendance: boolean;
  course_material: boolean;
  grading: boolean;
  fee_management: boolean;
  notification_system: boolean;
  project_management: boolean;
  submission: boolean;
  timetable_generation: boolean;
  university_id: number;
};

const modulesData = [
  { key: 'attendance', name: 'Attendance', url: '/attendance' },
  { key: 'course_material', name: 'Course Material', url: '/material' },
  { key: 'grading', name: 'Grading', url: '/grading' },
  { key: 'fee_management', name: 'Fee Management', url: '/fees' },
  { key: 'notification_system', name: 'Notifications', url: '/notifications' },
  { key: 'project_management', name: 'Projects', url: '/projects' },
  { key: 'submission', name: 'Submissions', url: '/submissions' },
  { key: 'timetable_generation', name: 'Timetable', url: '/timetable' }
];

// Add the User type at the top of your file
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
};

const Topbar = () => {
  const [modules, setModules] = useState<ModuleType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Get the current URL and format it dynamically
  const currentUrl = typeof window !== 'undefined' 
    ? `/${window.location.pathname.split("/").slice(1, 3).join("/")}` 
    : '';

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUser(data.user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      if (!user) return;

      try {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('university_id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;
        if (!studentData?.university_id) {
          setError("No university found for this student");
          return;
        }

        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('university_id', studentData.university_id)
          .single();

        if (modulesError) throw modulesError;
        
        if (modulesData) {
          setModules(modulesData);
        }

      } catch (error: any) {
        console.error('Error fetching modules:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchModules();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!modules) return <div>No modules found</div>;

  return (
    <section className="py-4">
      <div className="container">
        <nav className="flex">
          <div className="flex items-center flex-wrap gap-2">
            {/* <Button className="bg-black/90 text-white hover:bg-black/60">
              <Link href={`${currentUrl}`}><InfoIcon size={24} /></Link>
            </Button> */}
            {modulesData.map((module) => {
              // Only render the button if the corresponding module is enabled (true)
              if (modules[module.key as keyof ModuleType]) {
                return (
                  <Button 
                    key={module.key} 
                    className="bg-black/90 text-white hover:bg-black/60"
                  >
                    <Link href={`${currentUrl}${module.url}`}>
                      {module.name}
                    </Link>
                  </Button>
                );
              }
              return null;
            })}
          </div>
        </nav>
      </div>
    </section>
  );
};

export default Topbar;
