import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import SeasonManager from "@/components/flce/SeasonManager";

export default function FlceOrganisation() {
  return (
    <PageShell>
      <PageHeader title="Organisation" />
      <SeasonManager />
    </PageShell>
  );
}
