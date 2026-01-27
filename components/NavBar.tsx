"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import icon from "@/app/icon.png";
import { APP_NAV, APPS, type AppKey } from "@/lib/apps";
import type { UserRole } from "@/lib/users/types";

function getAppKeyFromPath(pathname: string | null): AppKey {
  const seg = (pathname ?? "/").split("/")[1];
  const appKeys = APPS.map((app) => app.key);
  if (appKeys.includes(seg as AppKey)) return seg as AppKey;
  return "accueil";
}

export default function NavBar({ role }: { role?: UserRole }) {
  const pathname = usePathname();
  const appKey = getAppKeyFromPath(pathname);
  const activeApp = APPS.find((app) => app.key === appKey);
  const activeRingClass = activeApp?.colorClass?.replace("text-", "ring-") ?? "ring-slate-300";
  const links = APP_NAV[appKey];

  const navLinkClass =
    "group inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900";

  const navLinkActiveClass =
    "bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-black";

  const showSettings = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSettingsActive = (pathname ?? "").startsWith("/settings");

  return (
    <aside className="hidden h-screen w-full shrink-0 border-r border-white/80 bg-white/70 shadow-sm backdrop-blur lg:flex lg:w-64 lg:flex-col">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-3 px-6 pt-6 text-lg font-semibold uppercase tracking-[0.25em] text-slate-900"
      >
        <Image
          src={icon}
          alt="La CLEF Logo"
          width={56}
          height={56}
          className={`h-14 w-14 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm ring-2 ring-offset-2 ring-offset-white ${activeRingClass}`}
          priority
        />
        <span>La CLEF</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-3 px-4 pb-6">
        {links.map((link) => {
          const isBaseRoute = links.some(
            (other) => other.href !== link.href && other.href.startsWith(`${link.href}/`)
          );

          const isActive = isBaseRoute ? pathname === link.href : (pathname?.startsWith(link.href) ?? false);

          const Icon = link.Icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${navLinkClass} ${isActive ? navLinkActiveClass : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}

        {showSettings && (
          <div className="mt-auto border-t border-slate-200/70 pt-4">
            <Link
              href="/settings"
              className={`${navLinkClass} ${isSettingsActive ? navLinkActiveClass : ""}`}
              aria-current={isSettingsActive ? "page" : undefined}
            >
              <Settings className="h-4 w-4" aria-hidden />
              Settings
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
