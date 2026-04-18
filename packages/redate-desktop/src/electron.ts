import { BrowserWindow, app, ipcMain, dialog, nativeTheme, protocol, nativeImage } from 'electron';
import pkg from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from "redate-cli";

const { autoUpdater } = pkg;
const dev = !app.isPackaged;
export let dropWindow: BrowserWindow;
export let settingsWindow: BrowserWindow;
export let previewWindow: BrowserWindow;


import "./ipc.js";

declare global {
    interface Window {
        electron: any;
    }
}

export function createDropWindow() {
    if (dropWindow && !dropWindow.isDestroyed()) {
        dropWindow.focus();
        return;
    }

    const size = Number(config.get("gui.dropWindowSize"));
    const base = Number.isFinite(size) ? size : 200;

    const width = Math.round(base * 1.05);
    const height = Math.round(base);


    dropWindow = new BrowserWindow({
        width: width,
        height: height,
        minWidth: width,
        minHeight: height,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        transparent: true,
        title: "ReDate",
        icon: path.join(dirName(), '/icon.png'),
        webPreferences: {
            preload: path.join(dirName() + "/preload.cjs")
        },
    })

    if (dev) {
        dropWindow.loadURL("http://localhost:5173/drop");
        dropWindow.webContents.openDevTools({ mode: "detach" });

    }
    else {
        dropWindow.loadFile("build/drop/index.html");
    }

    dropWindow.show();
    dropWindow.on('closed', () => {
        app.quit();
    });
}

export function createPreviewWindow() {
    previewWindow = new BrowserWindow({
        width: 700,
        height: 400,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        title: "Preview selected files",
        icon: path.join(dirName(), '/icon.png'),
        vibrancy: "under-window",
        backgroundMaterial: "mica",
        webPreferences: {
            preload: path.join(dirName() + "/preload.cjs")
        },
    })
    if (dev) {
        previewWindow.loadURL("http://localhost:5173/preview");
        previewWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        previewWindow.loadFile("build/preview/index.html");
    }
    previewWindow.show();
}

export function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 900,
        height: 450,
        minWidth: 450,
        minHeight: 300,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        title: "ReDate Settings",
        vibrancy: "under-window",
        icon: path.join(dirName(), '/icon.png'),
        webPreferences: {
            preload: path.join(dirName() + "/preload.cjs")
        },
    })
    if (dev) {
        settingsWindow.loadURL("http://localhost:5173/settings");
        settingsWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        settingsWindow.loadFile("build/settings/index.html");
    }
    settingsWindow.show();
}

app.commandLine.appendSwitch('lang', 'en-US');
app.whenReady().then(() => {
    createDropWindow();
    nativeTheme.themeSource = "dark";
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createDropWindow()
    })

    autoUpdater.checkForUpdatesAndNotify();

    protocol.handle("thum", async (request) => {
        try {
            const u = new URL(request.url);

            let filePath = decodeURIComponent(u.pathname);

            if (process.platform === "win32") {
                if (filePath.startsWith("/")) {
                    filePath = filePath.slice(1);
                }
            }

            filePath = path.normalize(filePath);

            const image = await nativeImage.createThumbnailFromPath(filePath, {
                width: 200,
                height: 200,
            });

            if (image.isEmpty()) {
                return new Response("Thumbnail failed", { status: 404 });
            }

            return new Response(new Uint8Array(image.toPNG()), {
                headers: { "content-type": "image/png" },
            });

        } catch (err) {
            return new Response("Bad thumbnail request", { status: 400 });
        }
    });

})

app.on('window-all-closed', () => {
    app.quit();
});

function dirName() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return __dirname;
}