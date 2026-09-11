import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), phone: text("phone"), externalSubject: text("external_subject"),
  email: text("email"), displayName: text("display_name").notNull(), bio: text("bio").notNull().default(""),
  city: text("city").notNull().default("Karachi"), avatarUrl: text("avatar_url"),
  locale: text("locale").notNull().default("en"), vipLevel: integer("vip_level").notNull().default(0),
  status: text("status").notNull().default("active"), ...timestamps,
}, (table) => [uniqueIndex("users_phone_unique").on(table.phone), uniqueIndex("users_external_subject_unique").on(table.externalSubject), index("users_display_name_idx").on(table.displayName)]);

export const otpChallenges = sqliteTable("otp_challenges", {
  id: text("id").primaryKey(), phone: text("phone").notNull(), codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0), expiresAt: text("expires_at").notNull(), consumedAt: text("consumed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("otp_phone_created_idx").on(table.phone, table.createdAt)]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(), expiresAt: text("expires_at").notNull(), revokedAt: text("revoked_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash), index("sessions_user_idx").on(table.userId)]);

export const wallets = sqliteTable("wallets", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  diamonds: integer("diamonds").notNull().default(0), boundDiamonds: integer("bound_diamonds").notNull().default(0),
  gameCoins: integer("game_coins").notNull().default(0), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const follows = sqliteTable("follows", {
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followedId: text("followed_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("follows_pair_unique").on(table.followerId, table.followedId), index("follows_followed_idx").on(table.followedId)]);

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(), hostId: text("host_id").notNull().references(() => users.id), title: text("title").notNull(),
  topic: text("topic").notNull().default("Stories"), privacy: text("privacy").notNull().default("public"),
  status: text("status").notNull().default("live"), listenerCount: integer("listener_count").notNull().default(0), ...timestamps,
}, (table) => [index("rooms_status_updated_idx").on(table.status, table.updatedAt)]);

export const roomMembers = sqliteTable("room_members", {
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), role: text("role").notNull().default("listener"),
  muted: integer("muted", { mode: "boolean" }).notNull().default(false), joinedAt: text("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`), leftAt: text("left_at"),
}, (table) => [uniqueIndex("room_members_pair_unique").on(table.roomId, table.userId), index("room_members_user_idx").on(table.userId)]);

export const roomMessages = sqliteTable("room_messages", {
  id: text("id").primaryKey(), roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id), body: text("body").notNull(), kind: text("kind").notNull().default("text"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("room_messages_room_created_idx").on(table.roomId, table.createdAt)]);

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(), kind: text("kind").notNull().default("direct"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const conversationMembers = sqliteTable("conversation_members", {
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), lastReadAt: text("last_read_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("conversation_members_pair_unique").on(table.conversationId, table.userId), index("conversation_members_user_idx").on(table.userId)]);

export const directConversationKeys = sqliteTable("direct_conversation_keys", {
  memberKey: text("member_key").primaryKey(), conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id), body: text("body").notNull(), kind: text("kind").notNull().default("text"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("messages_conversation_created_idx").on(table.conversationId, table.createdAt)]);

export const catalogItems = sqliteTable("catalog_items", {
  id: text("id").primaryKey(), sku: text("sku").notNull(), name: text("name").notNull(), category: text("category").notNull(),
  priceDiamonds: integer("price_diamonds").notNull().default(0), priceGameCoins: integer("price_game_coins").notNull().default(0),
  tradable: integer("tradable", { mode: "boolean" }).notNull().default(false),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  status: text("status").notNull().default("active"), ...timestamps,
}, (table) => [uniqueIndex("catalog_sku_unique").on(table.sku)]);

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  catalogItemId: text("catalog_item_id").notNull().references(() => catalogItems.id), quantity: integer("quantity").notNull().default(1),
  bound: integer("bound", { mode: "boolean" }).notNull().default(false), equipped: integer("equipped", { mode: "boolean" }).notNull().default(false),
  expiresAt: text("expires_at"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("inventory_user_idx").on(table.userId)]);

export const walletLedger = sqliteTable("wallet_ledger", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currency: text("currency").notNull(), amount: integer("amount").notNull(), reason: text("reason").notNull(),
  referenceType: text("reference_type"), referenceId: text("reference_id"), idempotencyKey: text("idempotency_key"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("wallet_ledger_user_created_idx").on(table.userId, table.createdAt), uniqueIndex("wallet_ledger_idempotency_unique").on(table.userId, table.idempotencyKey)]);

export const marketListings = sqliteTable("market_listings", {
  id: text("id").primaryKey(), sellerId: text("seller_id").notNull().references(() => users.id),
  inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItems.id), priceGameCoins: integer("price_game_coins").notNull(),
  status: text("status").notNull().default("active"), buyerId: text("buyer_id").references(() => users.id), soldAt: text("sold_at"), ...timestamps,
}, (table) => [index("market_status_created_idx").on(table.status, table.createdAt)]);

export const paymentMethods = sqliteTable("payment_methods", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), type: text("type").notNull(), displayLabel: text("display_label").notNull(),
  providerToken: text("provider_token").notNull(), isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("payment_methods_user_idx").on(table.userId)]);

export const paymentIntents = sqliteTable("payment_intents", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), methodId: text("method_id").references(() => paymentMethods.id),
  amountPkr: integer("amount_pkr").notNull(), diamonds: integer("diamonds").notNull(), bonusDiamonds: integer("bonus_diamonds").notNull().default(0),
  status: text("status").notNull().default("requires_confirmation"), providerReference: text("provider_reference"),
  idempotencyKey: text("idempotency_key").notNull(), failureCode: text("failure_code"), settledAt: text("settled_at"), ...timestamps,
}, (table) => [uniqueIndex("payment_intents_user_idempotency_unique").on(table.userId, table.idempotencyKey), index("payment_intents_user_created_idx").on(table.userId, table.createdAt)]);

