import { NextRequest, NextResponse } from "next/server";

// Verifies the pre-release password. On success sets an httpOnly cookie equal to
// GATE_TOKEN; proxy.ts checks for that exact value. See proxy.ts for the gate.

export async function POST(req: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  const token = process.env.GATE_TOKEN;

  let password = "";
  try {
    const body = await req.json();
    if (body && typeof body.password === "string") password = body.password;
  } catch {
    password = "";
  }

  if (!expected || !token || password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "pinpoint_gate",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
