import { BrowserWindow, app, ipcMain, dialog, nativeTheme, protocol, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



const dev = !app.isPackaged;
export let dropWindow: BrowserWindow;
export let settingsWindow: BrowserWindow;
export let onboardingWindow: BrowserWindow;


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

    dropWindow = new BrowserWindow({
        width: 210,
        height: 200,
        maxWidth: 600,
        maxHeight: 200,
        minWidth: 210,
        minHeight: 200,
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

export function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 700,
        height: 400,
        minWidth: 400,
        minHeight: 300,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        title: "ReDate Settings",
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

    protocol.handle("thum", async (request) => {
        let url = request.url.slice("thum:///".length);
        const image = await nativeImage.createThumbnailFromPath(url, {
            width: 200,
            height: 200,
        });
        const png = image.toPNG();
        return new Response(new Uint8Array(png), {
            headers: { "content-type": "image/png" },
        });
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