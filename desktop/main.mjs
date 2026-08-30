import { app, BrowserWindow, Menu, nativeImage, shell } from "electron";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const desktopDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(desktopDir, "..");
const desktopTheme = process.env.SADA_DESKTOP_THEME === "day" ? "day" : "night";
const productName = desktopTheme === "day" ? "SADA Day" : "SADA";
const startPath = desktopTheme === "day" ? "/day" : "/";
const productionPort = desktopTheme === "day" ? 3787 : 3786;
const trustedOrigins = new Set([
  `http://127.0.0.1:${productionPort}`,
  "http://127.0.0.1:3010",
]);

let mainWindow;
let serverProcess;

function installApplicationMenu() {
  const template = [
    {
      label: productName,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "显示",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { label: "窗口", submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "front" }] },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function waitForServer(url, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error(`SADA local service did not become ready at ${url}`);
}

async function resolveAppUrl() {
  if (process.env.SADA_DESKTOP_URL) {
    trustedOrigins.add(new URL(process.env.SADA_DESKTOP_URL).origin);
    await waitForServer(process.env.SADA_DESKTOP_URL);
    return process.env.SADA_DESKTOP_URL;
  }

  const serverEntry = path.join(appRoot, "dist", "standalone", "server.js");
  if (!existsSync(serverEntry)) {
    throw new Error("Missing desktop production build. Run `npm run build` first.");
  }

  const url = `http://127.0.0.1:${productionPort}`;
  if (serverProcess && !serverProcess.killed) return url;

  const child = spawn(process.execPath, [serverEntry], {
    cwd: path.dirname(serverEntry),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOST: "127.0.0.1",
      PORT: String(productionPort),
      NODE_ENV: "production",
    },
    stdio: process.env.SADA_DESKTOP_SMOKE === "1" ? "inherit" : "ignore",
  });
  serverProcess = child;
  child.once("exit", () => {
    if (serverProcess === child) serverProcess = undefined;
  });

  await waitForServer(url);
  return url;
}

function isTrusted(url) {
  try {
    return trustedOrigins.has(new URL(url).origin);
  } catch {
    return false;
  }
}

