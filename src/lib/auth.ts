// ============================================================
// AUTH — Lightweight session-based auth (JWT-style tokens)
// ============================================================

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const TOKEN_COOKIE = "voyarion-token";
const SESSION_EXPIRY_DAYS = 7;

export function hashPassword(password: string): string {
  // Use a salted hash — for production-grade, swap to bcrypt/argon2.
  const salt = "voyarion-static-salt-v1";
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: { userId, token, expiresAt },
  });
  return token;
}

export async function getSessionUser(req?: Request) {
  try {
    let token: string | undefined;
    if (req) {
      const cookieHeader = req.headers.get("cookie") || "";
      token = parseCookies(cookieHeader)[TOKEN_COOKIE];
    } else {
      const c = await cookies();
      token = c.get(TOKEN_COOKIE)?.value;
    }
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: { include: { owner: true } } },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } });
      return null;
    }
    return {
      user: session.user,
      owner: session.user.owner,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  const expires = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}; Max-Age=${SESSION_EXPIRY_DAYS * 24 * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}

export async function destroySession(token: string) {
  try {
    await db.session.deleteMany({ where: { token } });
  } catch {}
}

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  header.split(";").forEach((pair) => {
    const [k, ...v] = pair.trim().split("=");
    if (k && v.length) out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

export function publicUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    role: u.role,
    status: u.status,
    ownerId: u.owner?.id,
    ownerVerified: u.owner?.verified,
    ownerRating: u.owner?.rating,
    createdAt: u.createdAt,
  };
}
