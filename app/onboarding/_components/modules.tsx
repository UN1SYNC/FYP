"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const cmsModules = [
  {
    id: "lms",
    name: "Learning Management System",
    description: "Facilitate online learning, assessments, and course management.",
  },
  {
    id: "qalam",
    name: "Student Management System",
    description: "Track student enrollment, attendance, and academic records.",
  },
  {
    id: "pms",
    name: "Project Management System",
    description: "Manage student projects and collaboration between teams.",
  },
  {
    id: "ams",
    name: "Attendance Management System",
    description: "Automate attendance tracking and generate reports effortlessly.",
  },
];

const CMSModules = () => {
  const router = useRouter();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSaveConfiguration = () => {
    if (selectedModules.length === 0) {
      alert("Please select at least one module to configure.");
      return;
    }
    localStorage.setItem("cmsModules", JSON.stringify(selectedModules));
    router.push("/onboarding?step=configure&type=modules"); // Redirect back to the systems configuration page
  };

  return (
    <section className="container mx-auto w-2/3 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Configure CMS Modules</h1>
        <p className="text-muted-foreground lg:text-lg">
          Select the modules you want to include in your Campus Management System.
        </p>
      </motion.div>
      <motion.div
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {cmsModules.map((module) => (
          <motion.div
            key={module.id}
            className={`relative border rounded-lg p-6 shadow-lg transition ${
              selectedModules.includes(module.id) ? "border-blue-500" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleToggleModule(module.id)}
          >
          <label className="relative block cursor-pointer">
            <input
              type="checkbox"
              checked={selectedModules.includes(module.id)}
              onChange={() => handleToggleModule(module.id)}
              className="absolute -top-4 -left-4 h-5 w-5 accent-blue-500"
            />
            <h2 className="text-xl font-semibold mb-2">{module.name}</h2>
            <p className="text-muted-foreground">{module.description}</p>
          </label>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={handleSaveConfiguration} className="px-8 py-3">
          Save Configuration
        </Button>
      </motion.div>
    </section>
  );
};

export default CMSModules;
