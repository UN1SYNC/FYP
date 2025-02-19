import ProfileView from "@/components/dashboard/profile-view";
import CoursesView from './../../../components/dashboard/courses-view';

export default async function Page() {

  // RETURN TSX
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <ProfileView />
      <CoursesView/>
    </div>
  );
}
