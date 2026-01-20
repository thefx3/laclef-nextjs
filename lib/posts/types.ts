export type PostType =
  | "A_LA_UNE"
  | "EVENT"
  | "ABSENCE"
  | "RETARD"
  | "REMPLACEMENT";

export type Post = {
  id: string;
  content: string;
  type: PostType;
  startAt: Date;
  endAt?: Date;
  authorName: string;
  authorEmail?: string;
  created_at: Date;
  updated_at: Date;
  author_id?: string;
};

