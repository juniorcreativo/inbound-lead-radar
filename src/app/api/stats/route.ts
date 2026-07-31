import { NextResponse } from "next/server";
import { getLeadStats } from "@/lib/stats";

export async function GET() {
  const stats = await getLeadStats();
  return NextResponse.json(stats);
}
