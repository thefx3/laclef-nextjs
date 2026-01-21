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
      <div className="space-y-4 text-[var(--foreground)]">
        <div className="flex items-center justify-between gap-3">
          <PostPill type={post.type} />
          <div className="flex items-center gap-2 mr-6">
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
          <p className="text-base leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
            {post.content}
          </p>
        ) : null}

        <div className="rounded-xl border border-white/70 bg-white/70 p-3 text-sm text-[var(--muted)]">
          <div>
            Posté par  : <span className="font-medium">{post.authorName}</span>
          </div>
          <div>
            Créé le :{" "}
            {post.created_at.toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
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
          <div>
            Modifié le : {post.updated_at.toLocaleString("fr-FR", {
              dateStyle: "short",
              // timeStyle: "short",
            })} | {post.authorName}
          </div>
        </div>
      </div>
    </Modal>
  );
}
