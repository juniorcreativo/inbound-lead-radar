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

  const { enabled, pollPosts, pollComments } = (body ?? {}) as {
    enabled?: boolean;
    pollPosts?: boolean;
    pollComments?: boolean;
  };

  const data: { enabled?: boolean; pollPosts?: boolean; pollComments?: boolean } = {};
  if (enabled !== undefined) data.enabled = enabled;
  if (pollPosts !== undefined) data.pollPosts = pollPosts;
  if (pollComments !== undefined) data.pollComments = pollComments;

  const subreddit = await prisma.subredditConfig.update({ where: { id }, data });
  return NextResponse.json({ subreddit });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.subredditConfig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
