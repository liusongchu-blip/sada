import {
  ApiError, assertSameOriginForCookieMutation, body, boolField, created, cursorLimit, database, empty, failure, intField,
  normalizePhone, ok, oneOf, publicUser, randomToken, requireAdmin, requireUser, runtimeEnv, secureEqual, sessionToken, sha256, stringField,
  type UserRow,
} from "@/server/api";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ segments: string[] }> };
type Row = Record<string, unknown>;

export async function GET(request: Request, context: Context) { return dispatch("GET", request, context); }
export async function POST(request: Request, context: Context) { return dispatch("POST", request, context); }
export async function PATCH(request: Request, context: Context) { return dispatch("PATCH", request, context); }
export async function DELETE(request: Request, context: Context) { return dispatch("DELETE", request, context); }

async function dispatch(method: string, request: Request, context: Context): Promise<Response> {
  const requestId = crypto.randomUUID();
  try {
    const { segments } = await context.params;
    const path = `/${segments.join("/")}`;
    const url = new URL(request.url);

    if (method === "GET" && path === "/health") return health();
    if (method === "POST" && path === "/payments/webhooks/provider") return paymentWebhook(request);
    assertSameOriginForCookieMutation(request);
    if (method === "POST" && path === "/auth/otp/request") return requestOtp(request);
    if (method === "POST" && path === "/auth/otp/verify") return verifyOtp(request);
    if (method === "POST" && path === "/auth/logout") return logout(request);
    // Discovery surfaces are public; mutations and personal data remain protected.
    if (method === "GET" && path === "/rooms") return listRooms(url);
    if (method === "GET" && path === "/catalog") return catalog(url);
    if (method === "GET" && path === "/market/listings") return marketListings(url);

    if (segments[0] === "admin") {
      const admin = await requireAdmin(request);
      return adminRoute(method, request, segments, url, admin);
    }

    const user = await requireUser(request);
    if (method === "GET" && path === "/me") return getMe(user);
    if (method === "PATCH" && path === "/me") return updateMe(request, user);
    if (method === "GET" && path === "/users") return listUsers(url, user);
    if (segments[0] === "users" && segments[2] === "follow" && segments.length === 3) {
      if (method === "POST") return followUser(user, segments[1], true);
      if (method === "DELETE") return followUser(user, segments[1], false);
    }
    if (method === "POST" && path === "/rooms") return createRoom(request, user);
    if (segments[0] === "rooms" && segments.length >= 2) return roomRoute(method, request, user, segments);
    if (method === "GET" && path === "/conversations") return listConversations(user);
    if (method === "POST" && path === "/conversations") return createConversation(request, user);
    if (segments[0] === "conversations" && segments[2] === "messages") return conversationMessages(method, request, user, segments[1], url);
    if (method === "GET" && path === "/activities") return activities(user);
    if (method === "POST" && path === "/activities/check-in") return checkIn(user);
    if (method === "POST" && segments[0] === "activities" && segments[2] === "claim") return claimMission(user, segments[1]);
    if (method === "GET" && path === "/inventory") return inventory(user);
    if (method === "POST" && segments[0] === "inventory" && segments[2] === "equip") return equip(user, segments[1]);
    if (method === "POST" && path === "/store/purchases") return storePurchase(request, user);
    if (method === "POST" && path === "/vip/upgrade") return upgradeVip(request, user);
    if (method === "POST" && path === "/market/listings") return createListing(request, user);
    if (method === "POST" && segments[0] === "market" && segments[1] === "listings" && segments[3] === "buy") return buyListing(request, user, segments[2]);
    if (method === "GET" && path === "/market/orders") return marketOrders(user);
    if (method === "GET" && path === "/payments/methods") return listPaymentMethods(user);
    if (method === "POST" && path === "/payments/methods") return createPaymentMethod(request, user);
    if (method === "DELETE" && segments[0] === "payments" && segments[1] === "methods") return deletePaymentMethod(user, segments[2]);
    if (method === "POST" && path === "/payments/intents") return createPaymentIntent(request, user);
    if (method === "POST" && segments[0] === "payments" && segments[1] === "intents" && segments[3] === "confirm") return confirmPayment(request, user, segments[2]);
    if (method === "GET" && path === "/payments/receipts") return paymentReceipts(user);
    if (method === "POST" && segments[0] === "payments" && segments[1] === "receipts" && segments[3] === "refunds") return requestRefund(request, user, segments[2]);
    if (method === "GET" && path === "/safety/preferences") return safetyPreferences(user);
    if (method === "PATCH" && path === "/safety/preferences") return updateSafetyPreferences(request, user);
    if (method === "POST" && path === "/reports") return createReport(request, user);

    throw new ApiError(404, "NOT_FOUND", "API route not found");
  } catch (error) {
    return failure(error, requestId);
  }
}

async function adminRoute(
  method: string,
  request: Request,
  segments: string[],
  url: URL,
  admin: { email: string; name: string },
) {
  const resource = segments[1];
  const resourceId = segments[2];
  if (method === "GET" && resource === "overview") return adminOverview(admin);
  if (method === "GET" && resource === "users") return adminUsers(url);
  if (method === "PATCH" && resource === "users" && resourceId) return updateAdminUser(request, resourceId);
  if (method === "PATCH" && resource === "rooms" && resourceId) return updateAdminRoom(request, resourceId);
  if (method === "PATCH" && resource === "reports" && resourceId) return updateAdminReport(request, resourceId);
  throw new ApiError(404, "ADMIN_ROUTE_NOT_FOUND", "Admin API route not found");
}

