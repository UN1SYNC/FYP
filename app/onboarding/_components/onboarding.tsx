"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Welcome from "./welcome";
import { AnimatePresence } from "framer-motion";
import UniversityConfiguration from "./university";
import SystemsSelection from "./systems";
import SystemsConfiguration from "./system-config";
import CMSModules from "./modules";
import CMSModuleConfigure from "./module-config";
import { createClient } from "@/utils/supabase/client";
import { Progress } from "@/components/ui/progress";

type OnboardingProps = {
  userId: string;
};

const Onboarding = ({ userId }: OnboardingProps) => {
  const search = useSearchParams();
  const router = useRouter();
  const step = search.get("step");
  const type = search.get("type");
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Define the onboarding steps for progress calculation
  const steps = [
    { step: null, type: null }, // Welcome
    { step: "configure", type: "university" }, // University Configuration
    { step: "select", type: "systems" }, // Systems Selection
    { step: "configure", type: "systems" }, // Systems Configuration
    { step: "select", type: "modules" }, // Modules Selection
    { step: "configure", type: "modules" }, // Module Configuration
  ];

  // Calculate current progress
  useEffect(() => {
    const currentStepIndex = steps.findIndex(
      (s) => s.step === step && s.type === type
    );
    if (currentStepIndex === -1) {
      setProgress(0); // Welcome page
    } else {
      setProgress(((currentStepIndex + 1) / steps.length) * 100);
    }
  }, [step, type]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: userData, error } = await supabase.auth.getUser();
        
        if (error || !userData.user) {
          console.error("Error fetching user data:", error);
          router.push("/login");
          return;
        }

        // Get university data if user is an admin
        const { data: adminData } = await supabase
          .from("admins")
          .select("*, university(*)")
          .eq("user_id", userId)
          .single();

        setUserData({ user: userData.user, admin: adminData });
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, supabase, router]);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!userData?.admin?.university) return;
      
      // Check if university has modules configured
      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("university_id", userData.admin.university.id)
        .single();
      
      // If modules are configured and user is on welcome page, redirect to dashboard
      if (modulesData && !step && !type) {
        router.push("/dashboard");
      }
    };
    
    if (userData) {
      checkOnboardingStatus();
    }
  }, [userData, step, type, router, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-64 mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-muted-foreground">Loading your onboarding experience...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center mt-2">
          Step {progress === 0 ? 1 : Math.round((progress / 100) * steps.length)} of {steps.length}
        </p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!step && <Welcome userId={userId} userData={userData} />}
        {step === "configure" && type === "university" && <UniversityConfiguration userId={userId} userData={userData} />}
        {step === "select" && type === "systems" && <SystemsSelection userId={userId} userData={userData} />}
        {step === "configure" && type === "systems" && <SystemsConfiguration userId={userId} userData={userData} />}
        {step === "select" && type === "modules" && <CMSModules userId={userId} userData={userData} />}
        {step === "configure" && type === "modules" && <CMSModuleConfigure userId={userId} userData={userData} />}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;