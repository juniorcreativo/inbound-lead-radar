import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const { enabled } = (body ?? {}) as { enabled?: boolean };
  if (enabled === undefined) {
    return NextResponse.json({ error: "enabled is required" }, { status: 400 });
  }

  const phrase = await prisma.intentPhrase.update({ where: { id }, data: { enabled } });
  return NextResponse.json({ phrase });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.intentPhrase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
