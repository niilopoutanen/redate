import { BrowserWindow, app, ipcMain, dialog, nativeTheme } from 'electron';
import path from 'path';
//import liquidGlass from "electron-liquid-glass";

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import redate from "redate-cli";
import { getConfig, setConfig } from "redate-cli/config";

const dev = !app.isPackaged;
let dropWindow: BrowserWindow;
let settingsWindow: BrowserWindow;

declare global {
    interface Window {
        electron: any;
    }
}

function createDropWindow() {
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
        webPreferences: {
            nodeIntegration: true,
            preload: getPreloadPath()
        },
    })

    // const options = {
    //     tintColor: "#44000010",
    //     cornerRadius: 25
    // };


    //liquidGlass.addView(dropWindow.getNativeWindowHandle(), options);
    if (dev) {
        dropWindow.loadURL("http://localhost:5173/drop");
    }
    else {
        dropWindow.loadFile("build/drop.html");
        dropWindow.webContents.openDevTools({ mode: "detach" });

    }

    dropWindow.show();
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 700,
        height: 400,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        backgroundMaterial: "mica",
        title: "ReDate Settings",
        webPreferences: {
            nodeIntegration: true,
            preload: getPreloadPath()
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
ipcMain.on('close-window', (_event, windowType: 'drop' | 'settings') => {
    switch (windowType) {
        case 'drop':
            if (dropWindow && !dropWindow.isDestroyed()) {
                dropWindow.close();
            }
            break;
        case 'settings':
            if (settingsWindow && !settingsWindow.isDestroyed()) {
                settingsWindow.close();
            }
            break;
    }
});

ipcMain.on('minimize-window', (_event, windowType: 'drop' | 'settings') => {
    switch (windowType) {
        case 'drop':
            if (dropWindow && !dropWindow.isDestroyed()) {
                dropWindow.minimize();
            }
            break;
        case 'settings':
            if (settingsWindow && !settingsWindow.isDestroyed()) {
                settingsWindow.minimize();
            }
            break;
    }
});
ipcMain.on('close', (event) => {
    app.quit();
});
ipcMain.on('minimize', (event) => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.minimize();
    }
});
ipcMain.on('settings', (event) => {
    createSettingsWindow();
});


ipcMain.handle('browse', async (_event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    });

    if (result.canceled) {
        return [];
    }

    return result.filePaths;
});

ipcMain.handle('get-config', () => {
    return getConfig();
});

ipcMain.on('start-processing', async (event, files) => {
    const startTime = Date.now();

    try {
        const result = await redate(files, getConfig());

        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
        }

        event.sender.send('processing-complete', {
            success: true,
            result: result
        });

    } catch (err) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
        }

        event.sender.send('processing-complete', {
            success: false,
            result: {
                errors: [err.message]
            }
        });
    }
});

ipcMain.on('update-value', (event, { key, value }) => {
    const config = getConfig();
    config[key] = value;
    setConfig(config);
});


function getPreloadPath(): string {
    const filePath = path.join(dirName() + "/preload.cjs");
    return filePath;
}

function dirName() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return __dirname;
}