import { createClient } from '@/utils/supabase/server';

type StatItem = {
  title: string;
  value: number;
  change: number;
  increase: boolean;
  icon: string;
};

type ActivityItem = {
  id: string;
  action: string;
  name: string;
  timestamp: string;
};

export async function getDashboardStats(): Promise<{ stats: StatItem[] }> {
  const supabase = await createClient();
  
  // Get total students count
  const { count: totalStudents, error: studentsError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });
  
  // Get students enrolled today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: enrolledToday, error: enrolledTodayError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  
  // Get active courses count
  const { count: activeCourses, error: coursesError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });
  
  // Get universities count
  const { count: universities, error: universitiesError } = await supabase
    .from('university')
    .select('*', { count: 'exact', head: true });
  
  // Calculate percentage changes (in a real app, you would compare with previous period data)
  // This is placeholder logic - you would need to fetch historical data for real calculations
  const getRandomChange = () => {
    return parseFloat((Math.random() * 20 - 10).toFixed(1));
  };

  return {
    stats: [
      {
        title: "Total Students",
        value: totalStudents || 0,
        change: getRandomChange(),
        increase: Math.random() > 0.5,
        icon: "Users",
      },
      {
        title: "Enrolled Today",
        value: enrolledToday || 0,
        change: getRandomChange(),
        increase: Math.random() > 0.5,
        icon: "UserPlus",
      },
      {
        title: "Active Courses",
        value: activeCourses || 0,
        change: getRandomChange(),
        increase: Math.random() > 0.5,
        icon: "BookOpen",
      },
      {
        title: "Universities",
        value: universities || 0,
        change: getRandomChange(),
        increase: Math.random() > 0.5,
        icon: "School",
      },
    ]
  };
}

// Define proper types for Supabase responses
interface StudentData {
  student_id: number;
  created_at: string;
  users: {
    full_name: string;
  } | null;
}

interface CourseData {
  course_id: number;
  title: string;
  created_at: string;
}

interface InstructorData {
  instructor_id: number;
  created_at: string;
  users: {
    full_name: string;
  } | null;
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  
  // Get recent students
  const { data: recentStudents, error: studentsError } = await supabase
    .from('students')
    .select('student_id, created_at, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(2);
  
  // Get recent courses
  const { data: recentCourses, error: coursesError } = await supabase
    .from('courses')
    .select('course_id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(2);
    
  // Get recent instructors
  const { data: recentInstructors, error: instructorsError } = await supabase
    .from('instructors')
    .select('instructor_id, created_at, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(1);

  // Format the activity items
  const activityItems: ActivityItem[] = [];
  
  // Add students
  if (recentStudents) {
    recentStudents.forEach((student: any) => {
      const createdAt = new Date(student.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      let timestamp;
      if (diffInMinutes < 60) {
        timestamp = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        timestamp = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / (24 * 60));
        timestamp = `${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      activityItems.push({
        id: `student-${student.student_id}`,
        action: "Student Registered",
        name: student.users?.full_name || 'Unknown',
        timestamp,
      });
    });
  }
  
  // Add courses
  if (recentCourses) {
    recentCourses.forEach((course: CourseData) => {
      const createdAt = new Date(course.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      let timestamp;
      if (diffInMinutes < 60) {
        timestamp = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        timestamp = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / (24 * 60));
        timestamp = `${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      activityItems.push({
        id: `course-${course.course_id}`,
        action: "Course Added",
        name: course.title || 'Unknown Course',
        timestamp,
      });
    });
  }
  
  // Add instructors
  if (recentInstructors) {
    recentInstructors.forEach((instructor: any) => {
      const createdAt = new Date(instructor.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      let timestamp;
      if (diffInMinutes < 60) {
        timestamp = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        timestamp = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / (24 * 60));
        timestamp = `${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      activityItems.push({
        id: `instructor-${instructor.instructor_id}`,
        action: "Faculty Added",
        name: instructor.users?.full_name || 'Unknown',
        timestamp,
      });
    });
  }
  
  // Sort by most recent
  activityItems.sort((a, b) => {
    const timeA = a.timestamp.includes('minute') ? parseInt(a.timestamp) : 
                  a.timestamp.includes('hour') ? parseInt(a.timestamp) * 60 :
                  parseInt(a.timestamp) * 24 * 60;
    
    const timeB = b.timestamp.includes('minute') ? parseInt(b.timestamp) : 
                  b.timestamp.includes('hour') ? parseInt(b.timestamp) * 60 :
                  parseInt(b.timestamp) * 24 * 60;
    
    return timeA - timeB;
  });
  
  return activityItems.slice(0, 5); // Return up to 5 most recent activities
} 