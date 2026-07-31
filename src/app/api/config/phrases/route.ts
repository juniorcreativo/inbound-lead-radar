import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const phrases = await prisma.intentPhrase.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ phrases });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { phrase, type } = (body ?? {}) as { phrase?: string; type?: string };
  const trimmedPhrase = phrase?.trim().toLowerCase() ?? "";

  if (!trimmedPhrase) {
    return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
  }
  if (type !== "INCLUDE" && type !== "EXCLUDE") {
    return NextResponse.json({ error: "Type must be INCLUDE or EXCLUDE" }, { status: 400 });
  }

  const created = await prisma.intentPhrase.create({
    data: { phrase: trimmedPhrase, type },
  });
  return NextResponse.json({ phrase: created }, { status: 201 });
}
