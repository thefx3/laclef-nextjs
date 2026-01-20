"use client";

import type { Post } from "@/lib/posts/types";
import Modal from "@/components/ui/Modal";
import PostPill from "./PostPill";

export default function PostModal({
  post,
  onClose,
  onEdit,
  onDelete,
}: {
  post: Post;
  onClose: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-3 text-[var(--foreground)]">
        <div className="flex items-center justify-between gap-3">
          <PostPill type={post.type} />
          <div className="flex items-center gap-3 mr-6">
            {onEdit ? (
              <button
                className="btn-action btn-action--edit"
                onClick={() => onEdit(post)}
                type="button"
              >
                Modifier
              </button>
            ) : null}

            {onDelete ? (
              <button
                className="btn-action btn-action--delete"
                onClick={() => onDelete(post)}
                type="button"
              >
                Supprimer
              </button>
            ) : null}
          </div>
        </div>

        {post.content ? (
          <p className="text-lg whitespace-pre-wrap text-[var(--foreground)]">
            {post.content}
          </p>
        ) : null}

        <div className="text-md space-y-1 mt-3 text-[var(--muted)]">
          <div>
            Posté par  : <span className="font-medium">{post.authorName}</span>
          </div>
          <div>
            Début :{" "}
            {post.startAt.toLocaleString("fr-FR", {
              dateStyle: "short",
              // timeStyle: "short",
            })}
          </div>
          <div>
            Fin :{" "}
            {post.endAt
              ? post.endAt.toLocaleString("fr-FR", {
                  dateStyle: "short",
                  // timeStyle: "short",
                })
              : "—"}
          </div>
        </div>
      </div>
    </Modal>
  );
}
