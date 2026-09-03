import crypto from "crypto";
import { cookies } from "next/headers";
import { getUser, saveSession, getSession, deleteSession } from "./store";
import type { User, Session } from "./types";

const SESSION_COOKIE_NAME = "aidex_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "stash_aidex_session_secret_32_bytes_long";
const SESSION_DURATION_DAYS = 7;

/**
 * Cryptographically hashes a plain password using Node.js scrypt with salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies password against stored salt:hash using timing-safe equal.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

/**
 * Signs a session token with HMAC-SHA256.
 */
export function signToken(token: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(token);
  const signature = hmac.digest("hex");
  return `${token}.${signature}`;
}

/**
 * Verifies and unsigns a signed token string.
 */
export function unsignToken(signedToken: string): string | null {
  if (!signedToken || !signedToken.includes(".")) return null;
  const [token, signature] = signedToken.split(".");
  if (!token || !signature) return null;

  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(token);
  const expectedSignature = hmac.digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  return token;
}

/**
 * Creates a real server session, stores it in the persistent store, and returns the signed cookie value.
 */
export async function createSession(userId: string): Promise<{
  token: string;
  cookieValue: string;
  expiresAt: Date;
}> {
  const token = crypto.randomBytes(32).toString("hex");
  const cookieValue = signToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const session: Session = {
    id: `sess_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  saveSession(session);

  return { token, cookieValue, expiresAt };
}

/**
 * Validates a signed cookie value and returns the corresponding User if session is active.
 */
export async function verifySession(cookieValue?: string): Promise<User | null> {
  if (!cookieValue) return null;
  const token = unsignToken(cookieValue);
  if (!token) return null;

  const session = getSession(token);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    deleteSession(token);
    return null;
  }

  const user = getUser(session.userId);
  return user || null;
}

/**
 * Invalidates and removes a session.
 */
export async function destroySession(cookieValue?: string): Promise<void> {
  if (!cookieValue) return;
  const token = unsignToken(cookieValue);
  if (!token) return;
  deleteSession(token);
}

/**
 * Reads the session cookie and returns current authenticated user on the server.
 */
export async function getCurrentSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return await verifySession(cookie.value);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS };
