import { StatCard } from "./StatCard";
import { SubredditBreakdownChart } from "./SubredditBreakdownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeadStats } from "@/lib/stats";

export function StatsOverview({ stats }: { stats: LeadStats }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="This Week" value={stats.leadsThisWeek} />
        <StatCard label="Reply Rate" value={`${stats.replyRate}%`} />
        <StatCard label="Converted" value={stats.conversions} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubredditBreakdownChart data={stats.bySubreddit} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Platform</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.byPlatform.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            ) : (
              stats.byPlatform.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{p.name}</span>
                  <span className="font-medium">{p.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
