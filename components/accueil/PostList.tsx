"use client";

import type { Post } from "@/lib/posts/types";
import {
  getPostTypeBadgeClass,
  getPostTypeBorderClass,
} from "@/lib/posts/postTypeStyles";

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
    return <p className="text-sm text-gray-500">Aucun évènement.</p>;
  }

  return (
    <ul className="space-y-2">
      {posts.map((p) => (
        <li
          key={p.id}
          className={`cursor-pointer rounded border border-l-4 bg-gray-50 px-2 py-1 transition-colors hover:bg-gray-100 ${getPostTypeBorderClass(
            p.type
          )}`}
          onClick={() => onSelectPost(p)}
          role="button"
        >
          <div className="mb-1">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPostTypeBadgeClass(
                p.type
              )}`}
            >
              {p.type}
            </span>
          </div>
          <div className="font-medium text-gray-900 line-clamp-1">
            {p.content || "Sans contenu"}
          </div>
          {showMeta ? (
            <div className="text-[11px] text-gray-500">
              {p.created_at.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
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
            className="w-full rounded-lg border border-dashed p-2 text-xs text-gray-600 hover:bg-gray-50"
          >
            +{remaining} autres
          </button>
        </li>
      ) : null}
    </ul>
  );
}
