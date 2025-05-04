"use client";
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  School, 
  GraduationCap, 
  ArrowUp, 
  ArrowDown,
  Plus,
  User 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  // Dashboard stats - in a real app, you'd fetch these from your API/database
  const stats = [
    {
      title: "Total Students",
      value: 2458,
      change: 12.5,
      increase: true,
      icon: <Users className="h-8 w-8 text-black" />,
    },
    {
      title: "Instructors",
      value: 126,
      change: 5.3,
      increase: true,
      icon: <User className="h-8 w-8 text-black" />,
    },
    {
      title: "Active Courses",
      value: 156,
      change: -3.1,
      increase: false,
      icon: <BookOpen className="h-8 w-8 text-black" />,
    },
    {
      title: "Student Enrollments",
      value: 3204,
      change: 8.7,
      increase: true,
      icon: <GraduationCap className="h-8 w-8 text-black" />,
    },
  ];

  // Quick access cards
  const quickAccessLinks = [
    {
      title: "Student Registration",
      description: "Register new students in the system",
      href: "/admin/student-register",
      icon: <UserPlus className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Student Enrollment",
      description: "Manage course enrollments for students",
      href: "/admin/student-enroll",
      icon: <Users className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Course Registration",
      description: "Add and configure new courses",
      href: "/admin/course-register",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Course Assignment",
      description: "Assign courses to instructors",
      href: "/admin/course-assignment",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Instructor Registration",
      description: "Add and manage instructors/teachers",
      href: "/admin/instructor-register",
      icon: <User className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Admin Registration",
      description: "Add new administrators to the system",
      href: "/admin/admin-register",
      icon: <Users className="h-8 w-8" />,
      color: "bg-gray-100",
    }
  ];

  // Recent activity - in a real app, you'd fetch this from your database
  const recentActivity = [
    {
      id: 1,
      action: "Student Registered",
      name: "Ahmed Hassan",
      timestamp: "2 minutes ago",
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      id: 2,
      action: "Course Added",
      name: "Introduction to Data Science",
      timestamp: "15 minutes ago",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      id: 3,
      action: "Student Enrolled",
      name: "Fatima Khan in Algorithms",
      timestamp: "48 minutes ago",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 4,
      action: "Instructor Added",
      name: "Dr. Amina Shaheen",
      timestamp: "1 hour ago",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 5,
      action: "Course Updated",
      name: "Computer Networks",
      timestamp: "3 hours ago",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button className="bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" /> New Action
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-full bg-gray-100">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                {stat.increase ? (
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={stat.increase ? "text-green-500" : "text-red-500"}>
                  {Math.abs(stat.change)}%
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickAccessLinks.map((link, i) => (
            <Link key={i} href={link.href} className="block group">
              <Card className="h-full shadow-sm border-gray-200 hover:border-black hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className={`${link.color} p-3 rounded-md w-fit mb-3`}>
                    {link.icon}
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Recent actions performed in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-sm text-gray-500">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 