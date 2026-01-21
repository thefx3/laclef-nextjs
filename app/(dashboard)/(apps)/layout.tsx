import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";

export default async function AppsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ici user est forcément là car le parent layout a déjà redirect si pas user
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  const role = profile?.role ?? "USER";

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <NavBar />
        <main className="flex flex-col w-full min-h-screen min-w-0">
          <div className="mx-auto w-full">
            <Header email={user!.email ?? "-"} role={role} />
          </div>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-10 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}