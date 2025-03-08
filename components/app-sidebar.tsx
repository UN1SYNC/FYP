"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Globe2Icon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import Image from "next/image";
import Link from "next/link";
import {useSelector} from "react-redux"
import { RootState } from "@/lib/store";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const userData = useSelector((state: RootState)=>state.auth.user)
  console.log("userData:", userData)
// This is sample data.
const data = {
  user: {
    name: userData?.name || "User",
    email: userData?.email || "user@example.com",
    avatar: "./logo1.svg",
  },
  navMain: [
    {
      title: "LMS",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Attendence",
          url: "#",
        },
        {
          title: "Results",
          url: "#",
        },
        {
          title: "Course Content",
          url: "#",
        },
      ],
    },
    {
      title: "Admin",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Student Register",
          url: "/admin/student-register",
        },
        {
          title: "Student Enroll",
          url: "/admin/student-enroll",
        },
        {
          title: "Course Register",
          url: "/admin/course-register",
        },
        {
          title: "Professor Register",
          url: "#",
        },
      ],
    },
  ]
};

  // RETURN TSX
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard"><Image src="/logo1.svg" alt="Logo" width={40} height={40} /></Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
