import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import PostsArchiveClient from "@/components/accueil/posts/PostsArchiveClient";
import { fetchPostsServer } from "@/lib/posts/postsRepo.server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccueilPosts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const posts = await fetchPostsServer();

  return (
    <PageShell>
      <PageHeader title="Postes" />
      <PostsArchiveClient
        initialPosts={posts}
        userId={user.id}
        userEmail={user.email ?? null}
      />
    </PageShell>
  );
}
