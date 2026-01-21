import UsersPage from "@/components/UsersPage";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

export default function MusiqueUsers() {
  return (
    <PageShell>
      <PageHeader title="Utilisateurs" />
      <UsersPage />
    </PageShell>
  );
}
