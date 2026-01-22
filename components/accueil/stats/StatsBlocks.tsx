"use client";

import type { ReactNode } from "react";
import type { PostType } from "@/lib/posts/types";
import { POST_TYPE_COLORS, POST_TYPE_LABELS, TYPE_OPTIONS } from "@/lib/posts/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "emerald" | "amber" | "sky" | "slate" | "rose";
  icon?: ReactNode;
};

const cardBase = "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm";
const cardTitle = "text-sm font-semibold text-slate-900";
const cardSubtitle = "text-xs text-slate-500";
const tooltipStyle = {
  backgroundColor: "white",
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  fontSize: 12,
  padding: "8px 10px",
};

function toneRing(tone: NonNullable<StatCardProps["tone"]>) {
  return tone === "emerald"
    ? "bg-emerald-50 text-emerald-900 ring-emerald-100"
    : tone === "amber"
    ? "bg-amber-50 text-amber-900 ring-amber-100"
    : tone === "sky"
    ? "bg-sky-50 text-sky-900 ring-sky-100"
    : tone === "rose"
    ? "bg-rose-50 text-rose-900 ring-rose-100"
    : "bg-slate-50 text-slate-900 ring-slate-100";
}

function StatCard({ label, value, helper, tone = "slate", icon }: StatCardProps) {
  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        {icon ? (
          <span className={`grid h-8 w-8 place-items-center rounded-full ring-1 ${toneRing(tone)}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

export function StatsGrid({ items }: { items: readonly StatCardProps[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <StatCard key={it.label} {...it} />
      ))}
    </section>
  );
}

export function TypeBreakdown({
  typeCounts,
  total,
  topTypeByWeek,
}: {
  typeCounts: Record<PostType, number>;
  total: number;
  topTypeByWeek: { label: string; type: PostType | null; count: number }[];
}) {
  const typeData = TYPE_OPTIONS.map((type) => ({
    type,
    name: POST_TYPE_LABELS[type],
    value: typeCounts[type] ?? 0,
  }));
  const chartData = typeData
    .filter((d) => d.value > 0)
    .map((item) => ({ ...item, fill: POST_TYPE_COLORS[item.type] }));

  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between">
        <p className={cardTitle}>Répartition par type</p>
        <span className="text-xs font-semibold text-slate-600">{total} posts</span>
      </div>

      <div className="mt-4 relative h-100 w-full min-w-0">
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-2xl font-semibold text-slate-900">{total}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  labelLine={false}
                  label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, _name, props) => [
                    value,
                    (props?.payload?.name as string) ?? "Type",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Top type par semaine
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {topTypeByWeek.map((week) => (
            <div
              key={week.label}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs"
            >
              <span className="font-semibold text-slate-600">{week.label}</span>
              {week.type ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: POST_TYPE_COLORS[week.type] }}
                  />
                  <span className="font-semibold text-slate-700">
                    {POST_TYPE_LABELS[week.type]}
                  </span>
                  <span className="text-slate-400">· {week.count}</span>
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeBars({
  title,
  subtitle,
  data,
  barColor,
}: {
  title: string;
  subtitle: string;
  data: { label: string; count: number }[];
  barColor: string;
}) {
  const maxCount = data.reduce((max, item) => Math.max(max, item.count), 0);
  const ticks = maxCount <= 4 ? Array.from({ length: maxCount + 1 }, (_, i) => i) : undefined;
  const tickCount = ticks ? undefined : 4;

  return (
    <div className={cardBase}>
      <p className={cardTitle}>{title}</p>
      <p className={cardSubtitle}>{subtitle}</p>

      <div className="mt-4 h-48 w-full min-w-0">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
            <BarChart data={data} margin={{ left: -5, right: 10 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                width={28}
                allowDecimals={false}
                tickCount={tickCount}
                ticks={ticks}
                domain={[0, Math.max(1, maxCount)]}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={barColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function WeeklyPosts({ weeks }: { weeks: { label: string; count: number }[] }) {
  return <TimeBars title="Postes par semaine" subtitle="Dernières semaines" data={weeks} barColor="#6366f1" />;
}

export function MonthlyPosts({ months }: { months: { label: string; count: number }[] }) {
  return <TimeBars title="Posts par mois" subtitle="Année en cours" data={months} barColor="#38bdf8" />;
}

export function AuthorBreakdown({ authors }: { authors: { name: string; count: number }[] }) {
  const topAuthors = authors.slice(0, 8);
  const formatAuthor = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);
  const maxCount = topAuthors.reduce((max, item) => Math.max(max, item.count), 0);
  const ticks = maxCount <= 4 ? Array.from({ length: maxCount + 1 }, (_, i) => i) : undefined;
  const tickCount = ticks ? undefined : 4;

  return (
    <div className={cardBase}>
      <p className={cardTitle}>Posts par auteur</p>

      <div className="mt-4 h-56 w-full min-w-0">
        {topAuthors.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
            <BarChart data={topAuthors} margin={{ left: -10, right: 10, bottom: 24 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                angle={-25}
                textAnchor="end"
                tickFormatter={formatAuthor}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                allowDecimals={false}
                width={28}
                tickCount={tickCount}
                ticks={ticks}
                domain={[0, Math.max(1, maxCount)]}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#94a3b8" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function Highlights({
  nextUpcoming,
}: {
  nextUpcoming: { title: string; date: string; type: PostType }[];
}) {
  return (
    <div className={cardBase}>
      <p className={cardTitle}>PROCHAINS POSTES</p>

      <div className="mt-2 space-y-3">
        {nextUpcoming.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun contenu à venir.</p>
        ) : (
          nextUpcoming.map((p, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: POST_TYPE_COLORS[p.type] }}
                  />
                  <span className="font-semibold">{POST_TYPE_LABELS[p.type]}</span>
                </div>
                <span className="text-xs text-slate-400">{p.date}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{p.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
