import { app, BrowserWindow, Menu, protocol, session, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../src/config/desktop.json" with { type: "json" };
import { allowedExternal, serveAsset } from "./protocol.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const assetRoot = path.resolve(directory, "../out");
const origin = `${config.scheme}://${config.host}`;
if (process.env.NODE_ENV === "test" && process.env.GSV_TEST_USER_DATA) app.setPath("userData", process.env.GSV_TEST_USER_DATA);
app.setName(config.displayName);
protocol.registerSchemesAsPrivileged([{ scheme: config.scheme, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
let mainWindow;
function openExternal(url) {
  if (allowedExternal(url, config.externalHosts)) void shell.openExternal(url).catch(() => {});
}
function createWindow() {
  mainWindow = new BrowserWindow({ width: config.width, height: config.height, minWidth: config.minWidth, minHeight: config.minHeight,
    title: config.displayName, backgroundColor: "#f5f1e5", show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, spellcheck: false },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { openExternal(url); return { action: "deny" }; });
  mainWindow.webContents.on("will-navigate", (event, url) => { if (!url.startsWith(`${origin}/`)) { event.preventDefault(); openExternal(url); } });
  mainWindow.webContents.on("will-redirect", (event) => event.preventDefault());
  mainWindow.webContents.on("will-attach-webview", event => event.preventDefault());
  mainWindow.once("ready-to-show", () => mainWindow.show());
  void mainWindow.loadURL(`${origin}${config.entryPath}`);
}
app.whenReady().then(() => {
  // Keep the installed app's Dock identity aligned with the wuxia manual. The
  // PNG is bundled locally, so the icon is available in the offline desktop build.
  if (process.platform === "darwin" && app.dock) app.dock.setIcon(path.resolve(assetRoot, "brand/jianghu-manual-icon-v1.png"));
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    // All teaching data and art are local. External docs open in the user's browser, never in the renderer.
    callback({ cancel: !details.url.startsWith(`${origin}/`) && !details.url.startsWith("blob:") && !details.url.startsWith("data:") && details.url !== "devtools://devtools/bundled/inspector.html" });
  });
  protocol.handle(config.scheme, request => serveAsset(assetRoot, request, config));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { role: "editMenu" }, { label: "视图", submenu: [{ role: "reload" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { role: "togglefullscreen" }] },
    { label: "窗口", submenu: [{ role: "minimize" }, { role: "close" }] },
    { label: "演示", submenu: [
      { label: "录屏演示（不读写正式存档）", click: () => { void mainWindow?.loadURL(`${origin}/adventure-demo/`); } },
      { label: "返回正式历练", click: () => { void mainWindow?.loadURL(`${origin}${config.entryPath}`); } },
    ] },
  ]));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
