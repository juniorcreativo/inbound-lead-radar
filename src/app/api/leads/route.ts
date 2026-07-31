import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus, Prisma } from "@/generated/prisma/client";

const VALID_STATUSES = new Set(Object.values(LeadStatus));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const platform = searchParams.get("platform");
  const subreddits = searchParams.getAll("subreddit").filter(Boolean);
  const confidenceLabels = searchParams.getAll("confidence").filter(Boolean);
  const statuses = searchParams
    .getAll("status")
    .filter((s): s is LeadStatus => VALID_STATUSES.has(s as LeadStatus));
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.LeadWhereInput = {};
  if (platform) where.platform = platform;
  if (subreddits.length > 0) where.subreddit = { in: subreddits };
  if (confidenceLabels.length > 0) where.confidenceLabel = { in: confidenceLabels };
  if (statuses.length > 0) where.status = { in: statuses };
  if (from || to) {
    where.foundAt = {};
    if (from) where.foundAt.gte = new Date(from);
    if (to) where.foundAt.lte = new Date(to);
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { foundAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ leads });
}
