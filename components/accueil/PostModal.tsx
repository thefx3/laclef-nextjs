"use client";

import type { Post } from "@/lib/posts/types";
import Modal from "@/components/ui/Modal";
import PostPill from "./PostPill";

export default function PostModal({ post, onClose,}: { post: Post; onClose: () => void;}) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <PostPill type={post.type} />
        </div>

        {post.content ? (
          <p className="text-lg text-gray-700 whitespace-pre-wrap">
            {post.content}
          </p>
        ) : null}

        <div className="text-md text-gray-500 space-y-1">
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
