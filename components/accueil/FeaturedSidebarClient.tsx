"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/posts/types";
import { startOfDay, formatRemainingDays } from "@/lib/posts/calendarUtils";
import PostModal from "@/components/accueil/calendar/PostModal";
import PostEditModal from "@/components/accueil/calendar/PostEditModal";
import { deletePostApi, updatePostApi } from "@/lib/posts/postsApi.client";

export default function FeaturedSidebarClient({ initialPosts }: { initialPosts: Post[] }) {
  const [items, setItems] = useState<Post[]>(initialPosts);
  const [selected, setSelected] = useState<Post | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const today = startOfDay(new Date());

  const featured = useMemo(() => {
    return items.filter((post) => {
      if (post.type !== "A_LA_UNE") return false;
      const start = startOfDay(post.startAt);
      const end = startOfDay(post.endAt ?? post.startAt);
      return start <= today && end >= today;
    });
  }, [items, today]);

  async function handleDelete(post: Post | null) {
    if (!post) return;
    // optimistic
    setItems((prev) => prev.filter((p) => p.id !== post.id));
    setSelected(null);
    setEditing(null);

    try {
      await deletePostApi(post.id);
    } catch (e) {
      // rollback simple (on remet tout)
      setItems(initialPosts);
      alert((e as Error).message);
    }
  }

  async function handleSave(
    post: Post | null,
    input: {
      content: string;
      type: Post["type"];
      startAt: Date;
      endAt?: Date;
      authorName: string;
      authorEmail?: string;
    }
  ) {
    if (!post) return;
    setSaving(true);
    try {
      const updated = await updatePostApi(post.id, input);
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditing(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <aside className="flex w-full flex-col rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-sm lg:w-64 h-[fit-content]">
        <div className="bg-[var(--primary)] py-4 text-center text-xl font-bold uppercase tracking-[0.25em] text-[var(--surface)]">
          A la une
        </div>

        <div className="flex flex-1 flex-col">
          {featured.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-center text-sm text-[var(--muted-subtle)] p-4">
              Rien pour le moment
            </p>
          ) : (
            <ul className="space-y-3 p-3">
              {featured.map((post) => (
                <li
                  key={post.id}
                  className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-2 text-sm transition-colors hover:bg-[var(--muted-bg-hover)]"
                  onClick={() => setSelected(post)}
                >
                  <div className="font-semibold text-[var(--foreground)] leading-snug line-clamp-2">
                    {post.content || "Sans contenu"}
                  </div>

                  <div className="text-xs text-[var(--muted)]">
                    {formatRemainingDays(post.startAt, post.endAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onEdit={(p) => {
            setEditing(p);
            setSelected(null);
          }}
          onDelete={(p) => void handleDelete(p)}
        />
      )}

      {editing && (
        <PostEditModal
          post={editing}
          saving={saving}
          onCancel={() => setEditing(null)}
          onDelete={() => void handleDelete(editing)}
          onSave={(input) => void handleSave(editing, input)}
        />
      )}
    </div>
  );
}
