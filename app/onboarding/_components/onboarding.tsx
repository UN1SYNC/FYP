"use client";

import { useSearchParams } from "next/navigation";
import Welcome from "./welcome";
import { AnimatePresence } from "framer-motion";
import UniversityConfiguration from "./university";
import SystemsSelection from "./systems";
import SystemsConfiguration from "./system-config";
import CMSModules from "./modules";
import CMSModuleConfigure from "./module-config";


type OnboardingProps = {
    userId: string;
  };

const Onboarding = ({userId}: OnboardingProps) => {
    const search = useSearchParams();
    const step = search.get("step");
    const type = search.get("type");
  return (
    <AnimatePresence mode="wait">
      {!step && <Welcome />}
      {step === "configure" && type === "university" && <UniversityConfiguration />}
      {step === "select" && type === "systems" && <SystemsSelection />}
      {step === "configure" && type === "systems" && <SystemsConfiguration />}
      {step === "select" && type === "modules" && <CMSModules />}
      {step === "configure" && type === "modules" && <CMSModuleConfigure />}
    </AnimatePresence>
  )
}

export default Onboarding