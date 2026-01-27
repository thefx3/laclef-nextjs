import Link from "next/link";
import SettingsShell from "@/components/settings/SettingsShell";

export default function SettingsPage() {
  return (
    <SettingsShell title="Settings">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Saisons</p>
          <p className="mt-1 text-xs text-slate-500">
            Gérer les périodes, dates et saison en cours.
          </p>
          <Link className="btn-primary mt-4 inline-flex text-xs" href="/settings/seasons">
            Ouvrir
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Salles</p>
          <p className="mt-1 text-xs text-slate-500">Configuration des salles (bientôt).</p>
          <Link className="btn-primary mt-4 inline-flex text-xs" href="/settings/rooms">
            Ouvrir
          </Link>
        </div>
      </div>
    </SettingsShell>
  );
}
