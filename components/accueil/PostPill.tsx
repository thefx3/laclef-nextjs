import type { PostType } from "@/lib/posts/types";
import { getPostTypeBadgeClass } from "@/lib/posts/postTypeStyles";

export default function PostPill({ type }: { type: PostType }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getPostTypeBadgeClass(
        type
      )}`}
    >
      {type}
    </span>
  );
}
