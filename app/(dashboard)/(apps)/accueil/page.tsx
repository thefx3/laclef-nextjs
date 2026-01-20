import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import CalendarViewClient from "@/components/accueil/CalendarViewClient";
import { fetchPostsServer } from "@/lib/posts/postsRepo.server";

export default async function AccueilPage() {
  const posts = await fetchPostsServer();

  return (
    <PageShell>
      <PageHeader title="Calendrier des évènements" />
      <CalendarViewClient posts={posts} />
    </PageShell>
  );
}
