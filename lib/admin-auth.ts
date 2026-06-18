import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "dreamscape_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? null;
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeCompare(a: string, b: string) {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function createAdminSessionToken() {
  const secret = getAdminPassword();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${signPayload(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  const secret = getAdminPassword();
  if (!secret || !token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expected = signPayload(payload, secret);
  return safeCompare(signature, expected);
}

export function verifyAdminPassword(password: string) {
  const secret = getAdminPassword();
  if (!secret) {
    return false;
  }

  if (password.length !== secret.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(password), Buffer.from(secret));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function requireAdminApi() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const };
}
