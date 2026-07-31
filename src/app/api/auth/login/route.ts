import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null && "password" in body
    ? String((body as { password: unknown }).password)
    : "";

  if (!password || !(await verifyPassword(password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE.maxAgeSeconds,
    path: "/",
  });
  return response;
}
