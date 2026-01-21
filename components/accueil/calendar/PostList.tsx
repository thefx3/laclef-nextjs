"use client";

import type { Post } from "@/lib/posts/types";
import { getPostTypeBadgeClass, getPostTypeBorderClass } from "@/lib/posts/types";

export default function PostList({
  posts,
  onSelectPost,
  remaining = 0,
  onShowMore,
  showMeta = false,
}: {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  remaining?: number;
  onShowMore?: () => void;
  showMeta?: boolean;
}) {
  if (posts.length === 0) {
    return <p className="text-sm text-[var(--muted-subtle)]">Aucun évènement.</p>;
  }

  return (
    <ul className="px-4 py-2 space-y-2">
      {posts.map((p) => (
        <li
          key={p.id}
          className={`cursor-pointer rounded-lg border border-l-4 border-slate-200/70 bg-slate-50/90 px-2.5 py-1.5 text-xs shadow-sm transition-colors hover:bg-white ${getPostTypeBorderClass(
            p.type
          )}`}
          onClick={() => onSelectPost(p)}
          role="button"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPostTypeBadgeClass(
                p.type
              )}`}
            >
              {p.type}
            </span>
          </div>
          <div className="font-medium text-[var(--foreground)] line-clamp-2">
            {p.content || "Sans contenu"}
          </div>
          {showMeta ? (
            <div className="text-[10px] text-[var(--muted-subtle)]">
              {p.created_at.toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })}{" "}
              · {p.authorName}
            </div>
          ) : null}
        </li>
      ))}
      {remaining > 0 && onShowMore ? (
        <li>
          <button
            type="button"
            onClick={onShowMore}
            className="w-full rounded-lg border border-dashed border-slate-200/70 bg-slate-50/80 p-2 text-[10px] font-semibold text-slate-500 hover:bg-white"
          >
            +{remaining} autres
          </button>
        </li>
      ) : null}
    </ul>
  );
}
