import { BrowserWindow, app, ipcMain, dialog, nativeTheme } from 'electron';
import path from 'path';
import Store from "electron-store";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dev = !app.isPackaged;
export let dropWindow: BrowserWindow;
export let settingsWindow: BrowserWindow;
export let onboardingWindow: BrowserWindow;

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
        minWidth: 400,
        minHeight: 300,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
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


export function createOnBoardingWindow() {
    onboardingWindow = new BrowserWindow({
        width: 600,
        height: 600,
        minWidth: 600,
        minHeight: 600,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        title: "ReDate",
        transparent: true,
        resizable: false,
        icon: path.join(dirName(), '/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(dirName() + "/preload.cjs")
        },
    })
    if (dev) {
        onboardingWindow.loadURL("http://localhost:5173/onboarding");
        onboardingWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        onboardingWindow.loadFile("build/onboarding.html");
    }
    onboardingWindow.show();
}
app.commandLine.appendSwitch('lang', 'en-US');
app.whenReady().then(() => {
    createOnBoardingWindow();
    return;
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