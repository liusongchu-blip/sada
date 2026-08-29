/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("sadaDesktop", {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
});