async function createWindow() {
  const iconPath = path.join(desktopDir, "assets", desktopTheme === "day" ? "icon-day.png" : "icon.png");
  const icon = nativeImage.createFromPath(iconPath);
  app.setName(productName);
  if (process.platform === "darwin" && desktopTheme === "day" && app.dock) {
    app.dock.setIcon(icon);
  }
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 680,
    backgroundColor: desktopTheme === "day" ? "#ffffff" : "#030906",
    title: productName,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 18, y: 18 },
    icon,
    show: false,
    webPreferences: {
      preload: path.join(desktopDir, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isTrusted(url)) event.preventDefault();
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  const uiErrors = [];
  if (process.env.SADA_DESKTOP_UI_SMOKE === "1") {
    mainWindow.webContents.on("console-message", (_event, level, message) => {
      if (level >= 2) uiErrors.push(message);
    });
  }
  if (process.env.SADA_DESKTOP_SMOKE === "1") {
    mainWindow.webContents.once("did-finish-load", async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
      if (process.env.SADA_DESKTOP_CAPTURE_PATH) {
        const screenshot = await mainWindow.webContents.capturePage();
        await writeFile(process.env.SADA_DESKTOP_CAPTURE_PATH, screenshot.toPNG());
      }
      console.log(`[desktop-smoke] ${productName} loaded successfully at ${mainWindow?.webContents.getURL()}`);
      setTimeout(() => app.quit(), 300);
    });
  }

  const baseUrl = await resolveAppUrl();
  const url = new URL(baseUrl);
  if (desktopTheme === "day" && url.pathname === "/") url.pathname = startPath;
  url.searchParams.set("desktop", "1");
  await mainWindow.loadURL(url.toString());
  if (process.env.SADA_DESKTOP_UI_SMOKE === "1") {
    mainWindow.setContentSize(390, 844);
    if (process.env.SADA_SCREENSHOT_PATH) {
      const screenshot = await mainWindow.webContents.capturePage();
      await writeFile(process.env.SADA_SCREENSHOT_PATH, screenshot.toPNG());
    }
    const result = await mainWindow.webContents.executeJavaScript(`(async()=>{
      const wait=()=>new Promise(resolve=>setTimeout(resolve,180));
      const click=async text=>{const element=[...document.querySelectorAll('button')].find(item=>item.textContent.includes(text));if(!element)throw new Error('Missing button: '+text+' among '+[...document.querySelectorAll('button')].map(item=>item.textContent.trim()).join('|'));element.click();await wait()};
      const clickAria=async label=>{const element=document.querySelector('button[aria-label="'+label+'"]');if(!element)throw new Error('Missing aria button: '+label);element.click();await wait()};
      await clickAria('Language');await click('中文');
      const chineseReady=document.querySelector('.app-scroll h1')?.textContent.includes('晚上好');
      await clickAria('Language');await click('English');await clickAria('Language');await click('اردو');
      const urduReady=document.querySelector('.app-frame')?.dir==='rtl';
      await clickAria('Language');await click('English');
      document.querySelector('.friend-rail .avatar')?.click();await wait();
      const profilePeekReady=Boolean(document.querySelector('.profile-peek'))&&document.querySelector('.profile-peek h2')?.textContent.includes('Hamza');
      await click('Message');
      const avatarMessageReady=Boolean(document.querySelector('.chat-screen'));
      await clickAria('Back');await click('Home');await click('Profile');await click('Payments & billing');
      const paymentReady=Boolean(document.querySelector('.payment-packs'));
      await click('Manage');
      const paymentMethodsReady=document.querySelectorAll('.managed-methods article').length;
      await click('+ Add payment method');
      const setInput=(element,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}))};
      const methodInput=document.querySelector('.add-method-field input');setInput(methodInput,'03001234567');await wait();
      await click('Save and use method');
      const addedMethodReady=[...document.querySelectorAll('.managed-methods strong')].some(item=>item.textContent.includes('567'));
      await clickAria('Back');await click('Review');await click('Continue securely');
      const otpInput=document.querySelector('.otp-field input');setInput(otpInput,'123456');await wait();
      await click('Pay PKR');await wait();await wait();await wait();await wait();await wait();
      const paymentSuccessReady=Boolean(document.querySelector('.payment-state-icon.success'));
      const rechargedBalance=document.querySelector('.payment-state-order strong')?.textContent;
      await click('Return to Wallet');await clickAria('Back');await click('Platform systems');
      const hub=[...document.querySelectorAll('.system-hub-grid>button')].map(item=>item.textContent.trim());
      await click('Growth and activity');
      const modules=[...document.querySelectorAll('.system-module-list>button')].length;
      await click('New-user journey');
      const controls=[...document.querySelectorAll('.module-group>button')];controls[0].click();await wait();
      const partial=document.querySelector('.module-status strong')?.textContent;
      await click('Run full module review');
      const complete=document.querySelector('.module-action')?.textContent;
      await clickAria('Back');await clickAria('Back');await clickAria('Back');await clickAria('Back');
      await clickAria('Search SADA');
      const searchSections=document.querySelectorAll('.flow-section').length;
      await click('Maira');
      const profileReady=Boolean(document.querySelector('.public-profile'));
      await click('Message');
      const chatReady=Boolean(document.querySelector('.chat-screen'));
      await clickAria('Back');await click('Home');
      await clickAria('Invite a friend');await click('Areeba');await click('Send 1 invite');
      const inviteReady=document.querySelector('.flow-success h2')?.textContent;
      await click('Done');await clickAria('See all live rooms');await click('+ Start a room');await click('Preview room');await click('Go live');
      const roomReady=Boolean(document.querySelector('.room-detail'));
      await click('Invite');
      const roomInviteReady=Boolean(document.querySelector('.room-invite-list'));
      await click('Maira');await clickAria('More options');
      const roomMenuReady=Boolean(document.querySelector('.room-menu-list'));
      await click('×');await clickAria('Leave room');await clickAria('Back');
      await click('Profile');await click('Store');await clickAria('Search store');
      const storeSearchReady=Boolean(document.querySelector('.flow-search'));
      await clickAria('Back');await click('Profile');await click('Store');await clickAria('My collection');
      const collectionReady=Boolean(document.querySelector('.collection-grid'));
      await clickAria('Back');await clickAria('Back');await click('VIP membership');await click('Entrance effect');
      const benefitsReady=Boolean(document.querySelector('.benefit-list'));
      await click('Upgrade to VIP 4');await click('Confirm upgrade');
      const upgradeReady=document.querySelector('.mini-success h2')?.textContent;
      await click('View benefits');await clickAria('Back');await clickAria('Back');
      await click('Activity center');await click('Rules');
      const activityRulesReady=Boolean(document.querySelector('.detail-rule-list'));
      await clickAria('Close');await click('Habit building');
      const phaseReady=Boolean(document.querySelector('.phase-task-list'));
      await clickAria('Close');await click('Top 20');
      const leaderboardReady=document.querySelectorAll('.leaderboard.full article').length;
      await clickAria('Close');await clickAria('Back');await click('Marketplace');await click('My listings');await click('+ List an item');await click('Submit listing');
      const listingReady=document.querySelector('.order-list article strong')?.textContent;
      await clickAria('Back');await click('Safety & privacy');await click('Blocked accounts');
      const blockedReady=document.querySelectorAll('.blocked-list article').length;
      await clickAria('Close');await click('Appeals & case status');
      const appealsReady=document.querySelectorAll('.case-list article').length;
      await clickAria('Close');await click('Age and wellbeing');
      const wellbeingReady=Boolean(document.querySelector('.wellbeing-time'));
      await clickAria('Close');await clickAria('Back');await click('Partner center');await click('Complete step');
      const partnerStepReady=document.querySelector('.pipeline-detail h2')?.textContent;
      await clickAria('Back');await click('My collection');await click('Gifts');await click('Emerald Rose');await click('Send gift');
      const giftFlowReady=Boolean(document.querySelector('.gift-recipient-list'));
      await click('Maira');
      const overflow=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {chineseReady,urduReady,profilePeekReady,avatarMessageReady,paymentReady,paymentMethodsReady,addedMethodReady,paymentSuccessReady,rechargedBalance,hubCount:hub.length,hub,modules,controls:controls.length,partial,complete,searchSections,profileReady,chatReady,inviteReady,roomReady,roomInviteReady,roomMenuReady,storeSearchReady,collectionReady,benefitsReady,upgradeReady,activityRulesReady,phaseReady,leaderboardReady,listingReady,blockedReady,appealsReady,wellbeingReady,partnerStepReady,giftFlowReady,overflow,dir:document.querySelector('.app-frame')?.dir};
    })()`);
    if (!result.chineseReady || !result.urduReady || !result.profilePeekReady || !result.avatarMessageReady || !result.paymentReady || result.paymentMethodsReady !== 3 || !result.addedMethodReady || !result.paymentSuccessReady || !result.rechargedBalance?.includes("1,570") || result.hubCount !== 4 || result.modules !== 4 || result.controls < 8 || result.complete !== "Review complete" || result.searchSections < 4 || !result.profileReady || !result.chatReady || result.inviteReady !== "Invites sent" || !result.roomReady || !result.roomInviteReady || !result.roomMenuReady || !result.storeSearchReady || !result.collectionReady || !result.benefitsReady || result.upgradeReady !== "VIP 4 activated" || !result.activityRulesReady || !result.phaseReady || result.leaderboardReady < 6 || result.listingReady !== "Emerald Crescent" || result.blockedReady !== 3 || result.appealsReady !== 2 || !result.wellbeingReady || result.partnerStepReady !== "Review" || !result.giftFlowReady || result.overflow !== 0 || uiErrors.length) {
      throw new Error(`UI smoke failed: ${JSON.stringify({ ...result, uiErrors })}`);
    }
    console.log(`[desktop-ui-smoke] ${JSON.stringify(result)}`);
    setTimeout(() => app.quit(), 200);
  }
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) serverProcess.kill("SIGTERM");
  serverProcess = undefined;
}

app.whenReady().then(async () => {
  installApplicationMenu();
  try {
    await createWindow();
  } catch (error) {
    console.error("[SADA desktop]", error);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on("before-quit", stopServer);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
