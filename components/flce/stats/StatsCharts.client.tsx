"use client";

import type { StatsDashboardData } from "@/lib/students/statsTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function StatsCharts({ data }: { data: StatsDashboardData }) {
  const cardBase = "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm";
  const chartWrapBase = "h-[220px] w-full min-w-0";
  const cardTitle = "text-sm font-semibold text-slate-900";
  const cardSubtitle = "text-xs text-slate-500";
  const tooltipStyle = {
    backgroundColor: "white",
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    fontSize: 12,
    padding: "8px 10px",
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className={cardBase}>
          <p className={cardTitle}>Répartition des statuts</p>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <BarChart data={data.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value">
                  {data.statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <p className={cardTitle}>Genre</p>
          <div className={chartWrapBase}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <PieChart>
                <Pie data={data.genderData} 
                dataKey="value"
                nameKey="name" 
                outerRadius={60} 
                label
                labelLine>
                  {data.genderData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <p className={cardTitle}>Au pair</p>
          <div className={chartWrapBase}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <PieChart>
                <Pie
                  data={data.auPairData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={30}
                  outerRadius={60}
                  label
                  labelLine
                >
                  {data.auPairData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <p className={cardTitle}>Inscriptions avec pré-inscription</p>
          <div className={chartWrapBase}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <PieChart>
                <Pie
                  data={data.enrolledPreRegData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                  label
                  labelLine
                >
                  {data.enrolledPreRegData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
        <div className={cardBase}>
          <div className="flex items-center justify-between">
            <p className={cardTitle}>Lieux de naissance</p>
            <p className={cardSubtitle}>Top lieux</p>
          </div>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <BarChart data={data.birthPlaceData} layout="vertical" margin={{ left: -50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#FB7185" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <p className={cardTitle}>Âges</p>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <BarChart data={data.ageBuckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#A78BFA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <p className={cardTitle}>Âges × Genre</p>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <BarChart data={data.ageGenderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="M" stackId="gender" fill="#F59E0B" name="Mr" />
                <Bar dataKey="F" stackId="gender" fill="#38BDF8" name="Mrs" />
                <Bar dataKey="X" stackId="gender" fill="#A78BFA" name="X" />
                <Bar dataKey="ND" stackId="gender" fill="#CBD5F5" name="ND" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={cardBase}>
          <p className={cardTitle}>Arrivées par mois</p>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <LineChart data={data.arrivals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex items-center justify-between">
            <p className={cardTitle}>Répartition par classe</p>
            <p className={cardSubtitle}>Top classes</p>
          </div>
          <div className={`mt-4 ${chartWrapBase}`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
              <BarChart data={data.classData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
