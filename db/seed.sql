INSERT OR IGNORE INTO users (id, display_name, bio, city, vip_level) VALUES
  ('demo-maira', 'Maira', 'Stories, music and good company.', 'Karachi', 3),
  ('demo-hamza', 'Hamza', 'Ludo rematches welcome.', 'Lahore', 2),
  ('demo-noor', 'Noor', 'Poetry after sunset.', 'Islamabad', 4);

INSERT OR IGNORE INTO wallets (user_id, diamonds, bound_diamonds, game_coins) VALUES
  ('demo-maira', 1250, 80, 8420), ('demo-hamza', 900, 40, 6100), ('demo-noor', 1800, 120, 10500);
INSERT OR IGNORE INTO user_safety_preferences (user_id) VALUES ('demo-maira'), ('demo-hamza'), ('demo-noor');

INSERT OR IGNORE INTO rooms (id, host_id, title, topic, privacy, listener_count) VALUES
  ('room-stories', 'demo-maira', 'Karachi Night Stories', 'Stories', 'public', 128),
  ('room-ludo', 'demo-hamza', 'Ludo & Chai', 'Games', 'public', 76),
  ('room-poetry', 'demo-noor', 'Poetry After Sunset', 'Poetry', 'public', 54);

INSERT OR IGNORE INTO catalog_items (id, sku, name, category, price_diamonds, price_game_coins, tradable, metadata) VALUES
  ('gift-rose', 'GIFT-ROSE', 'Emerald Rose', 'gift', 20, 0, 0, '{"emoji":"🌹"}'),
  ('gift-crown', 'GIFT-CROWN', 'Royal Crown', 'gift', 120, 0, 0, '{"emoji":"👑"}'),
  ('frame-crescent', 'FRAME-CRESCENT', 'Emerald Crescent', 'frame', 260, 0, 1, '{"rarity":"rare"}'),
  ('frame-night', 'FRAME-NIGHT', 'Night Society', 'frame', 0, 2400, 1, '{"rarity":"limited"}');

INSERT OR IGNORE INTO missions (id, title, event_type, target, reward_currency, reward_amount) VALUES
  ('mission-room-15', 'Stay in a voice room', 'room_minutes', 15, 'bound_diamonds', 10),
  ('mission-friend', 'Add a new friend', 'friend_added', 1, 'bound_diamonds', 10),
  ('mission-match', 'Complete one valid match', 'valid_match', 1, 'game_coins', 200),
  ('mission-gift', 'Send a room gift', 'room_gift', 1, 'bound_diamonds', 15);

INSERT OR IGNORE INTO payment_methods (id, user_id, provider, type, display_label, provider_token, is_default) VALUES
  ('pm-demo-maira', 'demo-maira', 'easypaisa', 'wallet', 'Easypaisa · 8842', 'tok_demo_maira', 1),
  ('pm-demo-hamza', 'demo-hamza', 'jazzcash', 'wallet', 'JazzCash · 6100', 'tok_demo_hamza', 1);

INSERT OR IGNORE INTO payment_intents (id, user_id, method_id, amount_pkr, diamonds, bonus_diamonds, status, provider_reference, idempotency_key, created_at, updated_at) VALUES
  ('pay-demo-1001', 'demo-maira', 'pm-demo-maira', 499, 500, 25, 'succeeded', 'EP-72839102', 'seed-pay-1001', datetime('now', '-20 minutes'), datetime('now', '-20 minutes')),
  ('pay-demo-1002', 'demo-hamza', 'pm-demo-hamza', 999, 1100, 80, 'succeeded', 'JC-72839101', 'seed-pay-1002', datetime('now', '-2 hours'), datetime('now', '-2 hours')),
  ('pay-demo-1003', 'demo-noor', NULL, 2499, 3000, 300, 'requires_confirmation', NULL, 'seed-pay-1003', datetime('now', '-5 hours'), datetime('now', '-5 hours'));

INSERT OR IGNORE INTO reports (id, reporter_id, target_type, target_id, reason, details, status, created_at, updated_at) VALUES
  ('report-demo-1001', 'demo-noor', 'room', 'room-ludo', 'harassment', 'Repeated insults during a public game room.', 'received', datetime('now', '-12 minutes'), datetime('now', '-12 minutes')),
  ('report-demo-1002', 'demo-maira', 'user', 'demo-hamza', 'spam', 'Posted the same off-platform link several times.', 'reviewing', datetime('now', '-48 minutes'), datetime('now', '-48 minutes')),
  ('report-demo-1003', 'demo-hamza', 'room', 'room-poetry', 'misinformation', 'Potentially misleading promotion in room description.', 'received', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
