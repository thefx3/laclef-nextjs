import type { Post, PostType } from "@/lib/posts/types";
import { startOfDay, addDays } from "@/lib/posts/calendarUtils";

export type PrimaryScope = "ALL" | "MINE";

export type SecondaryFilter =
  | "ALL"
  | "TODAY"
  | "YESTERDAY"
  | "SINCE_WEEK"
  | "PAST"
  | "FUTURE"
  | "ON_DATE";

export type FilterState = {
  scope: PrimaryScope;
  secondary: SecondaryFilter;
  date?: Date; // utilisé si ON_DATE
  type?: PostType | "ALL";
  author?: string | "ALL"; // authorName
  search?: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function isInRange(post: Post, target: Date) {
  const t = startOfDay(target);
  const start = startOfDay(post.startAt);
  const end = startOfDay(post.endAt ?? post.startAt);
  return start <= t && t <= end;
}

function isPast(post: Post, today: Date) {
  const end = startOfDay(post.endAt ?? post.startAt);
  return end < today;
}

function isFuture(post: Post, today: Date) {
  const start = startOfDay(post.startAt);
  return start > today;
}

export function filterPosts(params: {
  posts: Post[];
  state: FilterState;
  today?: Date;
  userId?: string;
  userEmail?: string | null;
}) {
  const { posts, state, userId, userEmail } = params;
  const today = startOfDay(params.today ?? new Date());

  // 0) scope (MES POSTES / TOUS)
  let out = posts;

  if (state.scope === "MINE") {
    out = out.filter((p) => {
      // priorité à author_id si tu le remplis
      if (userId && p.author_id) return p.author_id === userId;
      if (userEmail && p.authorEmail) return p.authorEmail === userEmail;
      return false;
    });
  }

  // 1) secondary (dates)
  if (state.secondary === "TODAY") {
    out = out.filter((p) => isInRange(p, today));
  } else if (state.secondary === "YESTERDAY") {
    const y = addDays(today, -1);
    out = out.filter((p) => isInRange(p, y));
  } else if (state.secondary === "SINCE_WEEK") {
    const from = addDays(today, -7);
    out = out.filter((p) => startOfDay(p.created_at) >= startOfDay(from));
  } else if (state.secondary === "PAST") {
    out = out.filter((p) => isPast(p, today));
  } else if (state.secondary === "FUTURE") {
    out = out.filter((p) => isFuture(p, today));
  } else if (state.secondary === "ON_DATE" && state.date) {
    out = out.filter((p) => isInRange(p, state.date!));
  }

  // 2) type
  if (state.type && state.type !== "ALL") {
    out = out.filter((p) => p.type === state.type);
  }

  // 3) author (désactivé en mode MINE côté UI, mais on le garde safe)
  if (state.author && state.author !== "ALL") {
    out = out.filter((p) => (p.authorName ?? "") === state.author);
  }

  // 4) search
  const q = normalize(state.search ?? "");
  if (q) {
    out = out.filter((p) => {
      const hay = normalize(
        `${p.content} ${p.authorName ?? ""} ${p.authorEmail ?? ""} ${p.type}`
      );
      return hay.includes(q);
    });
  }

  // 5) tri final (toujours récent -> ancien)
  out = [...out].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  return out;
}

export function uniqueAuthors(posts: Post[]) {
  const set = new Set<string>();
  for (const p of posts) {
    if (p.authorName?.trim()) set.add(p.authorName.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
