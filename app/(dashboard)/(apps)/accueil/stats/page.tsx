import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import { fetchPostsServer } from "@/lib/posts/postsRepo.server";
import StatsClient  from "@/components/accueil/stats/StatsClient";

export default async function AccueilStats() {
   const posts = await fetchPostsServer();
  return (
    <PageShell>
      <PageHeader title="Stats" />
      <StatsClient initialPosts={posts} />
    </PageShell>
  );
}

