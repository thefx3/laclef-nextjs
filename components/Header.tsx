import LogoutButton from "./header/LogOutButton";
import Link from "next/link";
import { APPS } from "@/lib/apps";

type HeaderProps = {
    email: string;
    role: string;
}

export default function Header({ email, role }: HeaderProps) {
    const iconClass =
    "h-9 w-9 rounded-lg border border-white/70 bg-white/70 p-2 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900";

    return (
        <header className="w-full flex justify-between p-4 shadow-sm backdrop-blur">
        {/* Gauche */}
        <div>

        </div>
        <nav className="flex flex-wrap items-center gap-2">
            {APPS.map(({ href, label, Icon, colorClass }) => (
            <Link
                key={href}
                href={href}
                aria-label={label}
                title={label}
                className="inline-flex"
            >
                <Icon className={`${iconClass} ${colorClass}`} size={30} />
            </Link>
            ))}
        </nav>
  
        {/* Droite */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700 sm:mt-0">
            <div className="text-sm">
                <span className="font-medium text-slate-900">{email ?? "—"}</span>
                <span className="ml-2 rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-xs text-slate-600">
                  {role}
                </span>
            </div>
            <LogoutButton />
        </div>
      </header>
    );

}