async function adminOverview(admin: { email: string; name: string }) {
  const db = database();
  const [totalUsers, activeUsers, liveRooms, pendingReports, revenue, trends, rooms, reports, transactions] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS value FROM users").first<{ value: number }>(),
    db.prepare("SELECT COUNT(*) AS value FROM users WHERE status = 'active' AND updated_at >= datetime('now', '-1 day')").first<{ value: number }>(),
    db.prepare("SELECT COUNT(*) AS value FROM rooms WHERE status = 'live'").first<{ value: number }>(),
    db.prepare("SELECT COUNT(*) AS value FROM reports WHERE status IN ('received', 'reviewing')").first<{ value: number }>(),
    db.prepare("SELECT COALESCE(SUM(amount_pkr), 0) AS value FROM payment_intents WHERE status = 'succeeded' AND created_at >= datetime('now', '-7 days')").first<{ value: number }>(),
    db.prepare(`SELECT date(day) AS day,
      (SELECT COUNT(*) FROM users WHERE date(created_at) = date(day)) AS new_users,
      (SELECT COUNT(*) FROM rooms WHERE date(created_at) = date(day)) AS rooms_created,
      (SELECT COALESCE(SUM(amount_pkr), 0) FROM payment_intents WHERE status = 'succeeded' AND date(created_at) = date(day)) AS revenue
      FROM (SELECT date('now', '-' || value || ' day') AS day FROM json_each('[6,5,4,3,2,1,0]'))`).all<Row>(),
    db.prepare(`SELECT r.id, r.title, r.topic, r.status, r.listener_count, r.updated_at,
      u.display_name AS host_name FROM rooms r JOIN users u ON u.id = r.host_id
      ORDER BY CASE r.status WHEN 'live' THEN 0 ELSE 1 END, r.listener_count DESC LIMIT 8`).all<Row>(),
    db.prepare(`SELECT p.id, p.target_type, p.target_id, p.reason, p.details, p.status, p.created_at,
      u.display_name AS reporter_name FROM reports p JOIN users u ON u.id = p.reporter_id
      ORDER BY CASE p.status WHEN 'received' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END, p.created_at DESC LIMIT 8`).all<Row>(),
    db.prepare(`SELECT pi.id, u.display_name AS user_name, pi.amount_pkr, pi.diamonds,
      pi.status, pi.provider_reference, pi.created_at FROM payment_intents pi
      JOIN users u ON u.id = pi.user_id ORDER BY pi.created_at DESC LIMIT 8`).all<Row>(),
  ]);

  return ok({
    operator: admin,
    metrics: {
      totalUsers: Number(totalUsers?.value ?? 0),
      activeUsers: Number(activeUsers?.value ?? 0),
      liveRooms: Number(liveRooms?.value ?? 0),
      pendingReports: Number(pendingReports?.value ?? 0),
      revenuePkr: Number(revenue?.value ?? 0),
    },
    trends: trends.results,
    rooms: rooms.results,
    reports: reports.results,
    transactions: transactions.results,
    generatedAt: new Date().toISOString(),
  });
}

async function adminUsers(url: URL) {
  const query = (url.searchParams.get("query") ?? "").trim().slice(0, 80);
  const status = url.searchParams.get("status");
  const { cursor, limit } = cursorLimit(url);
  const result = await database().prepare(`SELECT u.id, u.display_name, u.phone, u.email, u.city, u.locale,
    u.vip_level, u.status, u.created_at, w.diamonds, w.bound_diamonds, w.game_coins
    FROM users u LEFT JOIN wallets w ON w.user_id = u.id
    WHERE (? = '' OR u.display_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)
      AND (? IS NULL OR u.status = ?) AND (? IS NULL OR u.id > ?)
    ORDER BY u.id LIMIT ?`)
    .bind(query, `%${query}%`, `%${query}%`, `%${query}%`, status, status, cursor, cursor, limit + 1).all<Row>();
  return page(result.results, limit);
}

async function updateAdminUser(request: Request, userId: string) {
  const input = await body(request);
  const status = oneOf(stringField(input, "status", { max: 20 }), ["active", "suspended"], "status");
  const result = await database().prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, userId).run();
  if (!result.meta.changes) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  return ok({ id: userId, status });
}

async function updateAdminRoom(request: Request, roomId: string) {
  const input = await body(request);
  const status = oneOf(stringField(input, "status", { max: 20 }), ["live", "ended", "suspended"], "status");
  const result = await database().prepare("UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, roomId).run();
  if (!result.meta.changes) throw new ApiError(404, "ROOM_NOT_FOUND", "Room not found");
  return ok({ id: roomId, status });
}

async function updateAdminReport(request: Request, reportId: string) {
  const input = await body(request);
  const status = oneOf(stringField(input, "status", { max: 24 }), ["received", "reviewing", "resolved", "dismissed"], "status");
  const result = await database().prepare("UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, reportId).run();
  if (!result.meta.changes) throw new ApiError(404, "REPORT_NOT_FOUND", "Report not found");
  return ok({ id: reportId, status });
}

async function health() {
  await database().prepare("SELECT 1").first();
  return ok({ status: "ok", service: "sada-api", version: "v1", time: new Date().toISOString() });
}

async function requestOtp(request: Request) {
  const input = await body(request);
  const phone = normalizePhone(stringField(input, "phone", { max: 20 })!);
  const db = database();
  const recent = await db.prepare("SELECT COUNT(*) AS count FROM otp_challenges WHERE phone = ? AND created_at > datetime('now', '-10 minutes')").bind(phone).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 5) throw new ApiError(429, "OTP_RATE_LIMITED", "Too many verification codes requested; try again later");
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  const challengeId = crypto.randomUUID();
  const codeHash = await sha256(`${challengeId}:${phone}:${code}`);
  await db.prepare("INSERT INTO otp_challenges (id, phone, code_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+5 minutes'))").bind(challengeId, phone, codeHash).run();
  const config = runtimeEnv();
  if (config.SMS_PROVIDER_URL) {
    const response = await fetch(config.SMS_PROVIDER_URL, { method: "POST", headers: { "content-type": "application/json", ...(config.SMS_PROVIDER_TOKEN ? { authorization: `Bearer ${config.SMS_PROVIDER_TOKEN}` } : {}) }, body: JSON.stringify({ to: phone, template: "sada_login", variables: { code } }) });
    if (!response.ok) throw new ApiError(502, "SMS_DELIVERY_FAILED", "Verification code could not be delivered");
  } else if (config.SADA_ENV === "production") {
    throw new ApiError(503, "SMS_NOT_CONFIGURED", "SMS provider is not configured");
  }
  return ok({ challengeId, expiresIn: 300, delivery: config.SMS_PROVIDER_URL ? "sms" : "simulated", ...(config.SADA_ENV !== "production" ? { developmentCode: code } : {}) });
}

async function verifyOtp(request: Request) {
  const input = await body(request);
  const challengeId = stringField(input, "challengeId", { max: 80 })!;
  const phone = normalizePhone(stringField(input, "phone", { max: 20 })!);
  const code = stringField(input, "code", { min: 6, max: 6 })!;
  const db = database();
  const challenge = await db.prepare("SELECT * FROM otp_challenges WHERE id = ? AND phone = ? AND consumed_at IS NULL AND expires_at > CURRENT_TIMESTAMP").bind(challengeId, phone).first<Row>();
  if (!challenge || Number(challenge.attempts) >= 5) throw new ApiError(401, "OTP_INVALID", "Verification code is invalid or expired");
  const expected = await sha256(`${challengeId}:${phone}:${code}`);
  if (!await secureEqual(expected, String(challenge.code_hash))) {
    await db.prepare("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?").bind(challengeId).run();
    throw new ApiError(401, "OTP_INVALID", "Verification code is invalid or expired");
  }
  let user = await db.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first<UserRow>();
  const userId = user?.id ?? crypto.randomUUID();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const sessionId = crypto.randomUUID();
  const statements = [
    db.prepare("UPDATE otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(challengeId),
    ...(!user ? [db.prepare("INSERT INTO users (id, phone, display_name) VALUES (?, ?, ?)").bind(userId, phone, `SADA ${phone.slice(-4)}`), db.prepare("INSERT INTO wallets (user_id, diamonds, game_coins) VALUES (?, 1250, 8420)").bind(userId), db.prepare("INSERT INTO user_safety_preferences (user_id) VALUES (?)").bind(userId)] : []),
    db.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))").bind(sessionId, userId, tokenHash),
  ];
  await db.batch(statements);
  user = user ?? await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<UserRow>();
  const wallet = await db.prepare("SELECT diamonds, bound_diamonds AS boundDiamonds, game_coins AS gameCoins FROM wallets WHERE user_id = ?").bind(userId).first();
  const response = ok({ token, expiresIn: 2_592_000, user: { ...publicUser(user!), phone: user!.phone, email: user!.email, wallet } });
  response.headers.append("set-cookie", `sada_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`);
  return response;
}

