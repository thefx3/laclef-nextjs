import type { Post, PostType } from "./types";

export type PostRow = {
  id: string;
  content: string;
  type: PostType;
  start_at: string;
  end_at: string | null;
  author_name: string;
  author_email: string | null;
  created_at: string;
  updated_at: string;
  author_id?: string | null;
};

export function splitContent(content: string) {
  const parts = content.split("\n\n");
  const title = (parts[0] ?? "").trim();
  const description =
    parts.length > 1 ? parts.slice(1).join("\n\n").trim() : undefined;
  return { title, description };
}

export function composeContent(title: string, description?: string) {
  const t = title.trim();
  const d = description?.trim();
  return d ? `${t}\n\n${d}` : t;
}

export function rowToPost(row: PostRow): Post {
  const { title, description } = splitContent(row.content);

  return {
    id: row.id,
    content: row.content,
    type: row.type,
    startAt: new Date(row.start_at),
    endAt: row.end_at ? new Date(row.end_at) : undefined,
    authorName: row.author_name,
    authorEmail: row.author_email ?? undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}
