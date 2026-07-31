import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDraftReply } from "@/lib/gemini/draft";
import { LeadStatus } from "@/generated/prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  let draftReply: string;
  try {
    draftReply = await generateDraftReply({
      subreddit: lead.subreddit,
      sourceType: lead.sourceType,
      title: lead.title,
      fullText: lead.fullText,
      needSummary: lead.needSummary,
      nicheTag: lead.nicheTag,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate draft: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      draftReply,
      draftGeneratedAt: new Date(),
      status: lead.status === LeadStatus.NEW ? LeadStatus.DRAFT_READY : lead.status,
    },
  });

  return NextResponse.json({ lead: updated });
}
