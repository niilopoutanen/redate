import { BrowserWindow, app, ipcMain, dialog, nativeTheme } from 'electron';
import path from 'path';
import Store from "electron-store";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dev = !app.isPackaged;
export let dropWindow: BrowserWindow;
export let settingsWindow: BrowserWindow;
export const store = new Store({
    defaults: {
        guiConfig: {
            confirmProcessing: true,
            quitWhenDone: false
        }
    }
});

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
            nodeIntegration: true,
            preload: path.join(dirName() + "/preload.cjs")
        },
    })

    if (dev) {
        dropWindow.loadURL("http://localhost:5173/drop");
        dropWindow.webContents.openDevTools({ mode: "detach" });

    }
    else {
        dropWindow.loadFile("build/drop.html");

    }

    dropWindow.show();
}

export function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 700,
        height: 400,
        minWidth: 350,
        minHeight: 300,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        backgroundMaterial: "mica",
        title: "ReDate Settings",
        icon: path.join(dirName(), '/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(dirName() + "/preload.cjs")
        },
    })
    if (dev) {
        settingsWindow.loadURL("http://localhost:5173/settings");
        settingsWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        settingsWindow.loadFile("build/settings.html");
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
})

app.on('window-all-closed', () => {
    app.quit();
});

function dirName() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return __dirname;
}