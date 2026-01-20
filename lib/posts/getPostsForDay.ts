import type { Post } from "./types";
import { startOfDay } from "@/lib/posts/calendarUtils";

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function getPostsForDay(posts: Post[], day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return posts.filter((p) => {
    const pStart = p.startAt;
    const pEnd = p.endAt ?? p.startAt;
    return pStart <= dayEnd && pEnd >= dayStart;
  });
}
