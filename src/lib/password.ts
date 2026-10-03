import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SECRET =
  process.env.ADMIN_SECRET ?? process.env.DATABASE_URL ?? "cw-admin-dev-secret";

/** format: salt(hex):hash(hex) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 32);
  const reference = Buffer.from(hash, "hex");
  return candidate.length === reference.length && timingSafeEqual(candidate, reference);
}

export function signValue(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function verifySignature(value: string, signature: string): boolean {
  const expected = signValue(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
