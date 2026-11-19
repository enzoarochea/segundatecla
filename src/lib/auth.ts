/**
 * Admin auth: scrypt password hashes (./password.ts) + opaque DB sessions.
 * The cookie holds a random token; the DB stores only its sha256, so a leaked
 * database cannot be replayed as a cookie.
 */
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { DUMMY_HASH, verifyPassword } from "./password";

export const SESSION_COOKIE = "st_session";
const SESSION_MS = 12 * 60 * 60 * 1000;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// ---- Rate limit (failed logins per email+IP) ------------------------------
// shortcut: in-memory, resets on restart and is per process; fine for one local
// server, move to the DB or Redis if this ever runs on several instances.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

export function isLocked(key: string, now = Date.now()) {
  const f = fails.get(key);
  if (!f) return false;
  if (now - f.first > WINDOW_MS) {
    fails.delete(key);
    return false;
  }
  return f.count >= MAX_FAILS;
}

function recordFail(key: string, now = Date.now()) {
  const f = fails.get(key);
  if (!f || now - f.first > WINDOW_MS) fails.set(key, { count: 1, first: now });
  else f.count++;
}

export const resetRateLimit = () => fails.clear();

// ---- Login / logout ---------------------------------------------------------
export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(emailRaw: string, password: string, clientKey: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  const key = `${email}|${clientKey}`;
  if (isLocked(key)) return { ok: false, error: "Demasiados intentos. Esperá 15 minutos y probá de nuevo." };

  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  // Always run scrypt so response time does not reveal whether the email exists.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    recordFail(key);
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
  fails.delete(key);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await db.session.create({ data: { id: sha256(token), userId: user.id, expiresAt } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

// ---- Session checks ---------------------------------------------------------
export async function getAdmin(): Promise<{ id: string; email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

/** Call at the top of every admin page AND every admin server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
