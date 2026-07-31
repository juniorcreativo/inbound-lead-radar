import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/client";

export interface LeadStats {
  totalLeads: number;
  leadsThisWeek: number;
  replyRate: number;
  conversions: number;
  byPlatform: { name: string; count: number }[];
  bySubreddit: { name: string; count: number }[];
}

export async function getLeadStats(): Promise<LeadStats> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalLeads, leadsThisWeek, statusCounts, subredditCounts, platformCounts] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { foundAt: { gte: oneWeekAgo } } }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["subreddit"], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["platform"], _count: { _all: true } }),
    ]);

  const countFor = (status: LeadStatus) =>
    statusCounts.find((s) => s.status === status)?._count._all ?? 0;

  const engaged =
    countFor(LeadStatus.DRAFT_READY) +
    countFor(LeadStatus.REPLIED) +
    countFor(LeadStatus.CONVERTED) +
    countFor(LeadStatus.IGNORED);
  const replied = countFor(LeadStatus.REPLIED) + countFor(LeadStatus.CONVERTED);
  const replyRate = engaged > 0 ? Math.round((replied / engaged) * 100) : 0;

  return {
    totalLeads,
    leadsThisWeek,
    replyRate,
    conversions: countFor(LeadStatus.CONVERTED),
    byPlatform: platformCounts.map((p) => ({ name: p.platform, count: p._count._all })),
    bySubreddit: subredditCounts
      .filter((s) => s.subreddit)
      .map((s) => ({ name: s.subreddit as string, count: s._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}
