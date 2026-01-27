export type StatColorDatum = {
  name: string;
  value: number;
  color: string;
};

export type StatLabelDatum = {
  label: string;
  value: number;
};

export type AgeGenderDatum = {
  label: string;
  M: number;
  F: number;
  X: number;
  ND: number;
};

export type StatsTotals = {
  total: number;
  enrolled: number;
  pre: number;
  lead: number;
  left: number;
};

export type StatsDashboardData = {
  totals: StatsTotals;
  avgStayDays: number | null;
  avgStayPercent: number | null;
  statusData: StatColorDatum[];
  genderData: StatColorDatum[];
  auPairData: StatColorDatum[];
  enrolledPreRegData: StatColorDatum[];
  classData: StatLabelDatum[];
  birthPlaceData: StatLabelDatum[];
  ageBuckets: StatLabelDatum[];
  ageGenderData: AgeGenderDatum[];
  arrivals: { month: string; value: number }[];
};
