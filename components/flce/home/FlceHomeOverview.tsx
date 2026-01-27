import Link from "next/link";
import type { StatsDashboardData } from "@/lib/students/statsTypes";
import type { ClassOfferingRow, LevelRow, TeacherRow, TimeSlotRow } from "@/lib/flce/referenceTypes";
import { formatDate } from "@/lib/students/utils";
import FlceHomeCharts from "@/components/flce/home/FlceHomeCharts.client";

const cardBase = "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm";
const sectionTitle = "text-sm font-semibold text-slate-900";
const mutedText = "text-xs text-slate-500";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cardBase}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function FlceHomeOverview({
  stats,
  teachers,
  levels,
  timeSlots,
  classOfferings,
  recentEnrolled,
}: {
  stats: StatsDashboardData;
  teachers: TeacherRow[];
  levels: LevelRow[];
  timeSlots: TimeSlotRow[];
  classOfferings: ClassOfferingRow[];
  recentEnrolled: Array<{
    id: string;
    first_name: string;
    last_name: string;
    created_at: string;
    class_s1_code?: string | null;
    class_s2_code?: string | null;
  }>;
}) {
  const topClasses = stats.classData.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total élèves" value={stats.totals.total} />
        <StatCard label="Inscrits" value={stats.totals.enrolled} />
        <StatCard label="Pré-inscrits" value={stats.totals.pre} />
        <StatCard label="Non-inscrits" value={stats.totals.lead} />
        <StatCard label="Sortis" value={stats.totals.left} />
      </section>

      <section className="space-y-3">
        <FlceHomeCharts stats={stats} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr_0.9fr]">
        <div className={`${cardBase} space-y-4`}>
          <div className="flex items-center justify-between">
            <p className={sectionTitle}>Top classes</p>
            <span className={mutedText}>Toutes saisons filtrées</span>
          </div>
          {topClasses.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune classe enregistrée.</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              {topClasses.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="text-slate-500">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${cardBase} space-y-4`}>
          <div className="flex items-center justify-between">
            <p className={sectionTitle}>Dernières inscriptions</p>
            <span className={mutedText}>Inscrits récents</span>
          </div>
          {recentEnrolled.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune inscription récente.</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              {recentEnrolled.map((student) => (
                <div key={student.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(student.created_at)} · {student.class_s1_code ?? "—"}{" "}
                      {student.class_s2_code ? `/ ${student.class_s2_code}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${cardBase} space-y-4`}>
          <div>
            <p className={sectionTitle}>Référentiels</p>
            <p className={mutedText}>Données disponibles</p>
          </div>
          <div className="space-y-2">
            <InfoRow label="Professeurs" value={String(teachers.length)} />
            <InfoRow label="Niveaux" value={String(levels.length)} />
            <InfoRow label="Horaires" value={String(timeSlots.length)} />
            <InfoRow label="Classes" value={String(classOfferings.length)} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link className="btn-primary text-xs" href="/flce/students">
              Voir les élèves
            </Link>
            <Link className="btn-primary text-xs" href="/flce/stats">
              Voir les stats
            </Link>
            <Link className="btn-primary text-xs" href="/flce/organisation">
              Gérer l’organisation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
