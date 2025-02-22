"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const systems = [
  {
    id: "cms",
    name: "Campus Management System",
    description:
      "Streamline your campus operations with modules for student enrollment, attendance, and academic scheduling.",
  },
  {
    id: "hms",
    name: "Hostel Management System",
    description:
      "Efficiently manage hostel allocations, room assignments, and student accommodations.",
  },
  {
    id: "lms",
    name: "Library Management System",
    description:
      "Organize and track library assets, lending processes, and digital resources seamlessly.",
  },
  {
    id: "sms",
    name: "Sports Management System",
    description:
      "Coordinate sports facilities, events, and student participation with ease.",
  },
];

const SystemsSelection = () => {
    const router = useRouter();
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  
    const toggleSelection = (id: string) => {
      setSelectedSystems((prev) =>
        prev.includes(id)
          ? prev.filter((systemId) => systemId !== id)
          : [...prev, id]
      );
    };
  
    const handleContinue = () => {
      if (selectedSystems.length === 0) {
        alert("Please select at least one system.");
        return;
      }
      console.log("Selected Systems:", selectedSystems); // Replace with API call or state update
      localStorage.setItem("selectedSystems", JSON.stringify(selectedSystems));
      router.push("/onboarding?step=configure&type=systems");
    };
  
    return (
      <section className="container mx-auto w-2/3 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Select Systems for Your University</h1>
          <p className="text-muted-foreground lg:text-lg">
            Choose the systems you want to configure for your university's management.
          </p>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {systems.map((system) => (
            <motion.div
              key={system.id}
              className={`relative border rounded-lg p-6 shadow-lg transition-transform ${
                selectedSystems.includes(system.id)
                  ? "border-blue-500 scale-105"
                  : "border-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <label className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSystems.includes(system.id)}
                  onChange={() => toggleSelection(system.id)}
                  className="absolute -top-2 -left-2 h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-200"
                />
                <div className="pl-8">
                  <h2 className="text-xl font-semibold mb-2">{system.name}</h2>
                  <p className="text-muted-foreground">{system.description}</p>
                </div>
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
          <Button onClick={handleContinue} className="px-8 py-3">
            Continue
          </Button>
        </motion.div>
      </section>
    );
  };
  
  export default SystemsSelection;
