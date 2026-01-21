"use client";

import type { Post } from "@/lib/posts/types";
import { getPostTypeBadgeClass, getPostTypeBorderClass, POST_TYPE_LABELS } from "@/lib/posts/types";
import { formatShortFR } from "@/lib/posts/calendarUtils";

export default function PostsList({
  posts,
  onSelect,
}: {
  posts: Post[];
  onSelect: (post: Post) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Aucun post pour ces filtres.
      </div>
    );
  }

  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => {
        const start = formatShortFR(p.startAt);
        const end = p.endAt ? formatShortFR(p.endAt) : null;

        return (
          <li
            key={p.id}
            className={`group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md border-l-4 ${getPostTypeBorderClass(
              p.type
            )}`}
            onClick={() => onSelect(p)}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getPostTypeBadgeClass(
                  p.type
                )}`}
              >
                {POST_TYPE_LABELS[p.type]}
              </span>
              <span className="text-slate-300 group-hover:text-slate-400">→</span>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {start}
              {end ? ` → ${end}` : ""}
            </div>

            <div className="mt-2 line-clamp-3 text-sm font-semibold text-slate-900">
              {p.content}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <span>
                {p.authorName}
                {p.authorEmail ? ` · ${p.authorEmail}` : ""}
              </span>
              <span className="text-slate-400">
                créé le {p.created_at.toLocaleDateString("fr-FR")}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
