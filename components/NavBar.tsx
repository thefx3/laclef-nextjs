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
  const appKey = getAppKeyFromPath(pathname);
  const links = APP_NAV[appKey];

  const navLinkClass =
    "font-bold text-white hover:text-black text-md tracking-widest px-8 py-4 transition-colors hover:bg-[linear-gradient(100deg,_white,_grey)]";

  const navLinkActiveClass =
    "bg-[linear-gradient(100deg,_#000000_20%,_grey_60%,_#cccccc_100%)]";

  return (
    <aside className="hidden bg-black text-white shadow-sm w-full lg:block lg:w-64 shrink-0">
      <Link
        href="/"
        className="font-bold tracking-[0.25em] text-2xl uppercase py-5 px-8 mb-3 inline-block"
      >
        <Image src={icon} alt="La CLEF Logo" width={96} height={96} className="mx-auto mt-2 h-24 w-24 logo-white" priority />
      </Link>

      <nav className="flex flex-col gap-4">
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
              className={`${navLinkClass} ${isActive ? navLinkActiveClass : ""} inline-flex items-center gap-2`}
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
