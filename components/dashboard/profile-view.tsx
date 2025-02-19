"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

const ProfileView = () => {
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
                <h3 className="text-lg font-semibold">Allah Rakha</h3>
                <p className="text-sm text-muted-foreground">00000379284</p>
                <p className="text-sm text-muted-foreground">
                  School of Electrical Engineering and Computer Science
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Academic Standings:</p>
                <p className="text-green-600">Good</p>
              </div>
              <div>
                <p className="font-medium">CGPA:</p>
                <p>3.33</p>
              </div>
              <div>
                <p className="font-medium">Earned Cr:</p>
                <p>101.0</p>
              </div>
              <div>
                <p className="font-medium">Total Cr:</p>
                <p>0.0</p>
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
