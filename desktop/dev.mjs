import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const electronBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "electron.cmd" : "electron",
);
const url = "http://127.0.0.1:3010";
const desktopEntry = ".";

const web = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3010"], {
  cwd: projectRoot,
  env: { ...process.env, VINEXT_NO_DEV_LOCK: "1" },
  stdio: "inherit",
});

async function waitForServer(attempts = 120) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

function stopWeb() {
  if (!web.killed) web.kill("SIGTERM");
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopWeb();
    process.exit(0);
  });
}

if (!(await waitForServer())) {
  console.error("SADA development server did not start.");
  stopWeb();
  process.exit(1);
}

const desktop = spawn(electronBin, [desktopEntry], {
  cwd: projectRoot,
  env: { ...process.env, SADA_DESKTOP_URL: url },
  stdio: "inherit",
});

desktop.on("exit", (code) => {
  stopWeb();
  process.exit(code ?? 0);
});
