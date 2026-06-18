import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function GET() {
  const ok = await isAdminAuthenticated();
  return NextResponse.json({ ok });
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin password is not configured" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, adminSessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...adminSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
