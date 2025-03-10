import { LoginForm } from "@/components/login-form"
import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Shell } from "@/components/shell";
import { GridPattern } from "@/components/grid-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function Page() {
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
        <div className="w-full max-w-lg mx-auto bg-white z-10">
          <LoginForm/>
        </div>
      </React.Suspense>
    </Shell>
  )
}
