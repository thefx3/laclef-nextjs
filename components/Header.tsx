import LogoutButton from "./header/LogOutButton";
import Link from "next/link";
import { APPS } from "@/lib/apps";

type HeaderProps = {
    email: string;
    role: string;
}

export default function Header({ email, role }: HeaderProps) {
    const iconClass =
    "h-10 w-10 border border-black p-2 rounded-md transition-transform cursor-pointer hover:scale-95 hover:bg-black hover:text-white";

    return (
        <header className="w-full border-b bg-white px-6 py-4 flex items-center justify-between">
        {/* Gauche */}
        <nav className="flex items-center gap-3">
            {APPS.map(({ href, label, Icon, colorClass }) => (
            <Link
                key={href}
                href={href}
                aria-label={label}
                title={label}
                className="inline-flex"
            >
                <Icon className={`${iconClass} ${colorClass}`} />
            </Link>
            ))}
        </nav>
  
        {/* Droite */}
        <div className="flex text-sm text-black gap-2 items-center">
            <div className="text-sm text-gray-700">
                Connecté : <span className="font-medium">{email ?? "—"}</span>
                           <span className="ml-2 px-2 py-0.5 text-xs">{role}</span>
            </div>
            <LogoutButton />
        </div>
      </header>
    );

}