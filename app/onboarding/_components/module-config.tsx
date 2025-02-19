"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const cmsSubModules = [
  {
    id: "course_material",
    name: "Course Management",
    description: "Organize, update, and track courses with ease.",
  },
  {
    id: "exam",
    name: "Exam Management",
    description: "Streamline exam scheduling, grading, and results publication.",
  },
  {
    id: "facultyManagement",
    name: "Faculty Management",
    description: "Manage faculty profiles, schedules, and assignments effectively.",
  },
  {
    id: "studentPortal",
    name: "Student Portal",
    description: "Provide students access to academic resources and records.",
  },
    {
        id: "financeManagement",
        name: "Finance Management",
        description: "Track fees, scholarships, and financial transactions seamlessly.",
    },
    {
        id: "attendance",
        name: "Attendance Management",
        description: "Automate attendance tracking and generate reports effortlessly.",
    },
    {
        id: "grading",
        name: "Gradebook",
        description: "Record, calculate, and manage student grades efficiently.",
    },
    {
        id: "timetable_generation",
        name: "Timetable Management",
        description: "Create, update, and share academic schedules with students and faculty.",
    },
];

const CMSModuleConfigure = () => {
  const router = useRouter();
  const supabase = createClient();
  const [selectedSubModules, setSelectedSubModules] = useState<string[]>([]);

  const handleToggleSubModule = (subModuleId: string) => {
    setSelectedSubModules((prev) =>
      prev.includes(subModuleId)
        ? prev.filter((id) => id !== subModuleId)
        : [...prev, subModuleId]
    );
  };

  const handleSaveSubModuleConfiguration = async () => {
    if (selectedSubModules.length === 0) {
      alert("Please select at least one submodule to configure.");
      return;
    }
    localStorage.setItem("cmsSubModules", JSON.stringify(selectedSubModules));
    const userData = await supabase.auth.getUser();
    const userId = userData?.data?.user?.id;
    console.log(typeof userId);
    if (userData?.data?.user?.role === "authenticated") {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", userId);

      if (data && data.length > 0) {
        const universityId = data[0].university_id;
        console.log(universityId);
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("university_id", universityId);

        if (modulesData && modulesData.length > 0) {
          const modules = modulesData[0];
          const moduleList = Object.keys(modules).filter(
            (key) =>
              key !== "id" && key !== "created_at" && key !== "university_id"
          );
          const updatedModules = moduleList.reduce((acc:any, key) => {
            if (selectedSubModules.includes(key)) {
              acc[key] = true;
            } else {
              acc[key] = false;
            }
            return acc;
          }, {});
          await supabase.from("modules").update(updatedModules).eq("id", modules.id);
        }
      }
    }
    router.push("/onboarding?step=configure&type=systems"); // Redirect back to systems configuration
  };

  return (
    <section className="container mx-auto w-2/3 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Configure CMS Submodules</h1>
        <p className="text-muted-foreground lg:text-lg">
          Select the submodules you want to include in the Campus Management System module.
        </p>
      </motion.div>
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {cmsSubModules.map((subModule) => (
          <motion.div
            key={subModule.id}
            className={`relative border rounded-lg p-6 shadow-lg transition cursor-pointer ${
              selectedSubModules.includes(subModule.id) ? "border-green-500" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleToggleSubModule(subModule.id)}
          >
            <input
              type="checkbox"
              checked={selectedSubModules.includes(subModule.id)}
              onChange={() => handleToggleSubModule(subModule.id)}
              className="absolute top-1 left-1 h-5 w-5 accent-green-500"
            />
            <h2 className="text-xl font-semibold mb-2">{subModule.name}</h2>
            <p className="text-muted-foreground">{subModule.description}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={handleSaveSubModuleConfiguration} className="px-8 py-3">
          Save Configuration
        </Button>
      </motion.div>
    </section>
  );
};

export default CMSModuleConfigure;
