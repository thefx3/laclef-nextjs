// lib/apps.ts
import {
    Headset,
    Croissant, 
    PersonStanding, 
    Music, 
    Home, 
    PenSquare, 
    ChartNoAxesCombined, 
    LibraryBig, 
    BookUser, 
    Blocks, 
    Files, 
    Users,
    LucideIcon } from "lucide-react";

export const APPS = [
  { key: "accueil", href: "/accueil", label: "Accueil", Icon: Headset, colorClass: "text-green-500" },
  { key: "flce", href: "/flce", label: "FLCE", Icon: Croissant, colorClass: "text-yellow-500" },
  { key: "activites", href: "/activites", label: "Activités", Icon: PersonStanding, colorClass: "text-violet-500" },
  { key: "musique", href: "/musique", label: "Musique", Icon: Music, colorClass: "text-blue-500" },
] as const;

export type AppRole = "ACCUEIL" | "FLCE" | "MUSIQUE" | "ACTIVITES" | "ADMIN" | "SUPER_ADMIN";
export type AppKey = (typeof APPS)[number]["key"];
export type AppItem = (typeof APPS)[number];

export type NavLink = { href: string; label: string; Icon: LucideIcon };

export const APP_NAV: Record<AppKey, NavLink[]> = {
  accueil: [
    { href: "/accueil", label: "Home", Icon: Home },
    { href: "/accueil/posts", label: "Posts", Icon: PenSquare },
    { href: "/accueil/archives", label: "Archives", Icon: LibraryBig},
    { href: "/accueil/stats", label: "Stats", Icon: ChartNoAxesCombined },
    { href: "/accueil/users", label: "Utilisateurs", Icon: Users},
  ],

  musique: [
    { href: "/musique", label: "Home", Icon: Home },
    { href: "/musique/users", label: "Utilisateurs", Icon: Users }
  ],

  activites: [
    { href: "/activites", label: "Home", Icon: Home  },
    { href: "/activites/users", label: "Utilisateurs", Icon: Users }
  ],
  
  flce: [
    { href: "/flce", label: "Home", Icon: Home },
    { href: "/flce/students", label: "Elèves", Icon: BookUser },
    { href: "/flce/organisation", label: "Organisation", Icon: Blocks},
    { href: "/flce/documents", label: "Documents", Icon: Files },
    { href: "/flce/stats", label: "Stats", Icon: ChartNoAxesCombined },

    { href: "/flce/users", label: "Utilisateurs", Icon: Users }
  ],

} as const;
