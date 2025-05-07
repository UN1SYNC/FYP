"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Loading from "@/components/ui/loading";

const ProfileView = () => {
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const name = user?.name || '';
  const [studentId, setStudentId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [cgpa, setCgpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (user?.role === 'instructor') {
    return (
      <></>
    )
  }

  useEffect(() => {
    const fetchStudentAndSchool = async () => {
      setLoading(true);
      setError(null);
      if (!user) return;
      
      try {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id, university_id, degree_id')
          .eq('user_id', user.id)
          .single();
          
        if (studentError) {
          console.error('Error fetching student_id:', studentError);
          setError('Failed to load student data');
          setLoading(false);
          return;
        }
        
        if (!studentData) {
          console.error('No student data found');
          setError('No student record found');
          setLoading(false);
          return;
        }
        
        setStudentId(studentData.student_id);

        // Fetch degree data using degree_id
        if (studentData.degree_id) {
          const { data: degreeData, error: degreeError } = await supabase
            .from('degree')
            .select('degree_name, school_id')
            .eq('degree_id', studentData.degree_id)
            .single();
          
          if (degreeError) {
            console.error('Error fetching degree data:', degreeError);
            setError('Failed to load degree information');
            setLoading(false);
            return;
          }
          
          if (!degreeData) {
            setSchoolName('No degree data found');
            setLoading(false);
            return;
          }
          
          // Now fetch school name using school_id from degree
          if (degreeData.school_id) {
            const { data: schoolData, error: schoolError } = await supabase
              .from('school')
              .select('name')
              .eq('id', degreeData.school_id)
              .single();
              
            if (schoolError) {
              console.error('Error fetching school_name:', schoolError);
              setError('Failed to load school information');
              setLoading(false);
              return;
            }
            
            if (!schoolData) {
              setSchoolName('School not found');
              setLoading(false);
              return;
            }
            
            setSchoolName(schoolData.name);
          } else {
            setSchoolName('No School Assigned');
          }
        } else {
          setSchoolName('No Degree Assigned');
        }
        setLoading(false);
      } catch (e) {
        console.error('Unexpected error:', e);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchStudentAndSchool();
  }, [user]);

  useEffect(() => {
    const fetchAndComputeCgpa = async () => {
      if (!studentId) return;
      
      try {
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('course_id, grade')
          .eq('student_id', studentId);
        if (resultsError) {
          console.error('Error fetching results:', resultsError);
          return;
        }
        const courseIds = resultsData.map(r => r.course_id);
        if (courseIds.length === 0) {
          setCgpa(0);
          return;
        }
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('course_id, credit_hours')
          .in('course_id', courseIds);
        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          return;
        }
        const creditMap: Record<number, number> = {};
        coursesData.forEach(c => {
          creditMap[c.course_id] = c.credit_hours || 0;
        });
        const gradePoints: Record<string, number> = {
          'A': 4, 'B+': 3.5, 'B': 3, 'C+': 2.5,
          'C': 2, 'D+': 1.5, 'D': 1, 'F': 0
        };
        let totalCredits = 0;
        let totalPoints = 0;
        resultsData.forEach(r => {
          const cred = creditMap[r.course_id] || 0;
          const pt = gradePoints[r.grade] ?? 0;
          totalCredits += cred;
          totalPoints += cred * pt;
        });
        const computed = totalCredits ? totalPoints / totalCredits : 0;
        setCgpa(+computed.toFixed(2));
      } catch (e) {
        console.error('Error calculating CGPA:', e);
      }
    };
    fetchAndComputeCgpa();
  }, [studentId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="">
      <Card className="mx-auto py-4 bg-muted/80">
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={"/ar.jpg"}
                  alt="User Profile"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{studentId}</p>
                <p className="text-sm text-muted-foreground">{schoolName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">CGPA:</p>
                <p>{cgpa}</p>
              </div>
              <div>
                <p className="font-medium">Earned Cr:</p>
                <p>101.0</p>
              </div>
              <div>
                <p className="font-medium">Total Cr:</p>
                <p>131.0</p>
              </div>
              <div>
                <p className="font-medium">Inprogress Cr:</p>
                <p>15.0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
