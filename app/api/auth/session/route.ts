import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getTokenExpiry } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  const token = req.cookies.get("auth-token")?.value;

  if (!user || !token) {
    return NextResponse.json({ user: null, expiresAt: null });
  }

  const expiresAt = getTokenExpiry(token);

  return NextResponse.json({ user, expiresAt });
}

