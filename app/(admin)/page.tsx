import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  School, 
  GraduationCap, 
  Building, 
  ArrowUp, 
  ArrowDown,
  Plus 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardStats, getRecentActivity } from '@/lib/api/dashboard';

export default async function AdminDashboard() {
  // Fetch dynamic dashboard data from Supabase
  const { stats } = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  // Map icon names to actual components
  const iconComponents = {
    Users: <Users className="h-8 w-8 text-black" />,
    UserPlus: <UserPlus className="h-8 w-8 text-black" />,
    BookOpen: <BookOpen className="h-8 w-8 text-black" />,
    School: <School className="h-8 w-8 text-black" />,
  };
  
  // Quick access cards
  const quickAccessLinks = [
    {
      title: "Student Registration",
      description: "Register new students in the system",
      href: "/student-register",
      icon: <UserPlus className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Student Enrollment",
      description: "Manage course enrollments for students",
      href: "/student-enroll",
      icon: <Users className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Course Registration",
      description: "Add and configure new courses",
      href: "/course-register",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "University Management",
      description: "Manage university settings and configurations",
      href: "/university",
      icon: <Building className="h-8 w-8" />,
      color: "bg-gray-100",
    },
    {
      title: "Faculty Management",
      description: "Add and manage faculty members",
      href: "/faculty",
      icon: <GraduationCap className="h-8 w-8" />,
      color: "bg-gray-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-2">
          <Button>
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
                {iconComponents[stat.icon as keyof typeof iconComponents]}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <Users className="h-5 w-5" />
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