export const refundRequests = sqliteTable("refund_requests", {
  id: text("id").primaryKey(), paymentIntentId: text("payment_intent_id").notNull().references(() => paymentIntents.id),
  userId: text("user_id").notNull().references(() => users.id), reason: text("reason").notNull(), note: text("note").notNull().default(""),
  status: text("status").notNull().default("pending_review"), ...timestamps,
}, (table) => [index("refunds_user_created_idx").on(table.userId, table.createdAt)]);

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(), title: text("title").notNull(), eventType: text("event_type").notNull(), target: integer("target").notNull(),
  rewardCurrency: text("reward_currency").notNull(), rewardAmount: integer("reward_amount").notNull(), status: text("status").notNull().default("active"),
  startsAt: text("starts_at"), endsAt: text("ends_at"),
});

export const missionProgress = sqliteTable("mission_progress", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }), progress: integer("progress").notNull().default(0),
  claimedAt: text("claimed_at"), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("mission_progress_pair_unique").on(table.userId, table.missionId)]);

export const dailyCheckIns = sqliteTable("daily_check_ins", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), checkInDate: text("check_in_date").notNull(),
  streakDay: integer("streak_day").notNull(), rewardDiamonds: integer("reward_diamonds").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("daily_check_ins_pair_unique").on(table.userId, table.checkInDate)]);

export const userSafetyPreferences = sqliteTable("user_safety_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  privateAccount: integer("private_account", { mode: "boolean" }).notNull().default(false),
  messageProtection: integer("message_protection", { mode: "boolean" }).notNull().default(true),
  breakReminder: integer("break_reminder", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(), reporterId: text("reporter_id").notNull().references(() => users.id), targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(), reason: text("reason").notNull(), details: text("details").notNull().default(""),
  status: text("status").notNull().default("received"), ...timestamps,
}, (table) => [index("reports_status_created_idx").on(table.status, table.createdAt)]);
