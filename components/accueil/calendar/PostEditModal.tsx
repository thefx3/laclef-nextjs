"use client";

import { useMemo, useState } from "react";
import type { Post, PostType } from "@/lib/posts/types";
import Modal from "@/components/ui/Modal"; // si tu l'as déjà; sinon tu me dis

const TYPES: { value: PostType; label: string }[] = [
  { value: "A_LA_UNE", label: "À la une" },
  { value: "EVENT", label: "Évènement" },
  { value: "ABSENCE", label: "Absence" },
  { value: "RETARD", label: "Retard" },
  { value: "REMPLACEMENT", label: "Remplacement" },
];

type Props = {
  post: Post;
  onCancel: () => void;
  onSave: (input: {
    content: string;
    type: PostType;
    startAt: Date;
    endAt?: Date;
    authorName: string;
    authorEmail?: string;
  }) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  saving?: boolean;
};

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return new Date(year, month - 1, day);
}

export default function PostEditModal({ post, onCancel, onSave, onDelete, saving }: Props) {
  const initial = useMemo(() => post.content ?? "", [post.content]);

  const [content, setContent] = useState(initial);
  const [type, setType] = useState<PostType>(post.type);

  const [startAt, setStartAt] = useState(toDateInputValue(post.startAt));
  const [endAt, setEndAt] = useState(post.endAt ? toDateInputValue(post.endAt) : "");

  return (
    <Modal onClose={onCancel}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--surface)] p-4 sm:p-6">

        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!content.trim()) return;
            onSave({
              content,
              type,
              startAt: fromDateInputValue(startAt),
              endAt: endAt ? fromDateInputValue(endAt) : undefined,
              authorName: post.authorName,
              authorEmail: post.authorEmail,
            });
          }}
        >
         <div className="flex flex-col gap-2 w-full">
            <label className="text-md font-medium text-[var(--foreground)]" htmlFor="edit-type">
              Type d&apos;évènement
            </label>
            <select
              id="edit-type"
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <textarea
              id="edit-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-start-date">
              Date de début
            </label>
            <input
              id="edit-start-date"
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-end-date">
              Date de fin (optionnel)
            </label>
            <input
              id="edit-end-date"
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            {onDelete ? (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--danger)] px-3 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--surface)] disabled:opacity-60"
                onClick={onDelete}
                disabled={saving}
              >
                Supprimer
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--muted-bg-hover)]"
                onClick={onCancel}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-60"
                disabled={saving || !content.trim()}
              >
                {saving ? "Enregistrement..." : "Mettre a jour"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
