import Link from "next/link";
import { APPS } from "@/lib/apps";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/components/header/LogOutAction";

export async function LauncherHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div className="justify-center flex items-center bg-white px-4 py-3 gap-4">
      <div className="text-sm text-gray-700">
        Connecté : <span className="font-medium">{user.email}</span>
      </div>

      <form action={logoutAction}>
        <button className="btn-primary">
          Déconnexion
        </button>
      </form>
    </div>
  );
}

export default async function Launcher() {
  const apps = APPS;

  return (
    <div className="dashboard-shell relative overflow-hidden px-6 py-10 font-sans space-y-8">
      
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-lg font-semibold uppercase tracking-[0.35em] text-emerald-700/80">
            La CLEF
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Choisis un espace pour continuer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map(({ href, label, Icon, colorClass }, index) => (
            <Link
              key={href}
              href={href}
              className="card-fade group relative flex min-h-55 flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_25px_55px_-30px_rgba(15,23,42,0.7)]"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute -bottom-12 right-6 h-36 w-36 rounded-full bg-sky-200/35 blur-3xl" />
              </div>

                <div className="flex h-30 w-30 items-center justify-center">
                  <Icon className={`h-20 w-20 ${colorClass}`} />
                </div>


              <div className="relative flex-row mt-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {label}
                </h2>
                <span className="transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <LauncherHeader />
    </div>
  );
}
