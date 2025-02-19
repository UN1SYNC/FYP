import Topbar from "@/components/cms/course/top-bar";
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      {children}
    </>
  );
}
