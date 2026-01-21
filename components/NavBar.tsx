"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import icon from "@/app/icon.png";
import { APP_NAV, type AppKey } from "@/lib/apps";

function getAppKeyFromPath(pathname: string | null): AppKey {
  const seg = (pathname ?? "/").split("/")[1];
  if (seg === "accueil" || seg === "flce" || seg === "musique" || seg === "activites") return seg;
  return "accueil";
}

export default function NavBar() {
  const pathname = usePathname();

  const firstSeg = (pathname ?? "/").split("/")[1];
  const isAppRoute = ["accueil", "flce", "musique", "activites"].includes(firstSeg);

  if (!isAppRoute) return null;

  const appKey = getAppKeyFromPath(pathname);
  const links = APP_NAV[appKey];

  const navLinkClass =
    "group inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900";

  const navLinkActiveClass =
    "bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-black";

  return (
    <aside className="hidden w-full shrink-0 border-r border-white/80 bg-white/70 shadow-sm backdrop-blur lg:block lg:w-64">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-3 px-6 pt-6 text-lg font-semibold uppercase tracking-[0.25em] text-slate-900"
      >
        <Image
          src={icon}
          alt="La CLEF Logo"
          width={56}
          height={56}
          className="h-14 w-14 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm"
          priority
        />
        <span>La CLEF</span>
      </Link>

      <nav className="flex flex-col gap-2 px-4 pb-6">
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
      </nav>
    </aside>
  );
}
