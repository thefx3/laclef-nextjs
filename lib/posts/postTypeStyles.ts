import type { PostType } from "./types";

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
