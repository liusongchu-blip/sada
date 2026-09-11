import { env } from "cloudflare:workers";

export type SadaEnv = Omit<Cloudflare.Env, "SADA_ENV" | "SADA_TRUST_OAI_HEADERS"> & {
  SADA_ENV?: string;
  SADA_TRUST_OAI_HEADERS?: string;
  SADA_ADMIN_EMAILS?: string;
  SADA_ADMIN_TOKEN?: string;
  SMS_PROVIDER_URL?: string;
  SMS_PROVIDER_TOKEN?: string;
  PAYMENT_PROVIDER_URL?: string;
  PAYMENT_PROVIDER_TOKEN?: string;
  PAYMENT_WEBHOOK_SECRET?: string;
};

export type AdminIdentity = {
  email: string;
  name: string;
};

export type UserRow = {
  id: string;
  phone: string | null;
  email: string | null;
  display_name: string;
  bio: string;
  city: string;
  avatar_url: string | null;
  locale: string;
  vip_level: number;
  status: string;
};

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export function database(): D1Database {
  const db = (env as SadaEnv).DB;
  if (!db) throw new ApiError(503, "DATABASE_UNAVAILABLE", "Database binding is unavailable");
  return db;
}

export function runtimeEnv(): SadaEnv {
  return env as SadaEnv;
}

export function ok(data: unknown, init: ResponseInit = {}): Response {
  return Response.json({ data: serialize(data) }, { ...init, headers: responseHeaders(init.headers) });
}

export function created(data: unknown): Response {
  return ok(data, { status: 201 });
}

export function empty(): Response {
  return new Response(null, { status: 204, headers: responseHeaders() });
}

export function failure(error: unknown, requestId: string): Response {
  const known = error instanceof ApiError;
  const status = known ? error.status : 500;
  const code = known ? error.code : "INTERNAL_ERROR";
  const message = known ? error.message : "An unexpected error occurred";
  if (!known) console.error(`[api:${requestId}]`, error);
  return Response.json(
    { error: { code, message, ...(known && error.details ? { details: error.details } : {}), requestId } },
    { status, headers: responseHeaders() },
  );
}

function responseHeaders(input?: HeadersInit): Headers {
  const headers = new Headers(input);
  headers.set("cache-control", "no-store");
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new ApiError(415, "JSON_REQUIRED", "Expected application/json");
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 65_536) throw new ApiError(413, "BODY_TOO_LARGE", "Request body exceeds 64 KiB");
  const raw = await request.text();
  if (raw.length > 65_536) throw new ApiError(413, "BODY_TOO_LARGE", "Request body exceeds 64 KiB");
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("object required");
    return value as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be a JSON object");
  }
}

export function stringField(input: Record<string, unknown>, key: string, options: { min?: number; max?: number; optional?: boolean } = {}): string | undefined {
  const value = input[key];
  if ((value === undefined || value === null) && options.optional) return undefined;
  if (typeof value !== "string") throw new ApiError(422, "INVALID_FIELD", `${key} must be a string`);
  const normalized = value.trim();
  if (normalized.length < (options.min ?? 1) || normalized.length > (options.max ?? 500)) {
    throw new ApiError(422, "INVALID_FIELD", `${key} has an invalid length`);
  }
  return normalized;
}

export function intField(input: Record<string, unknown>, key: string, min = 0, max = 1_000_000): number {
  const value = input[key];
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new ApiError(422, "INVALID_FIELD", `${key} must be an integer between ${min} and ${max}`);
  }
  return Number(value);
}

export function boolField(input: Record<string, unknown>, key: string): boolean | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new ApiError(422, "INVALID_FIELD", `${key} must be a boolean`);
  return value;
}

export function oneOf(value: string | undefined, allowed: readonly string[], field: string): string {
  if (!value || !allowed.includes(value)) throw new ApiError(422, "INVALID_FIELD", `${field} must be one of: ${allowed.join(", ")}`);
  return value;
}

export function normalizePhone(value: string): string {
  const phone = value.replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new ApiError(422, "INVALID_PHONE", "Use an international phone number, for example +923001234567");
  return phone;
}

export async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomToken(bytes = 32): string {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function requireUser(request: Request): Promise<UserRow> {
  const db = database();
  const config = runtimeEnv();
  const externalSubject = config.SADA_TRUST_OAI_HEADERS === "true"
    ? request.headers.get("oai-authenticated-user-id")
    : null;
  if (externalSubject) {
    const email = request.headers.get("oai-authenticated-user-email");
    const encodedName = request.headers.get("oai-authenticated-user-full-name");
    const displayName = decodeName(encodedName) ?? email ?? "SADA Member";
    let user = await db.prepare("SELECT * FROM users WHERE external_subject = ? AND status = 'active'").bind(externalSubject).first<UserRow>();
    if (!user) {
      const id = crypto.randomUUID();
      await db.batch([
        db.prepare("INSERT INTO users (id, external_subject, email, display_name) VALUES (?, ?, ?, ?)").bind(id, externalSubject, email, displayName),
        db.prepare("INSERT INTO wallets (user_id, diamonds, game_coins) VALUES (?, 1250, 8420)").bind(id),
        db.prepare("INSERT INTO user_safety_preferences (user_id) VALUES (?)").bind(id),
      ]);
      user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
    }
    if (user) return user;
  }

  const token = sessionToken(request);
  if (!token) throw new ApiError(401, "AUTH_REQUIRED", "Sign in is required");
  const hash = await sha256(token);
  const user = await db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'`).bind(hash).first<UserRow>();
  if (!user) throw new ApiError(401, "INVALID_SESSION", "Session is invalid or expired");
  return user;
}

export async function requireAdmin(request: Request): Promise<AdminIdentity> {
  const config = runtimeEnv();
  const trustOaiHeaders = config.SADA_TRUST_OAI_HEADERS === "true";
  const email = trustOaiHeaders ? request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() : undefined;
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const allowedEmails = new Set(
    (config.SADA_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null;

  if (email && allowedEmails.has(email)) {
    return { email, name: decodeName(encodedName) ?? email.split("@")[0] };
  }
  if (config.SADA_ADMIN_TOKEN && token && await secureEqual(token, config.SADA_ADMIN_TOKEN)) {
    return { email: "service-admin@sada.local", name: "SADA Admin" };
  }
  if (config.SADA_ENV !== "production" && !config.SADA_ADMIN_EMAILS && !config.SADA_ADMIN_TOKEN) {
    return { email: "local-admin@sada.local", name: "Local Admin" };
  }
  throw new ApiError(403, "ADMIN_FORBIDDEN", "Administrator access is required");
}

export function assertSameOriginForCookieMutation(request: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  if (request.headers.get("authorization")?.startsWith("Bearer ")) return;
  if (!cookieValue(request, "sada_session")) return;
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new ApiError(403, "CSRF_REJECTED", "Cross-origin cookie request rejected");
  }
}

export async function secureEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

export function sessionToken(request: Request): string | null {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : cookieValue(request, "sada_session");
}

function cookieValue(request: Request, key: string): string | null {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === key) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function decodeName(value: string | null): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return null; }
}

export function publicUser(row: UserRow | Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id, displayName: row.display_name, bio: row.bio, city: row.city,
    avatarUrl: row.avatar_url, locale: row.locale, vipLevel: row.vip_level,
  };
}

export function cursorLimit(url: URL): { cursor: string | null; limit: number } {
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") ?? "30", 10) || 30, 1), 100);
  return { cursor: url.searchParams.get("cursor"), limit };
}

function serialize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(serialize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
    serialize(item),
  ]));
}
