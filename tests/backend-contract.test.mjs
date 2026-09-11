import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/v1/[...segments]/route.ts", import.meta.url), "utf8");
const schemaSource = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
const hosting = JSON.parse(await readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"));

test("backend exposes every product domain used by the prototype", () => {
  for (const path of [
    "/auth/otp/request", "/me", "/rooms", "/conversations", "/activities",
    "/catalog", "/inventory", "/store/purchases", "/vip/upgrade",
    "/market/listings", "/payments/methods", "/payments/intents",
    "/safety/preferences", "/reports",
  ]) assert.match(routeSource, new RegExp(path.replaceAll("/", "\\/")));
});

test("database schema includes identity, social, economy, payment and safety records", () => {
  for (const table of [
    "users", "sessions", "wallets", "rooms", "room_messages", "conversations",
    "messages", "catalog_items", "inventory_items", "wallet_ledger",
    "market_listings", "payment_intents", "refund_requests", "missions", "reports",
  ]) assert.match(schemaSource, new RegExp(`sqliteTable\\(\\"${table}\\"`));
  assert.equal(hosting.d1, "DB");
});

test("money-changing endpoints require idempotency and reject raw payment data", () => {
  assert.match(routeSource, /idempotencyKey/);
  assert.match(routeSource, /RAW_PAYMENT_DATA_REJECTED/);
  assert.match(routeSource, /INVALID_PAYMENT_PACK/);
  assert.match(routeSource, /status = 'requires_confirmation'/);
});

test("admin surface exposes protected overview and moderation mutations", () => {
  assert.match(routeSource, /segments\[0\] === "admin"/);
  assert.match(routeSource, /resource === "overview"/);
  assert.match(routeSource, /resource === "users"/);
  assert.match(routeSource, /requireAdmin\(request\)/);
  assert.match(routeSource, /updateAdminUser/);
  assert.match(routeSource, /updateAdminRoom/);
  assert.match(routeSource, /updateAdminReport/);
});
