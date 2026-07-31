import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetail } from "@/components/leads/LeadDetail";
import type { SerializedLead } from "@/types";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    notFound();
  }

  const serializedLead = JSON.parse(JSON.stringify(lead)) as SerializedLead;

  return <LeadDetail lead={serializedLead} />;
}
