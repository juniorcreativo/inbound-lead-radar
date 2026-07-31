import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/client";

const VALID_STATUSES = new Set(Object.values(LeadStatus));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { status, draftReply } = (body ?? {}) as {
    status?: string;
    draftReply?: string;
  };

  const data: { status?: LeadStatus; draftReply?: string; repliedAt?: Date } = {};

  if (status !== undefined) {
    if (!VALID_STATUSES.has(status as LeadStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status as LeadStatus;
    if (status === LeadStatus.REPLIED) {
      data.repliedAt = new Date();
    }
  }

  if (draftReply !== undefined) {
    data.draftReply = draftReply;
  }

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json({ lead });
}
