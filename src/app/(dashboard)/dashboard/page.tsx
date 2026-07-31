import { prisma } from "@/lib/prisma";
import { LeadStatus, Prisma } from "@/generated/prisma/client";
import { FilterBar } from "@/components/leads/FilterBar";
import { LeadList } from "@/components/leads/LeadList";
import type { SerializedLead } from "@/types";

const VALID_STATUSES = new Set(Object.values(LeadStatus));

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const subreddit = typeof params.subreddit === "string" ? params.subreddit : undefined;
  const confidence = typeof params.confidence === "string" ? params.confidence : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const where: Prisma.LeadWhereInput = {};
  if (subreddit) where.subreddit = subreddit;
  if (confidence) where.confidenceLabel = confidence;
  if (status && VALID_STATUSES.has(status as LeadStatus)) where.status = status as LeadStatus;
  if (from || to) {
    where.foundAt = {};
    if (from) where.foundAt.gte = new Date(from);
    if (to) where.foundAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const [leads, subredditConfigs] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { foundAt: "desc" }, take: 200 }),
    prisma.subredditConfig.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serializedLeads = JSON.parse(JSON.stringify(leads)) as SerializedLead[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-muted-foreground">
          {leads.length} lead{leads.length === 1 ? "" : "s"} matching current filters
        </p>
      </div>
      <FilterBar subreddits={subredditConfigs.map((s) => s.name)} />
      <LeadList leads={serializedLeads} />
    </div>
  );
}