async function logout(request: Request) {
  const token = sessionToken(request);
  if (token) await database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(await sha256(token)).run();
  const response = empty();
  response.headers.append("set-cookie", "sada_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return response;
}

async function getMe(user: UserRow) {
  const wallet = await database().prepare("SELECT diamonds, bound_diamonds AS boundDiamonds, game_coins AS gameCoins FROM wallets WHERE user_id = ?").bind(user.id).first();
  return ok({ ...publicUser(user), phone: user.phone, email: user.email, wallet });
}

async function updateMe(request: Request, user: UserRow) {
  const input = await body(request);
  const name = stringField(input, "displayName", { min: 2, max: 40, optional: true });
  const bio = stringField(input, "bio", { min: 0, max: 180, optional: true });
  const city = stringField(input, "city", { min: 2, max: 60, optional: true });
  const localeRaw = stringField(input, "locale", { max: 5, optional: true });
  const locale = localeRaw ? oneOf(localeRaw, ["en", "zh", "ur"], "locale") : undefined;
  if (!name && bio === undefined && !city && !locale) throw new ApiError(422, "NO_CHANGES", "No supported profile fields were supplied");
  await database().prepare(`UPDATE users SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio), city = COALESCE(?, city), locale = COALESCE(?, locale), updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(name ?? null, bio ?? null, city ?? null, locale ?? null, user.id).run();
  const updated = await database().prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first<UserRow>();
  const wallet = await database().prepare("SELECT diamonds, bound_diamonds AS boundDiamonds, game_coins AS gameCoins FROM wallets WHERE user_id = ?").bind(user.id).first();
  return ok({ ...publicUser(updated!), phone: updated!.phone, email: updated!.email, wallet });
}

async function listUsers(url: URL, current: UserRow) {
  const query = (url.searchParams.get("query") ?? "").trim().slice(0, 80);
  const { cursor, limit } = cursorLimit(url);
  const result = await database().prepare(`SELECT u.*, EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.followed_id = u.id) AS following
    FROM users u WHERE u.id != ? AND u.status = 'active' AND (? = '' OR u.display_name LIKE ? OR u.city LIKE ?) AND (? IS NULL OR u.id > ?) ORDER BY u.id LIMIT ?`)
    .bind(current.id, current.id, query, `%${query}%`, `%${query}%`, cursor, cursor, limit + 1).all<Row>();
  return page(result.results, limit, (row) => ({ ...publicUser(row), following: Boolean(row.following) }));
}

async function followUser(user: UserRow, followedId: string, follow: boolean) {
  if (user.id === followedId) throw new ApiError(422, "SELF_FOLLOW", "You cannot follow yourself");
  if (follow) await database().prepare("INSERT OR IGNORE INTO follows (follower_id, followed_id) SELECT ?, id FROM users WHERE id = ? AND status = 'active'").bind(user.id, followedId).run();
  else await database().prepare("DELETE FROM follows WHERE follower_id = ? AND followed_id = ?").bind(user.id, followedId).run();
  return ok({ userId: followedId, following: follow });
}

async function listRooms(url: URL) {
  const topic = url.searchParams.get("topic");
  const { cursor, limit } = cursorLimit(url);
  const result = await database().prepare(`SELECT r.*, u.display_name AS host_name, u.avatar_url AS host_avatar_url FROM rooms r JOIN users u ON u.id = r.host_id
    WHERE r.status = 'live' AND (? IS NULL OR r.topic = ?) AND (? IS NULL OR r.id > ?) ORDER BY r.id LIMIT ?`).bind(topic, topic, cursor, cursor, limit + 1).all<Row>();
  return page(result.results, limit);
}

async function createRoom(request: Request, user: UserRow) {
  const input = await body(request);
  const title = stringField(input, "title", { min: 2, max: 80 })!;
  const topic = oneOf(stringField(input, "topic", { max: 30 })!, ["Stories", "Poetry", "Music", "Games"], "topic");
  const privacy = oneOf(stringField(input, "privacy", { max: 20 })!, ["public", "friends"], "privacy");
  const id = crypto.randomUUID(), db = database();
  await db.batch([db.prepare("INSERT INTO rooms (id, host_id, title, topic, privacy, listener_count) VALUES (?, ?, ?, ?, ?, 1)").bind(id, user.id, title, topic, privacy), db.prepare("INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'host')").bind(id, user.id)]);
  return created(await db.prepare("SELECT * FROM rooms WHERE id = ?").bind(id).first());
}

async function roomRoute(method: string, request: Request, user: UserRow, segments: string[]) {
  const roomId = segments[1], action = segments[2], db = database();
  if (method === "GET" && !action) {
    const room = await db.prepare("SELECT r.*, u.display_name AS host_name FROM rooms r JOIN users u ON u.id = r.host_id WHERE r.id = ?").bind(roomId).first();
    if (!room) throw new ApiError(404, "ROOM_NOT_FOUND", "Room not found");
    return ok(room);
  }
  if (method === "POST" && action === "join") {
    await db.batch([db.prepare(`INSERT INTO room_members (room_id, user_id, role, left_at) SELECT ?, ?, 'listener', NULL WHERE EXISTS(SELECT 1 FROM rooms WHERE id = ? AND status = 'live') ON CONFLICT(room_id, user_id) DO UPDATE SET left_at = NULL, joined_at = CURRENT_TIMESTAMP`).bind(roomId, user.id, roomId), db.prepare("UPDATE rooms SET listener_count = (SELECT COUNT(*) FROM room_members WHERE room_id = ? AND left_at IS NULL), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(roomId, roomId)]);
    return ok({ roomId, joined: true });
  }
  if (method === "POST" && action === "leave") {
    await db.batch([db.prepare("UPDATE room_members SET left_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ? AND role != 'host'").bind(roomId, user.id), db.prepare("UPDATE rooms SET listener_count = (SELECT COUNT(*) FROM room_members WHERE room_id = ? AND left_at IS NULL), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(roomId, roomId)]);
    return ok({ roomId, joined: false });
  }
  if (action === "messages" && method === "GET") {
    const url = new URL(request.url), { cursor, limit } = cursorLimit(url);
    const result = await db.prepare(`SELECT m.*, u.display_name AS sender_name, u.avatar_url AS sender_avatar_url FROM room_messages m JOIN users u ON u.id = m.sender_id
      WHERE m.room_id = ? AND (? IS NULL OR m.created_at < ?) ORDER BY m.created_at DESC LIMIT ?`).bind(roomId, cursor, cursor, limit + 1).all<Row>();
    return page(result.results, limit, undefined, "created_at");
  }
  if (action === "messages" && method === "POST") {
    const input = await body(request), messageBody = stringField(input, "body", { max: 500 })!, id = crypto.randomUUID();
    const membership = await db.prepare("SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? AND left_at IS NULL").bind(roomId, user.id).first();
    if (!membership) throw new ApiError(403, "ROOM_MEMBERSHIP_REQUIRED", "Join the room before sending a message");
    await db.prepare("INSERT INTO room_messages (id, room_id, sender_id, body) VALUES (?, ?, ?, ?)").bind(id, roomId, user.id, messageBody).run();
    return created({ id, roomId, senderId: user.id, body: messageBody, createdAt: new Date().toISOString() });
  }
  if (action === "gifts" && method === "POST") return sendRoomGift(request, user, roomId);
  throw new ApiError(404, "NOT_FOUND", "Room route not found");
}

async function sendRoomGift(request: Request, user: UserRow, roomId: string) {
  const input = await body(request), catalogItemId = stringField(input, "catalogItemId", { max: 80 })!, quantity = intField(input, "quantity", 1, 99);
  const db = database(), item = await db.prepare("SELECT id, price_diamonds FROM catalog_items WHERE id = ? AND category = 'gift' AND status = 'active'").bind(catalogItemId).first<{ id: string; price_diamonds: number }>();
  if (!item) throw new ApiError(404, "GIFT_NOT_FOUND", "Gift not found");
  const total = item.price_diamonds * quantity, ledgerId = crypto.randomUUID();
  const debit = await db.prepare("UPDATE wallets SET diamonds = diamonds - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND diamonds >= ?").bind(total, user.id, total).run();
  if (!debit.meta.changes) throw new ApiError(409, "INSUFFICIENT_DIAMONDS", "Diamond balance is too low");
  await db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id) VALUES (?, ?, 'diamonds', ?, 'room_gift', 'room', ?)").bind(ledgerId, user.id, -total, roomId).run();
  return created({ roomId, catalogItemId, quantity, spentDiamonds: total });
}

async function createConversation(request: Request, user: UserRow) {
  const input = await body(request), memberId = stringField(input, "memberId", { max: 80 })!;
  if (memberId === user.id) throw new ApiError(422, "INVALID_MEMBER", "A direct conversation requires another member");
  const db = database(), key = [user.id, memberId].sort().join(":"), existing = await db.prepare("SELECT conversation_id AS id FROM direct_conversation_keys WHERE member_key = ?").bind(key).first();
  if (existing) return ok(existing);
  const id = crypto.randomUUID();
  try { await db.batch([db.prepare("INSERT INTO conversations (id) VALUES (?)").bind(id), db.prepare("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)").bind(id, user.id, id, memberId), db.prepare("INSERT INTO direct_conversation_keys (member_key, conversation_id) VALUES (?, ?)").bind(key, id)]); }
  catch { const winner = await db.prepare("SELECT conversation_id AS id FROM direct_conversation_keys WHERE member_key = ?").bind(key).first(); if (winner) return ok(winner); throw new ApiError(404, "MEMBER_NOT_FOUND", "Member not found"); }
  return created({ id });
}

async function listConversations(user: UserRow) {
  const result = await database().prepare(`SELECT c.id, c.updated_at, u.id AS member_id, u.display_name AS member_name, u.avatar_url AS member_avatar_url,
    (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
    FROM conversation_members mine JOIN conversations c ON c.id = mine.conversation_id
    LEFT JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id != mine.user_id LEFT JOIN users u ON u.id = other.user_id
    WHERE mine.user_id = ? ORDER BY c.updated_at DESC LIMIT 100`).bind(user.id).all();
  return ok({ items: result.results });
}

async function conversationMessages(method: string, request: Request, user: UserRow, conversationId: string, url: URL) {
  const db = database(), membership = await db.prepare("SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?").bind(conversationId, user.id).first();
  if (!membership) throw new ApiError(403, "CONVERSATION_FORBIDDEN", "You are not a member of this conversation");
  if (method === "GET") {
    const { cursor, limit } = cursorLimit(url), result = await db.prepare(`SELECT m.*, u.display_name AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? AND (? IS NULL OR m.created_at < ?) ORDER BY m.created_at DESC LIMIT ?`).bind(conversationId, cursor, cursor, limit + 1).all<Row>();
    await db.prepare("UPDATE conversation_members SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?").bind(conversationId, user.id).run();
    return page(result.results, limit, undefined, "created_at");
  }
  if (method === "POST") {
    const input = await body(request), messageBody = stringField(input, "body", { max: 2000 })!, id = crypto.randomUUID();
    await db.batch([db.prepare("INSERT INTO messages (id, conversation_id, sender_id, body) VALUES (?, ?, ?, ?)").bind(id, conversationId, user.id, messageBody), db.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(conversationId)]);
    return created({ id, conversationId, senderId: user.id, body: messageBody, createdAt: new Date().toISOString() });
  }
  throw new ApiError(405, "METHOD_NOT_ALLOWED", "Method not allowed");
}

async function activities(user: UserRow) {
  const result = await database().prepare(`SELECT m.*, COALESCE(p.progress, 0) AS progress, p.claimed_at FROM missions m LEFT JOIN mission_progress p ON p.mission_id = m.id AND p.user_id = ? WHERE m.status = 'active' AND (m.starts_at IS NULL OR m.starts_at <= CURRENT_TIMESTAMP) AND (m.ends_at IS NULL OR m.ends_at > CURRENT_TIMESTAMP)`).bind(user.id).all();
  return ok({ missions: result.results });
}

async function checkIn(user: UserRow) {
  const db = database(), today = new Date().toISOString().slice(0, 10), existing = await db.prepare("SELECT * FROM daily_check_ins WHERE user_id = ? AND check_in_date = ?").bind(user.id, today).first();
  if (existing) return ok(existing);
  const previous = await db.prepare("SELECT streak_day, check_in_date FROM daily_check_ins WHERE user_id = ? ORDER BY check_in_date DESC LIMIT 1").bind(user.id).first<{ streak_day: number; check_in_date: string }>();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10), streak = previous?.check_in_date === yesterday ? (previous.streak_day % 7) + 1 : 1, reward = [5, 5, 10, 5, 10, 15, 30][streak - 1];
  await db.batch([db.prepare("INSERT INTO daily_check_ins (user_id, check_in_date, streak_day, reward_diamonds) VALUES (?, ?, ?, ?)").bind(user.id, today, streak, reward), db.prepare("UPDATE wallets SET bound_diamonds = bound_diamonds + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(reward, user.id), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) VALUES (?, ?, 'bound_diamonds', ?, 'daily_check_in', 'check_in', ?, ?)").bind(crypto.randomUUID(), user.id, reward, today, `check-in:${today}`)]);
  return created({ checkInDate: today, streakDay: streak, rewardDiamonds: reward });
}

async function claimMission(user: UserRow, missionId: string) {
  const db = database(), mission = await db.prepare(`SELECT m.*, p.progress, p.claimed_at FROM missions m JOIN mission_progress p ON p.mission_id = m.id AND p.user_id = ? WHERE m.id = ? AND m.status = 'active'`).bind(user.id, missionId).first<Row>();
  if (!mission) throw new ApiError(404, "MISSION_NOT_FOUND", "Mission or progress not found");
  if (mission.claimed_at) return ok({ missionId, claimed: true });
  if (Number(mission.progress) < Number(mission.target)) throw new ApiError(409, "MISSION_INCOMPLETE", "Mission target has not been reached");
  const currencyColumn = mission.reward_currency === "game_coins" ? "game_coins" : "bound_diamonds", amount = Number(mission.reward_amount);
  const claimed = await db.prepare("UPDATE mission_progress SET claimed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND mission_id = ? AND claimed_at IS NULL").bind(user.id, missionId).run();
  if (!claimed.meta.changes) return ok({ missionId, claimed: true });
  await db.batch([db.prepare(`UPDATE wallets SET ${currencyColumn} = ${currencyColumn} + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`).bind(amount, user.id), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) VALUES (?, ?, ?, ?, 'mission_reward', 'mission', ?, ?)").bind(crypto.randomUUID(), user.id, mission.reward_currency, amount, missionId, `mission:${missionId}`)]);
  return ok({ missionId, claimed: true, reward: { currency: mission.reward_currency, amount } });
}

async function catalog(url: URL) {
  const category = url.searchParams.get("category"), result = await database().prepare("SELECT * FROM catalog_items WHERE status = 'active' AND (? IS NULL OR category = ?) ORDER BY created_at DESC").bind(category, category).all();
  return ok({ items: result.results });
}

async function inventory(user: UserRow) {
  const result = await database().prepare("SELECT i.*, c.sku, c.name, c.category, c.tradable, c.metadata FROM inventory_items i JOIN catalog_items c ON c.id = i.catalog_item_id WHERE i.user_id = ? ORDER BY i.created_at DESC").bind(user.id).all();
  return ok({ items: result.results });
}

async function equip(user: UserRow, inventoryId: string) {
  const db = database(), item = await db.prepare("SELECT i.id, c.category FROM inventory_items i JOIN catalog_items c ON c.id = i.catalog_item_id WHERE i.id = ? AND i.user_id = ?").bind(inventoryId, user.id).first<{ id: string; category: string }>();
  if (!item) throw new ApiError(404, "INVENTORY_NOT_FOUND", "Inventory item not found");
  await db.batch([db.prepare("UPDATE inventory_items SET equipped = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND catalog_item_id IN (SELECT id FROM catalog_items WHERE category = ?)").bind(user.id, item.category), db.prepare("UPDATE inventory_items SET equipped = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").bind(inventoryId, user.id)]);
  return ok({ inventoryId, equipped: true });
}

async function storePurchase(request: Request, user: UserRow) {
  const input = await body(request), itemId = stringField(input, "catalogItemId", { max: 80 })!, quantity = intField(input, "quantity", 1, 99), idempotency = stringField(input, "idempotencyKey", { max: 100 })!;
  const db = database(), existing = await db.prepare("SELECT reference_id AS inventoryId FROM wallet_ledger WHERE user_id = ? AND idempotency_key = ?").bind(user.id, idempotency).first();
  if (existing) return ok(existing);
  const item = await db.prepare("SELECT * FROM catalog_items WHERE id = ? AND status = 'active'").bind(itemId).first<Row>();
  if (!item) throw new ApiError(404, "CATALOG_ITEM_NOT_FOUND", "Catalog item not found");
  const currency = Number(item.price_diamonds) > 0 ? "diamonds" : "game_coins", total = Number(item[currency === "diamonds" ? "price_diamonds" : "price_game_coins"]) * quantity;
  const debit = await db.prepare(`UPDATE wallets SET ${currency} = ${currency} - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND ${currency} >= ?`).bind(total, user.id, total).run();
  if (!debit.meta.changes) throw new ApiError(409, "INSUFFICIENT_BALANCE", `Not enough ${currency}`);
  const inventoryId = crypto.randomUUID();
  await db.batch([db.prepare("INSERT INTO inventory_items (id, user_id, catalog_item_id, quantity) VALUES (?, ?, ?, ?)").bind(inventoryId, user.id, itemId, quantity), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) VALUES (?, ?, ?, ?, 'store_purchase', 'inventory', ?, ?)").bind(crypto.randomUUID(), user.id, currency, -total, inventoryId, idempotency)]);
  return created({ inventoryId, currency, amount: total });
}

async function upgradeVip(request: Request, user: UserRow) {
  const input = await body(request), level = intField(input, "level", 1, 10), idempotency = stringField(input, "idempotencyKey", { max: 100 })!;
  if (level <= user.vip_level) throw new ApiError(409, "VIP_ALREADY_ACTIVE", "Requested VIP level is already active");
  const cost = level * 500, db = database(), debit = await db.prepare("UPDATE wallets SET diamonds = diamonds - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND diamonds >= ? AND NOT EXISTS(SELECT 1 FROM wallet_ledger WHERE user_id = ? AND idempotency_key = ?)").bind(cost, user.id, cost, user.id, idempotency).run();
  if (!debit.meta.changes) { const existing = await db.prepare("SELECT 1 FROM wallet_ledger WHERE user_id = ? AND idempotency_key = ?").bind(user.id, idempotency).first(); if (existing) return ok({ level, activated: true }); throw new ApiError(409, "INSUFFICIENT_DIAMONDS", "Diamond balance is too low"); }
  await db.batch([db.prepare("UPDATE users SET vip_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(level, user.id), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) VALUES (?, ?, 'diamonds', ?, 'vip_upgrade', 'vip', ?, ?)").bind(crypto.randomUUID(), user.id, -cost, String(level), idempotency)]);
  return ok({ level, activated: true, spentDiamonds: cost });
}

async function marketListings(url: URL) {
  const { cursor, limit } = cursorLimit(url), result = await database().prepare(`SELECT l.*, c.name, c.sku, c.metadata, u.display_name AS seller_name FROM market_listings l JOIN inventory_items i ON i.id = l.inventory_item_id JOIN catalog_items c ON c.id = i.catalog_item_id JOIN users u ON u.id = l.seller_id WHERE l.status = 'active' AND (? IS NULL OR l.id > ?) ORDER BY l.id LIMIT ?`).bind(cursor, cursor, limit + 1).all<Row>();
  return page(result.results, limit);
}

async function createListing(request: Request, user: UserRow) {
  const input = await body(request), inventoryItemId = stringField(input, "inventoryItemId", { max: 80 })!, price = intField(input, "priceGameCoins", 10, 1_000_000), db = database();
  const eligible = await db.prepare("SELECT i.id FROM inventory_items i JOIN catalog_items c ON c.id = i.catalog_item_id WHERE i.id = ? AND i.user_id = ? AND i.bound = 0 AND i.quantity = 1 AND c.tradable = 1 AND NOT EXISTS(SELECT 1 FROM market_listings WHERE inventory_item_id = i.id AND status = 'active')").bind(inventoryItemId, user.id).first();
  if (!eligible) throw new ApiError(409, "ITEM_NOT_TRADABLE", "Item is unavailable, bound, or already listed");
  const id = crypto.randomUUID(); await db.prepare("INSERT INTO market_listings (id, seller_id, inventory_item_id, price_game_coins) VALUES (?, ?, ?, ?)").bind(id, user.id, inventoryItemId, price).run();
  return created({ id, inventoryItemId, priceGameCoins: price, status: "active" });
}

async function buyListing(request: Request, user: UserRow, listingId: string) {
  const input = await body(request), idempotency = stringField(input, "idempotencyKey", { max: 100 })!, db = database();
  const existing = await db.prepare("SELECT reference_id AS listingId FROM wallet_ledger WHERE user_id = ? AND idempotency_key = ?").bind(user.id, idempotency).first(); if (existing) return ok(existing);
  const listing = await db.prepare("SELECT * FROM market_listings WHERE id = ? AND status = 'active'").bind(listingId).first<Row>();
  if (!listing) throw new ApiError(404, "LISTING_NOT_FOUND", "Active listing not found");
  if (listing.seller_id === user.id) throw new ApiError(422, "SELF_PURCHASE", "You cannot buy your own listing");
  const price = Number(listing.price_game_coins), fee = Math.ceil(price * 0.05), debit = await db.prepare("UPDATE wallets SET game_coins = game_coins - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND game_coins >= ?").bind(price, user.id, price).run();
  if (!debit.meta.changes) throw new ApiError(409, "INSUFFICIENT_GAME_COINS", "Game Coin balance is too low");
  const lock = await db.prepare("UPDATE market_listings SET status = 'sold', buyer_id = ?, sold_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(user.id, listingId).run();
  if (!lock.meta.changes) { await db.prepare("UPDATE wallets SET game_coins = game_coins + ? WHERE user_id = ?").bind(price, user.id).run(); throw new ApiError(409, "LISTING_UNAVAILABLE", "Listing was purchased by another buyer"); }
  await db.batch([db.prepare("UPDATE inventory_items SET user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id, listing.inventory_item_id), db.prepare("UPDATE wallets SET game_coins = game_coins + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(price - fee, listing.seller_id), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) VALUES (?, ?, 'game_coins', ?, 'market_purchase', 'listing', ?, ?)").bind(crypto.randomUUID(), user.id, -price, listingId, idempotency), db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id) VALUES (?, ?, 'game_coins', ?, 'market_sale', 'listing', ?)").bind(crypto.randomUUID(), listing.seller_id, price - fee, listingId)]);
  return ok({ listingId, status: "sold", priceGameCoins: price, platformFee: fee });
}

async function marketOrders(user: UserRow) {
  const result = await database().prepare("SELECT l.*, c.name, c.sku FROM market_listings l JOIN inventory_items i ON i.id = l.inventory_item_id JOIN catalog_items c ON c.id = i.catalog_item_id WHERE l.seller_id = ? OR l.buyer_id = ? ORDER BY l.created_at DESC LIMIT 100").bind(user.id, user.id).all();
  return ok({ items: result.results });
}

async function listPaymentMethods(user: UserRow) {
  const result = await database().prepare("SELECT id, provider, type, display_label, is_default, created_at FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC").bind(user.id).all(); return ok({ items: result.results });
}

async function createPaymentMethod(request: Request, user: UserRow) {
  const input = await body(request), provider = oneOf(stringField(input, "provider", { max: 30 })!, ["easypaisa", "jazzcash", "card"], "provider"), type = provider === "card" ? "card" : "mobile_wallet", token = stringField(input, "tokenizedReference", { min: 8, max: 300 })!, label = stringField(input, "displayLabel", { min: 4, max: 60 })!, makeDefault = boolField(input, "makeDefault") ?? false, id = crypto.randomUUID(), db = database();
  if (/\d{12,19}/.test(token) || /\d{12,19}/.test(label.replaceAll(" ", ""))) throw new ApiError(422, "RAW_PAYMENT_DATA_REJECTED", "Only provider-tokenized payment references are accepted");
  const statements = [...(makeDefault ? [db.prepare("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?").bind(user.id)] : []), db.prepare("INSERT INTO payment_methods (id, user_id, provider, type, display_label, provider_token, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, user.id, provider, type, label, token, makeDefault ? 1 : 0)]; await db.batch(statements);
  return created({ id, provider, type, displayLabel: label, isDefault: makeDefault });
}

async function deletePaymentMethod(user: UserRow, methodId: string) {
  const result = await database().prepare("DELETE FROM payment_methods WHERE id = ? AND user_id = ?").bind(methodId, user.id).run(); if (!result.meta.changes) throw new ApiError(404, "PAYMENT_METHOD_NOT_FOUND", "Payment method not found"); return empty();
}

async function createPaymentIntent(request: Request, user: UserRow) {
  const input = await body(request), methodId = stringField(input, "methodId", { max: 80 })!, amountPkr = intField(input, "amountPkr", 100, 100_000), diamonds = intField(input, "diamonds", 1, 100_000), bonus = input.bonusDiamonds === undefined ? 0 : intField(input, "bonusDiamonds", 0, 50_000), idempotency = stringField(input, "idempotencyKey", { max: 100 })!, db = database();
  const validPack = [
    { amountPkr: 280, diamonds: 60, bonus: 0 },
    { amountPkr: 1350, diamonds: 300, bonus: 20 },
    { amountPkr: 2850, diamonds: 680, bonus: 60 },
    { amountPkr: 5950, diamonds: 1480, bonus: 180 },
  ].some((pack) => pack.amountPkr === amountPkr && pack.diamonds === diamonds && pack.bonus === bonus);
  if (!validPack) throw new ApiError(422, "INVALID_PAYMENT_PACK", "Payment amount and Diamond pack do not match the server catalog");
  const existing = await db.prepare("SELECT * FROM payment_intents WHERE user_id = ? AND idempotency_key = ?").bind(user.id, idempotency).first(); if (existing) return ok(existing);
  const method = await db.prepare("SELECT provider, provider_token FROM payment_methods WHERE id = ? AND user_id = ?").bind(methodId, user.id).first<Row>(); if (!method) throw new ApiError(404, "PAYMENT_METHOD_NOT_FOUND", "Payment method not found");
  const id = crypto.randomUUID();
  const config = runtimeEnv();
  let providerReference: string | null = null;
  if (config.PAYMENT_PROVIDER_URL) {
    const response = await fetch(`${config.PAYMENT_PROVIDER_URL.replace(/\/$/, "")}/intents`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": idempotency, ...(config.PAYMENT_PROVIDER_TOKEN ? { authorization: `Bearer ${config.PAYMENT_PROVIDER_TOKEN}` } : {}) },
      body: JSON.stringify({ paymentId: id, provider: method.provider, methodToken: method.provider_token, amountPkr, currency: "PKR", metadata: { userId: user.id, diamonds, bonusDiamonds: bonus } }),
    });
    if (!response.ok) throw new ApiError(502, "PAYMENT_PROVIDER_UNAVAILABLE", "Payment provider could not create the payment");
    const providerPayload = await response.json() as Record<string, unknown>;
    if (typeof providerPayload.reference !== "string" || providerPayload.reference.length > 200) throw new ApiError(502, "PAYMENT_PROVIDER_INVALID", "Payment provider returned an invalid reference");
    providerReference = providerPayload.reference;
  } else if (config.SADA_ENV === "production") {
    throw new ApiError(503, "PAYMENT_NOT_CONFIGURED", "Payment provider is not configured");
  }
  await db.prepare("INSERT INTO payment_intents (id, user_id, method_id, amount_pkr, diamonds, bonus_diamonds, provider_reference, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, user.id, methodId, amountPkr, diamonds, bonus, providerReference, idempotency).run();
  return created({ id, amountPkr, diamonds, bonusDiamonds: bonus, providerReference, status: "requires_confirmation" });
}

async function confirmPayment(request: Request, user: UserRow, paymentId: string) {
  const input = await body(request), otp = stringField(input, "otp", { min: 6, max: 6 })!, db = database(), payment = await db.prepare("SELECT * FROM payment_intents WHERE id = ? AND user_id = ?").bind(paymentId, user.id).first<Row>();
  if (!payment) throw new ApiError(404, "PAYMENT_NOT_FOUND", "Payment intent not found"); if (payment.status === "succeeded") return ok(payment); if (payment.status !== "requires_confirmation") throw new ApiError(409, "PAYMENT_STATE_INVALID", "Payment cannot be confirmed in its current state");
  const config = runtimeEnv();
  if (config.PAYMENT_PROVIDER_URL) { const response = await fetch(`${config.PAYMENT_PROVIDER_URL.replace(/\/$/, "")}/confirm`, { method: "POST", headers: { "content-type": "application/json", ...(config.PAYMENT_PROVIDER_TOKEN ? { authorization: `Bearer ${config.PAYMENT_PROVIDER_TOKEN}` } : {}) }, body: JSON.stringify({ paymentId, providerReference: payment.provider_reference, otp }) }); if (!response.ok) throw new ApiError(402, "PAYMENT_DECLINED", "Payment provider declined the payment"); }
  else if (config.SADA_ENV === "production") throw new ApiError(503, "PAYMENT_NOT_CONFIGURED", "Payment provider is not configured");
  else if (otp !== "123456") throw new ApiError(402, "PAYMENT_DECLINED", "Use demo OTP 123456 in local development");
  if (config.SADA_ENV === "production") {
    await db.prepare("UPDATE payment_intents SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'requires_confirmation'").bind(paymentId).run();
    return ok({ id: paymentId, status: "processing", providerReference: payment.provider_reference });
  }
  const providerReference = String(payment.provider_reference ?? `SADA-LOCAL-${Date.now()}`);
  const wallet = await settlePayment(paymentId, providerReference);
  return ok({ id: paymentId, status: "succeeded", providerReference, wallet });
}

async function paymentReceipts(user: UserRow) {
  const result = await database().prepare("SELECT pi.id, pi.amount_pkr, pi.diamonds, pi.bonus_diamonds, pi.status, pi.provider_reference, pi.created_at, pi.updated_at, pm.display_label AS method_label FROM payment_intents pi LEFT JOIN payment_methods pm ON pm.id = pi.method_id WHERE pi.user_id = ? ORDER BY pi.created_at DESC LIMIT 100").bind(user.id).all(); return ok({ items: result.results });
}

async function paymentWebhook(request: Request) {
  const config = runtimeEnv();
  if (!config.PAYMENT_WEBHOOK_SECRET) throw new ApiError(503, "PAYMENT_WEBHOOK_NOT_CONFIGURED", "Payment webhook secret is not configured");
  const raw = await request.text();
  if (raw.length > 65_536) throw new ApiError(413, "BODY_TOO_LARGE", "Webhook body exceeds 64 KiB");
  const signatureHeader = request.headers.get("x-sada-signature") ?? "";
  const parts = Object.fromEntries(signatureHeader.split(",").map(part => part.trim().split("=", 2)));
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp * 1000) > 300_000) throw new ApiError(401, "WEBHOOK_TIMESTAMP_INVALID", "Webhook timestamp is invalid");
  const expected = await hmacSha256(config.PAYMENT_WEBHOOK_SECRET, `${timestamp}.${raw}`);
  if (!parts.v1 || !await secureEqual(parts.v1, expected)) throw new ApiError(401, "WEBHOOK_SIGNATURE_INVALID", "Webhook signature is invalid");
  let input: Record<string, unknown>;
  try { input = JSON.parse(raw) as Record<string, unknown>; } catch { throw new ApiError(400, "INVALID_JSON", "Webhook body must be valid JSON"); }
  const paymentId = stringField(input, "paymentId", { max: 80 })!;
  const providerReference = stringField(input, "providerReference", { max: 200 })!;
  const status = oneOf(stringField(input, "status", { max: 20 }), ["succeeded", "failed"], "status");
  if (status === "failed") {
    await database().prepare("UPDATE payment_intents SET status = 'failed', failure_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status <> 'succeeded'").bind(typeof input.failureCode === "string" ? input.failureCode.slice(0, 80) : "provider_declined", paymentId).run();
    return ok({ received: true, paymentId, status });
  }
  await settlePayment(paymentId, providerReference);
  return ok({ received: true, paymentId, status });
}

async function settlePayment(paymentId: string, providerReference: string) {
  const db = database();
  const payment = await db.prepare("SELECT * FROM payment_intents WHERE id = ?").bind(paymentId).first<Row>();
  if (!payment) throw new ApiError(404, "PAYMENT_NOT_FOUND", "Payment intent not found");
  if (!["requires_confirmation", "processing", "succeeded"].includes(String(payment.status))) throw new ApiError(409, "PAYMENT_STATE_INVALID", "Payment cannot be settled in its current state");
  if (payment.status !== "succeeded") {
    await db.batch([
      db.prepare("UPDATE wallets SET diamonds = diamonds + ?, bound_diamonds = bound_diamonds + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND EXISTS (SELECT 1 FROM payment_intents WHERE id = ? AND status IN ('requires_confirmation', 'processing'))").bind(payment.diamonds, payment.bonus_diamonds, payment.user_id, paymentId),
      db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) SELECT ?, ?, 'diamonds', ?, 'payment_recharge', 'payment', ?, ? WHERE EXISTS (SELECT 1 FROM payment_intents WHERE id = ? AND status IN ('requires_confirmation', 'processing'))").bind(crypto.randomUUID(), payment.user_id, payment.diamonds, paymentId, `payment:${paymentId}`, paymentId),
      db.prepare("INSERT INTO wallet_ledger (id, user_id, currency, amount, reason, reference_type, reference_id, idempotency_key) SELECT ?, ?, 'bound_diamonds', ?, 'payment_bonus', 'payment', ?, ? WHERE ? > 0 AND EXISTS (SELECT 1 FROM payment_intents WHERE id = ? AND status IN ('requires_confirmation', 'processing'))").bind(crypto.randomUUID(), payment.user_id, payment.bonus_diamonds, paymentId, `payment-bonus:${paymentId}`, payment.bonus_diamonds, paymentId),
      db.prepare("UPDATE payment_intents SET status = 'succeeded', provider_reference = ?, settled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('requires_confirmation', 'processing')").bind(providerReference, paymentId),
    ]);
  }
  return db.prepare("SELECT diamonds, bound_diamonds AS boundDiamonds, game_coins AS gameCoins FROM wallets WHERE user_id = ?").bind(payment.user_id).first();
}

async function hmacSha256(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function requestRefund(request: Request, user: UserRow, paymentId: string) {
  const input = await body(request), reason = stringField(input, "reason", { max: 80 })!, note = stringField(input, "note", { min: 0, max: 500, optional: true }) ?? "", db = database(), payment = await db.prepare("SELECT 1 FROM payment_intents WHERE id = ? AND user_id = ? AND status = 'succeeded'").bind(paymentId, user.id).first(); if (!payment) throw new ApiError(404, "RECEIPT_NOT_FOUND", "Successful payment receipt not found");
  const id = crypto.randomUUID(); await db.prepare("INSERT INTO refund_requests (id, payment_intent_id, user_id, reason, note) VALUES (?, ?, ?, ?, ?)").bind(id, paymentId, user.id, reason, note).run(); return created({ id, paymentId, status: "pending_review" });
}

async function safetyPreferences(user: UserRow) {
  const row = await database().prepare("SELECT private_account AS privateAccount, message_protection AS messageProtection, break_reminder AS breakReminder FROM user_safety_preferences WHERE user_id = ?").bind(user.id).first(); return ok(row);
}

async function updateSafetyPreferences(request: Request, user: UserRow) {
  const input = await body(request), privateAccount = boolField(input, "privateAccount"), messageProtection = boolField(input, "messageProtection"), breakReminder = boolField(input, "breakReminder");
  if (privateAccount === undefined && messageProtection === undefined && breakReminder === undefined) throw new ApiError(422, "NO_CHANGES", "No supported preference fields were supplied");
  await database().prepare("UPDATE user_safety_preferences SET private_account = COALESCE(?, private_account), message_protection = COALESCE(?, message_protection), break_reminder = COALESCE(?, break_reminder), updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(privateAccount === undefined ? null : Number(privateAccount), messageProtection === undefined ? null : Number(messageProtection), breakReminder === undefined ? null : Number(breakReminder), user.id).run(); return safetyPreferences(user);
}

async function createReport(request: Request, user: UserRow) {
  const input = await body(request), targetType = oneOf(stringField(input, "targetType", { max: 20 })!, ["user", "room", "message", "game", "drama", "payment"], "targetType"), targetId = stringField(input, "targetId", { max: 100 })!, reason = oneOf(stringField(input, "reason", { max: 50 })!, ["harassment", "sexual_or_violent", "scam_or_payment", "copyright", "other"], "reason"), details = stringField(input, "details", { min: 0, max: 2000, optional: true }) ?? "", id = crypto.randomUUID();
  await database().prepare("INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?)").bind(id, user.id, targetType, targetId, reason, details).run(); return created({ id, status: "received", confidential: true });
}

function page(rows: Row[], limit: number, map: (row: Row) => unknown = (row) => row, cursorField = "id") {
  const hasMore = rows.length > limit, items = rows.slice(0, limit); return ok({ items: items.map(map), nextCursor: hasMore ? String(items.at(-1)?.[cursorField] ?? "") : null });
}
