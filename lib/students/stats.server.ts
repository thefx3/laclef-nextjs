import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAge } from "@/lib/students/utils";
import type { AgeGenderDatum, StatColorDatum, StatsDashboardData } from "@/lib/students/statsTypes";

export type StudentStatRow = {
  record_kind: "LEAD" | "PRE_REGISTERED" | "ENROLLED" | "LEFT" | null;
  gender: "M" | "F" | "X" | null;
  is_au_pair: boolean | null;
  pre_registration: boolean | null;
  class_s1_code: string | null;
  class_s2_code: string | null;
  birth_place: string | null;
  birth_date: string | null;
  arrival_date: string | null;
  departure_date: string | null;
};

const palette = {
  emerald: "#10B981",
  amber: "#F59E0B",
  slate: "#64748B",
  sky: "#38BDF8",
  rose: "#FB7185",
  violet: "#A78BFA",
  neutral: "#CBD5F5",
};

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function withColor(
  items: Array<{ name: string; value: number }>,
  colorMap: Record<string, string>,
  fallback: string
): StatColorDatum[] {
  return items
    .map((item) => ({
      ...item,
      color: colorMap[item.name] ?? fallback,
    }))
    .filter((item) => item.value > 0);
}

export async function fetchStudentStatsRows(seasonId: string | null) {
  const supabase = await createClient();

  let query = supabase
    .from("students_with_classes")
    .select(
      "record_kind, gender, is_au_pair, pre_registration, class_s1_code, class_s2_code, birth_place, birth_date, arrival_date, departure_date"
    );

  if (seasonId) query = query.eq("season_id", seasonId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as StudentStatRow[];
}

export function buildStudentStats(
  rows: StudentStatRow[],
  seasonDurationDays?: number | null
): StatsDashboardData {
  const status = { enrolled: 0, pre: 0, lead: 0, left: 0 };
  const gender = { M: 0, F: 0, X: 0, unknown: 0 };
  const auPair = { yes: 0, no: 0, unknown: 0 };
  const enrolledPre = { yes: 0, no: 0 };
  const classCounts = new Map<string, number>();
  const birthPlaceCounts = new Map<string, number>();
  const ageBuckets = [
    { label: "<20", value: 0 },
    { label: "20-30", value: 0 },
    { label: "30-50", value: 0 },
    { label: "50+", value: 0 },
  ];
  const ageGenderData: AgeGenderDatum[] = [
    { label: "<20", M: 0, F: 0, X: 0, ND: 0 },
    { label: "20-30", M: 0, F: 0, X: 0, ND: 0 },
    { label: "30-50", M: 0, F: 0, X: 0, ND: 0 },
    { label: "50+", M: 0, F: 0, X: 0, ND: 0 },
  ];
  const arrivals = Array.from({ length: 12 }, (_, index) => ({
    month: monthLabels[index],
    value: 0,
  }));
  let stayTotalDays = 0;
  let stayCount = 0;

  rows.forEach((row) => {
    if (row.record_kind === "ENROLLED") status.enrolled += 1;
    else if (row.record_kind === "PRE_REGISTERED") status.pre += 1;
    else if (row.record_kind === "LEAD") status.lead += 1;
    else if (row.record_kind === "LEFT") status.left += 1;

    if (row.record_kind === "ENROLLED") {
      if (row.pre_registration === true) enrolledPre.yes += 1;
      else enrolledPre.no += 1;
    }

    if (row.gender === "M") gender.M += 1;
    else if (row.gender === "F") gender.F += 1;
    else if (row.gender === "X") gender.X += 1;
    else gender.unknown += 1;

    if (row.is_au_pair === true) auPair.yes += 1;
    else if (row.is_au_pair === false) auPair.no += 1;
    else auPair.unknown += 1;

    if (row.class_s1_code) {
      const key = row.class_s1_code.trim().toUpperCase();
      classCounts.set(key, (classCounts.get(key) ?? 0) + 1);
    }
    if (row.class_s2_code) {
      const key = row.class_s2_code.trim().toUpperCase();
      classCounts.set(key, (classCounts.get(key) ?? 0) + 1);
    }

    if (row.birth_place) {
      const key = row.birth_place.trim();
      if (key) birthPlaceCounts.set(key, (birthPlaceCounts.get(key) ?? 0) + 1);
    }

    const age = getAge(row.birth_date);
    if (age !== null) {
      let bucketIndex = 0;
      if (age <= 20) bucketIndex = 0;
      else if (age <= 30) bucketIndex = 1;
      else if (age <= 50) bucketIndex = 2;
      else bucketIndex = 3;

      ageBuckets[bucketIndex].value += 1;

      if (row.gender === "M") ageGenderData[bucketIndex].M += 1;
      else if (row.gender === "F") ageGenderData[bucketIndex].F += 1;
      else if (row.gender === "X") ageGenderData[bucketIndex].X += 1;
      else ageGenderData[bucketIndex].ND += 1;
    }

    if (row.arrival_date) {
      const month = new Date(row.arrival_date).getMonth();
      if (!Number.isNaN(month) && arrivals[month]) {
        arrivals[month].value += 1;
      }
    }

    if (row.arrival_date && row.departure_date) {
      const arrival = new Date(row.arrival_date);
      const departure = new Date(row.departure_date);
      const diffMs = departure.getTime() - arrival.getTime();
      if (!Number.isNaN(diffMs) && diffMs >= 0) {
        stayTotalDays += Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        stayCount += 1;
      }
    }
  });

  const classData = Array.from(classCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const birthPlaceData = Array.from(birthPlaceCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const topBirthPlaces = birthPlaceData.slice(0, 8);
  if (birthPlaceData.length > 8) {
    const rest = birthPlaceData.slice(8).reduce((sum, item) => sum + item.value, 0);
    topBirthPlaces.push({ label: "Autres", value: rest });
  }

  const totals = {
    total: rows.length,
    enrolled: status.enrolled,
    pre: status.pre,
    lead: status.lead,
    left: status.left,
  };

  const avgStayDays = stayCount > 0 ? stayTotalDays / stayCount : null;
  const avgStayPercent =
    avgStayDays !== null && seasonDurationDays && seasonDurationDays > 0
      ? (avgStayDays / seasonDurationDays) * 100
      : null;

  const statusData = withColor(
    [
      { name: "Inscrits", value: totals.enrolled },
      { name: "Pre-inscrits", value: totals.pre },
      { name: "Leads", value: totals.lead },
      { name: "Sortis", value: totals.left },
    ],
    {
      Inscrits: palette.emerald,
      "Pre-inscrits": palette.amber,
      Leads: palette.sky,
      Sortis: palette.rose,
    },
    palette.neutral
  );

  const genderData = withColor(
    [
      { name: "Homme", value: gender.M },
      { name: "Femme", value: gender.F },
      { name: "X", value: gender.X },
      { name: "ND", value: gender.unknown },
    ],
    {
      Homme: palette.amber,
      Femme: palette.sky,
      X: palette.violet,
      ND: palette.neutral,
    },
    palette.neutral
  );

  const auPairData = withColor(
    [
      { name: "Au pair", value: auPair.yes },
      { name: "Non au pair", value: auPair.no },
      { name: "ND", value: auPair.unknown },
    ],
    {
      "Au pair": palette.sky,
      "Non au pair": palette.slate,
      ND: palette.neutral,
    },
    palette.neutral
  );

  const enrolledPreRegData = withColor(
    [
      { name: "Avec pré-inscription", value: enrolledPre.yes },
      { name: "Sans pré-inscription", value: enrolledPre.no },
    ],
    {
      "Avec pré-inscription": palette.emerald,
      "Sans pré-inscription": palette.slate,
    },
    palette.neutral
  );

  return {
    totals,
    avgStayDays,
    avgStayPercent,
    statusData,
    genderData,
    auPairData,
    enrolledPreRegData,
    classData,
    birthPlaceData: topBirthPlaces,
    ageBuckets,
    ageGenderData,
    arrivals,
  };
}
