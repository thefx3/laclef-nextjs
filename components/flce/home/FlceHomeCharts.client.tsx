"use client";

import type { StatsDashboardData } from "@/lib/students/statsTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";

const cardBase = "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm";
const cardTitle = "text-sm font-semibold text-slate-900";
const tooltipStyle = {
  backgroundColor: "white",
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  fontSize: 12,
  padding: "8px 10px",
};

type BarDatum = { label: string; value: number; percent?: number; color?: string };
type PieDatum = { name: string; value: number; color: string };

function withPercent(data: Array<{ label: string; value: number }>, total: number): BarDatum[] {
  return data.map((item) => ({
    ...item,
    percent: total ? Math.round((item.value / total) * 100) : 0,
  }));
}

function BarCard({
  title,
  data,
  color,
  total,
  useCellColors = false,
}: {
  title: string;
  data: BarDatum[];
  color?: string;
  total: number;
  useCellColors?: boolean;
}) {
  const fillColor = color ?? "#CBD5F5";

  return (
    <div className={cardBase}>
      <p className={cardTitle}>{title}</p>
      <div className="mt-4 h-[220px] w-full">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => {
                  const numericValue = typeof value === "number" ? value : 0;
                  const percent = total ? Math.round((numericValue / total) * 100) : 0;
                  return [`${numericValue} (${percent}%)`, ""];
                }}
              />
              <Bar dataKey="value" fill={fillColor}>
                {useCellColors &&
                  data.map((entry) => (
                    <Cell key={entry.label} fill={entry.color ?? fillColor} />
                  ))}
                <LabelList
                  dataKey="percent"
                  position="top"
                  formatter={(value) => {
                    if (typeof value === "number") return `${value}%`;
                    return "";
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function PieCard({
  title,
  data,
}: {
  title: string;
  data: PieDatum[];
}) {
  return (
    <div className={cardBase}>
      <p className={cardTitle}>{title}</p>
      <div className="mt-4 h-[220px] w-full">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function FlceHomeCharts({ stats }: { stats: StatsDashboardData }) {
  const statusDataBase: BarDatum[] = stats.statusData.map((item) => ({
    label: item.name,
    value: item.value,
    color: item.color,
  }));
  const statusTotal = statusDataBase.reduce((sum, item) => sum + item.value, 0);
  const statusDataWithPercent = withPercent(statusDataBase, statusTotal);

  const genderData: PieDatum[] = stats.genderData.map((item) => ({
    name: item.name === "ND" ? "ND" : item.name,
    value: item.value,
    color: item.color,
  }));

  const auPairData: PieDatum[] = stats.auPairData.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
  }));

  const classData: BarDatum[] = stats.classData.slice(0, 10);
  const classTotal = classData.reduce((sum, item) => sum + item.value, 0);
  const classDataWithPercent = withPercent(classData, classTotal);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <BarCard
        title="Statuts"
        data={statusDataWithPercent}
        total={statusTotal}
        useCellColors
      />
      <PieCard title="Civilité" data={genderData} />
      <PieCard title="Au pair" data={auPairData} />
      <BarCard title="Top classes" data={classDataWithPercent} color="#F59E0B" total={classTotal} />
    </div>
  );
}
