import { StudentSidebar } from "@/components/layouts/student-sidebar";
import { StudentTopbar } from "@/components/layouts/student-topbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentTopbar />
        <main className="flex-1 overflow-y-auto bg-bg-subtle p-6">{children}</main>
      </div>
    </div>
  );
}
