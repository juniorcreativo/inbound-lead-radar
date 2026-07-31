import { getLeadStats } from "@/lib/stats";
import { StatsOverview } from "@/components/stats/StatsOverview";

export default async function StatsPage() {
  const stats = await getLeadStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Stats</h1>
        <p className="text-muted-foreground">Lead pipeline performance at a glance.</p>
      </div>
      <StatsOverview stats={stats} />
    </div>
  );
}
