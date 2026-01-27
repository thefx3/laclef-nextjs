import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import SettingsNav from "@/components/settings/SettingsNav";

export default function SettingsShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <PageHeader title={title} />
      <SettingsNav />
      {children}
    </PageShell>
  );
}
