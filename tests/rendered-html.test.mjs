import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the SADA home experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="en-PK">/i);
  assert.match(html, /<title>SADA · Live, play, belong<\/title>/i);
  assert.match(html, /Good evening, Ayaan/);
  assert.match(html, /Karachi Night Chai/);
  assert.match(html, /Ludo Nights/);
  assert.match(html, /Dil Se Door/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.doesNotMatch(html, /Complete Interactive Prototype|Building your site/);
});

test("server-renders the independent SADA daytime entry", async () => {
  const response = await render("/day");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /data-theme="day"/);
  assert.match(html, /theme-day/);
  assert.match(html, /Good evening, Ayaan/);
});

test("ships the visual assets and interactive client surface", async () => {
  const [page, css, layout, localization, buttonSystem, spacingSystem, typographySystem] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/localization.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/button-system.css", import.meta.url), "utf8"),
    readFile(new URL("../app/spacing-system.css", import.meta.url), "utf8"),
    readFile(new URL("../app/typography-system.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /^"use client";/);
  assert.match(page, /Join room/);
  assert.match(page, /Connected · listening/);
  assert.match(page, /setActiveNav/);
  assert.match(page, /Find your people\./);
  assert.match(page, /VoiceRoomsScreen/);
  assert.match(page, /DramaPlayerScreen/);
  assert.match(page, /LudoGameScreen/);
  assert.match(page, /InboxScreen/);
  assert.match(page, /EconomyScreen/);
  assert.match(page, /ProfileScreen/);
  assert.match(page, /PlayerQuickCard/);
  assert.match(page, /sada:profile-peek/);
  assert.match(page, /View full profile/);
  assert.match(page, /Choose language/);
  assert.match(page, /home-shortcuts/);
  assert.match(css, /home-activity>span>i b/);
  assert.match(page, /晚上好，Ayaan/);
  assert.match(page, /شام بخیر، ایان/);
  assert.match(page, /dir=\{locale === "ur" \? "rtl" : "ltr"\}/);
  assert.match(localization, /useAppLocalization/);
  assert.match(localization, /"Wallet":"والیٹ"/);
  assert.match(localization, /"Safety center":"حفاظتی مرکز"/);
  assert.match(localization, /"Voice rooms": "语音房"/);
  assert.match(localization, /"Activity center": "活动中心"/);
  assert.match(page, /ActivityCenterScreen/);
  const systems = await readFile(new URL("../app/systems.tsx", import.meta.url), "utf8");
  const mindmapSystems = await readFile(new URL("../app/mindmap-systems.tsx", import.meta.url), "utf8");
  const prototypeFlows = await readFile(new URL("../app/prototype-flows.tsx", import.meta.url), "utf8");
  const payment = await readFile(new URL("../app/payment.tsx", import.meta.url), "utf8");
  const paymentCss = await readFile(new URL("../app/payment.css", import.meta.url), "utf8");
  const operationFlows = await readFile(new URL("../app/operation-flows.tsx", import.meta.url), "utf8");
  const operationFlowsCss = await readFile(new URL("../app/operation-flows.css", import.meta.url), "utf8");
  assert.match(systems, /Seven-day check-in/);
  assert.match(systems, /Effective online time/);
  assert.match(systems, /Only effective activity counts/);
  assert.match(systems, /MarketplaceScreen/);
  assert.match(systems, /Game Coin and Diamond never convert directly/);
  assert.match(systems, /Create listing/);
  assert.match(page, /Two currencies, separate purposes/);
  assert.match(page, /VIP levels/);
  assert.match(page, /Store item detail/);
  assert.match(page, /Pending/);
  assert.match(page, /Send a room gift/);
  assert.match(page, /Join discussion room/);
  assert.match(page, /Marketplace order pending/);
  assert.match(page, /InventoryCenterScreen/);
  assert.match(page, /Five guided moments unlock/);
  assert.match(page, /Verify and continue/);
  assert.match(page, /Build your profile/);
  assert.match(page, /Choose permissions/);
  assert.match(page, /Meet your first crew/);
  assert.match(page, /Use demo code/);
  assert.match(page, /Game Ticket Pack/);
  assert.match(page, /New Member Pack/);
  assert.match(systems, /SafetyCenterScreen/);
  assert.match(systems, /Case SADA-4821/);
  assert.match(systems, /PartnerCenterScreen/);
  assert.match(systems, /30-day launch journey/);
  assert.match(systems, /Crew leaderboard/);
  assert.match(systems, /Reward controls/);
  assert.match(systems, /Settlement queue/);
  assert.match(systems, /My collection/);
  assert.match(systems, /Partners receive only necessary anonymized data/);
  assert.match(systems, /activityPanel/);
  assert.match(systems, /Check-in rules/);
  assert.match(systems, /Top 20 crews/);
  assert.match(systems, /setListings/);
  assert.match(systems, /Blocked accounts/);
  assert.match(systems, /Cases & appeals/);
  assert.match(systems, /Healthy-use controls/);
  assert.match(systems, /pipeline-detail/);
  assert.match(systems, /Choose gift recipient/);
  assert.match(mindmapSystems, /SystemHubScreen/);
  assert.match(mindmapSystems, /SystemSectionScreen/);
  assert.match(mindmapSystems, /SystemModuleScreen/);
  assert.match(mindmapSystems, /Growth and activity/);
  assert.match(mindmapSystems, /Economy, store and VIP/);
  assert.match(mindmapSystems, /Open partner ecosystem/);
  assert.match(mindmapSystems, /Risk, governance and data/);
  assert.match(mindmapSystems, /Game developers/);
  assert.match(mindmapSystems, /Drama studios/);
  assert.match(mindmapSystems, /Data monitoring/);
  assert.match(prototypeFlows, /SearchScreen/);
  assert.match(prototypeFlows, /UserProfileScreen/);
  assert.match(prototypeFlows, /InviteFriendsScreen/);
  assert.match(prototypeFlows, /CreateRoomScreen/);
  assert.match(prototypeFlows, /CollectionScreen/);
  assert.match(prototypeFlows, /VipBenefitsScreen/);
  assert.match(prototypeFlows, /ProfileSettingsScreen/);
  assert.match(prototypeFlows, /GameHistoryScreen/);
  assert.match(prototypeFlows, /Confirm upgrade/);
  assert.match(page, /PaymentCenterScreen/);
  assert.match(page, /OperationFlowCenterScreen/);
  assert.match(page, /Complete operation flows/);
  assert.match(page, /diamondBalance/);
  assert.match(payment, /Easypaisa/);
  assert.match(payment, /JazzCash/);
  assert.match(payment, /Review payment/);
  assert.match(payment, /Enter the 6-digit code/);
  assert.match(payment, /Payment successful/);
  assert.match(payment, /Payment not completed/);
  assert.match(payment, /Payment history/);
  assert.match(payment, /Refund request/);
  assert.match(payment, /Payment methods/);
  assert.match(payment, /Add payment method/);
  assert.match(payment, /Payment method added and selected/);
  assert.match(paymentCss, /payment-protection/);
  assert.match(operationFlows, /13 end-to-end product journeys/);
  assert.match(operationFlows, /New user activation/);
  assert.match(operationFlows, /Recharge and payment recovery/);
  assert.match(operationFlows, /Game developer publishing/);
  assert.match(operationFlows, /Drama studio publishing/);
  assert.match(operationFlows, /Report, block and appeal/);
  assert.match(operationFlows, /Customer support case/);
  assert.match(operationFlows, /User action/);
  assert.match(operationFlows, /SADA response/);
  assert.match(operationFlows, /Exception branch/);
  assert.match(operationFlowsCss, /flow-step-card/);
  assert.match(operationFlowsCss, /flow-exception-sheet/);
  assert.match(localization, /"Payments & billing":"支付与账单"/);
  assert.match(localization, /"Payments & billing":"ادائیگی اور بلنگ"/);
  assert.match(localization, /"Payment methods":"支付方式管理"/);
  assert.match(localization, /"Payment methods":"ادائیگی کے طریقے"/);
  assert.match(localization, /"Complete operation flows": "完整操作流程"/);
  assert.match(localization, /"Complete operation flows": "مکمل عملی مراحل"/);
  assert.match(page, /Search store/);
  assert.match(page, /roomPanel/);
  assert.match(css, /--night-950:#030906/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(page, /button-system\.css/);
  assert.match(page, /spacing-system\.css/);
  assert.match(page, /typography-system\.css/);
  assert.match(page, /day-theme\.css/);
  assert.match(page, /onboarding\.css/);
  const dayTheme = await readFile(new URL("../app/day-theme.css", import.meta.url), "utf8");
  const dayEntry = await readFile(new URL("../app/day/page.tsx", import.meta.url), "utf8");
  assert.match(dayTheme, /#4d88fd/i);
  assert.match(dayTheme, /#b84df5/i);
  assert.match(dayTheme, /#ed74bd/i);
  assert.match(dayEntry, /theme="day"/);
  assert.match(buttonSystem, /--action-gold-900:#261908/);
  assert.match(buttonSystem, /\.payment-primary/);
  assert.match(buttonSystem, /\.profile-peek-actions \.primary/);
  assert.match(buttonSystem, /\.app-frame button:focus-visible/);
  assert.match(spacingSystem, /--space-6:\s*24px/);
  assert.match(spacingSystem, /--page-gutter:\s*20px/);
  assert.match(spacingSystem, /\.profile-peek-stats/);
  assert.match(typographySystem, /Source Han Sans SADA/);
  assert.match(typographySystem, /--weight-display:\s*800/);
  assert.match(typographySystem, /--weight-section:\s*700/);
  assert.match(typographySystem, /--weight-component:\s*650/);
  assert.match(layout, /title:\s*"SADA · Live, play, belong"/);
  for (const asset of ["sada-avatars.png", "sada-ludo.png", "sada-drama.png"]) {
    await access(new URL(`../public/media/${asset}`, import.meta.url));
  }
  await access(new URL("../public/media/frames/multan-voice.png", import.meta.url));
  await access(new URL("../public/fonts/source-han-sans-cn-vf.woff2", import.meta.url));
  await access(new URL("../public/fonts/LICENSE-source-han-sans.txt", import.meta.url));
  await access(new URL("../app/onboarding.css", import.meta.url));
});
