import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { redirect } from "next/navigation";

export default async function AppsLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getViewerServer();
  if (!user) redirect("/login");

  return (
    <div className="h-screen">
      <div className="flex h-full flex-col lg:flex-row">
        <NavBar role={role} />
        <main className="relative flex min-h-0 w-full flex-col min-w-0">
          <div className="mx-auto w-full">
            <Header email={user.email ?? "-"} role={role} />
          </div>
          <div className="mx-auto w-full flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
