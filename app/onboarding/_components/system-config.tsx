"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const systemsData = [
  {
    id: "cms",
    name: "Campus Management System",
    description: "Manage student enrollment, attendance, and academic schedules efficiently.",
  },
  {
    id: "hms",
    name: "Hostel Management System",
    description: "Handle hostel allocations and student accommodations seamlessly.",
  },
  {
    id: "lms",
    name: "Library Management System",
    description: "Organize library resources, lending, and digital archives effectively.",
  },
  {
    id: "sms",
    name: "Sports Management System",
    description: "Coordinate sports events, facilities, and student participation.",
  },
];

const SystemsConfiguration = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [configurationStatus, setConfigurationStatus] = useState<Record<string, boolean>>({});

  // Simulate fetching selected systems from previous page or storage
  useEffect(() => {
    const storedSelectedSystems = JSON.parse(localStorage.getItem("selectedSystems") || "[]");
    setSelectedSystems(storedSelectedSystems);

    // Initialize configuration status
    const initialStatus = storedSelectedSystems.reduce((acc: Record<string, boolean>, systemId: string) => {
      acc[systemId] = false; // All start as "Not Configured"
      return acc;
    }, {});
    setConfigurationStatus(initialStatus);
  }, []);

  const handleConfigure = (systemId: string) => {
    router.push(`/onboarding?step=select&type=modules`);
    // setConfigurationStatus((prevStatus) => ({
    //   ...prevStatus,
    //   [systemId]: true, // Mark the system as "Configured"
    // }));
  };

  const handleContinue = () => {
    const allConfigured = Object.values(configurationStatus).every((status) => status);
    if (!allConfigured) {
        toast({
        title: "Configuration Incomplete",
        description: "Please configure all selected systems to continue.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
        });
      return;
    }
    router.push("/dashboard"); // Redirect to the dashboard or next step
  };

  return (
    <section className="container mx-auto w-2/3 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Configure Selected Systems</h1>
        <p className="text-muted-foreground lg:text-lg">
          Complete the configuration for each selected system to continue.
        </p>
      </motion.div>
      <motion.div
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {selectedSystems.map((systemId) => {
          const system = systemsData.find((sys) => sys.id === systemId);
          if (!system) return null;

          return (
            <motion.div
              key={system.id}
              className="relative border rounded-lg p-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-xl font-semibold mb-2">{system.name}</h2>
              <p className="text-muted-foreground mb-4">{system.description}</p>
              <Badge
                variant={configurationStatus[system.id] ? "success" : "destructive"}
                className="mb-4"
              >
                {configurationStatus[system.id] ? "Configured" : "Not Configured"}
              </Badge>
              <Button
                onClick={() => handleConfigure(system.id)}
                disabled={configurationStatus[system.id]}
                className="w-full"
              >
                {configurationStatus[system.id] ? "Configured" : "Configure"}
              </Button>
            </motion.div>
          );
        })}
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

export default SystemsConfiguration;
