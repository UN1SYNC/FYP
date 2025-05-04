"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const ProfileView = () => {
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const name = user?.name || '';
  const [studentId, setStudentId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [cgpa, setCgpa] = useState<number>(0);

  useEffect(() => {
    const fetchStudentAndSchool = async () => {
      if (!user) return;
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('student_id, university_id')
        .eq('user_id', user.id)
        .single();
      if (studentError || !studentData) {
        console.error('Error fetching student_id:', studentError);
        return;
      }
      setStudentId(studentData.student_id);

      const { data: schoolData, error: schoolError } = await supabase
        .from('school')
        .select('name')
        .eq('uni_id', studentData.university_id)
        .single();
      if (schoolError || !schoolData) {
        console.error('Error fetching school_name:', schoolError);
        return;
      }
      setSchoolName(schoolData.name);
    };

    fetchStudentAndSchool();
  }, [user]);

  useEffect(() => {
    const fetchAndComputeCgpa = async () => {
      if (!studentId) return;
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('course_id, grade')
        .eq('student_id', studentId);
      if (resultsError || !resultsData) {
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
      if (coursesError || !coursesData) {
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
    };
    fetchAndComputeCgpa();
  }, [studentId]);

  return (
    <div className="">
      <Card className="mx-auto py-4 bg-muted/80">
      {/* <CardHeader>
          <CardTitle className="text-xl font-semibold">Academics</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={"/ar.jpg"} // Replace with dynamic image path
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

            {/* Right Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <p className="font-medium">Academic Standings:</p>
                <p className="text-green-600">Good</p>
              </div> */}
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

          {/* <div className="mt-6">
            <h4 className="font-medium">Today Classes:</h4>
            <ul className="mt-2 space-y-2">
              <li className="text-sm">Theo Of Automata & Formal Lang : 10:00 Hrs. - 11:00 Hrs.</li>
              <li className="text-sm">Theo Of Automata & Formal Lang : 11:00 Hrs. - 12:00 Hrs.</li>
              <li className="text-sm">Entrepreneurship : 12:00 Hrs. - 13:00 Hrs.</li>
              <li className="text-sm">Psychology : 14:00 Hrs. - 15:00 Hrs.</li>
              <li className="text-sm">Psychology : 15:00 Hrs. - 16:00 Hrs.</li>
            </ul>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
