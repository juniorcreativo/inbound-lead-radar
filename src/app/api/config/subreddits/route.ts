import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subreddits = await prisma.subredditConfig.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ subreddits });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body === "object" && body !== null && "name" in body
    ? String((body as { name: unknown }).name).trim().replace(/^r\//, "")
    : "";

  if (!name) {
    return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
  }

  const subreddit = await prisma.subredditConfig.create({ data: { name } });
  return NextResponse.json({ subreddit }, { status: 201 });
}
