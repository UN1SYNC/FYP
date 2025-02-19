import React from "react";
import Onboarding from "./_components/onboarding";
import { createClient } from "@/utils/supabase/server";
import { Shell } from "@/components/shell";
import { GridPattern } from "@/components/grid-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import Image from "next/image";

const page = async () => {
  const supabase = await createClient();
  const session = await supabase.auth.getUser();
  const userId = await session?.data?.user?.id || null;

  if (!userId) {
    redirect("/");
    return null;
  }

  return (
    <Shell className="h-[calc(100vh-4rem)] max-w-screen m-auto">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className="[mask-image:radial-gradient(1024px_circle_at_left_top,white,transparent)]"
      />
      <React.Suspense fallback={<Skeleton className="size-full" />}>
        <Image src="/logo.svg" alt="Logo" width={140} height={140} className="mb-2 mx-auto" />
        <Onboarding userId={userId}/>
      </React.Suspense>
    </Shell>
  );
};

export default page;
