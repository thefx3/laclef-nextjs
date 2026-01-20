// components/accueil/FeaturedSidebar.tsx
import { fetchPostsServer } from "@/lib/posts/postsRepo.server";

import FeaturedSidebarClient from "./FeaturedSidebarClient";

export default async function FeaturedSidebar() {
  const posts = await fetchPostsServer();
  return <FeaturedSidebarClient initialPosts={posts} />;
}
