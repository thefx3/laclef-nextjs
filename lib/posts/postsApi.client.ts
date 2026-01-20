import type { Post, PostType } from "./types";
import { supabase } from "@/lib/supabase/browser";

type UpdateInput = {
  content: string;
  type: PostType;
  startAt: Date;
  endAt?: Date;
  authorName: string;
  authorEmail?: string;
};

export async function updatePostApi(id: string, input: UpdateInput) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const payload = {
    content: input.content,
    type: input.type,
    start_at: input.startAt.toISOString(),
    end_at: input.endAt ? input.endAt.toISOString() : null,
    author_name: input.authorName,
    author_email: input.authorEmail ?? null,
  };

  const res = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Update failed");
  }

  const json = (await res.json()) as { post: any };

  // On retourne un Post (en Date)
  const row = json.post;
  const post: Post = {
    id: row.id,
    content: row.content,
    type: row.type,
    startAt: new Date(row.start_at),
    endAt: row.end_at ? new Date(row.end_at) : undefined,
    authorName: row.author_name,
    authorEmail: row.author_email ?? undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    author_id: row.author_id ?? undefined,
  };

  return post;
}

export async function deletePostApi(id: string) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Delete failed");
  }
}
