export type PostType =
  | "A_LA_UNE"
  | "EVENT"
  | "ABSENCE"
  | "INFO"
  | "RETARD"
  | "REMPLACEMENT";

export type Post = {
  id: string;
  content: string;
  type: PostType;
  startAt: Date;
  endAt?: Date;
  authorName: string;
  authorEmail?: string;
  created_at: Date;
  updated_at: Date;
  author_id?: string;
};

export type FilterMode = "all" | "today" | "sinceYesterday" | "sinceWeek" | "onDate";

export const TYPE_OPTIONS: PostType[] = [
  "A_LA_UNE",
  "ABSENCE",
  "EVENT",
  "INFO",
  "REMPLACEMENT",
  "RETARD",
];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  A_LA_UNE: "À la une",
  ABSENCE: "Absence",
  EVENT: "Évènement",
  INFO: "Info",
  REMPLACEMENT: "Remplacement",
  RETARD: "Retard",
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  A_LA_UNE: "#f59e0b",
  ABSENCE: "#fb7185",
  EVENT: "#34d399",
  INFO: "#38bdf8",
  REMPLACEMENT: "#818cf8",
  RETARD: "#fb923c",
};

const POST_TYPE_STYLES: Record<
  PostType,
  { bar: string; badge: string; border: string }
> = {
  A_LA_UNE: {
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-l-amber-400",
  },
  EVENT: {
    bar: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-l-emerald-400",
  },
  ABSENCE: {
    bar: "bg-rose-400",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    border: "border-l-rose-400",
  },
  INFO: {
    bar: "bg-sky-400",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-l-sky-400",
  },
  REMPLACEMENT: {
    bar: "bg-indigo-400",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    border: "border-l-indigo-400",
  },
  RETARD: {
    bar: "bg-orange-400",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    border: "border-l-orange-400",
  },
};

export function getPostTypeBarClass(type: PostType) {
  return POST_TYPE_STYLES[type]?.bar ?? "bg-slate-400";
}

export function getPostTypeBadgeClass(type: PostType) {
  return (
    POST_TYPE_STYLES[type]?.badge ??
    "bg-slate-100 text-slate-700 border-slate-200"
  );
}

export function getPostTypeBorderClass(type: PostType) {
  return POST_TYPE_STYLES[type]?.border ?? "border-l-slate-300";
}
