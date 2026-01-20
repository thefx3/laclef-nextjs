"use client";

import type { Post } from "@/lib/posts/types";
import CalendarView from "@/components/accueil/CalendarView";

type Props = {
  posts: Post[];
};

export default function CalendarViewClient({ posts }: Props) {
  return <CalendarView posts={posts} />;
}
