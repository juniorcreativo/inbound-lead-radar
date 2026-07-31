import { NextResponse } from "next/server";
import { isValidCronSecret } from "@/lib/cronSecret";
import { runRedditPoll } from "@/lib/reddit/poll";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const triggeredBy = request.headers.get("x-triggered-by") ?? "manual";
  const summary = await runRedditPoll(triggeredBy);

  return NextResponse.json(summary);
}
