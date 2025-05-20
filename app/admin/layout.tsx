"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  LogOut, 
  BarChart3, 
  Settings, 
  School,
  GraduationCap,
  User
} from "lucide-react";

import { logout } from "@/app/utils/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {useDispatch} from "react-redux"

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch()
  const handleLogout = () => {
    logout(router, toast, dispatch)
  }
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Student Registration",
      href: "/admin/student-register",
      icon: <UserPlus size={20} />,
    },
    {
      name: "Student Enrollment",
      href: "/admin/student-enroll",
      icon: <Users size={20} />,
    },
    {
      name: "Course Registration",
      href: "/admin/course-register",
      icon: <BookOpen size={20} />,
    },
    {
      name: "School Registration",
      href: "/admin/school-register",
      icon: <School size={20} />,
    },
    {
      name: "Degree Program Registration",
      href: "/admin/degree-register",
      icon: <GraduationCap size={20} />,
    },
    {
      name: "Batch Registration",
      href: "/admin/batch-register",
      icon: <Users size={20} />,
    },
    {
      name: "Section Registration",
      href: "/admin/section-register",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Course Assignment",
      href: "/admin/course-assignment",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Instructor Registration",
      href: "/admin/instructor-register",
      icon: <User size={20} />,
    },
    {
      name: "Admin Registration",
      href: "/admin/admin-register",
      icon: <Users size={20} />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ];
  
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-[rgb(23,23,23)] text-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded">
              <School className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold">UniSync Admin</span>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="mr-3" />
              Logout
            </button>
          </div>
        </div>
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #444 #232323;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: #232323;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #666;
          }
        `}</style>
      </div>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 