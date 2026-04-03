import { ipcMain, BrowserWindow, dialog, app } from "electron";
import { dropWindow, settingsWindow, store, createDropWindow, createSettingsWindow } from "./electron.js";
import { getConfig, setConfig } from "redate-cli/config";
import redate from "redate-cli";

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
ipcMain.handle("gui-config:get", () => {
    return store.get("guiConfig");
});

ipcMain.handle("gui-config:set", (_, config) => {
    console.log("Saving GUI config: ", config);
    store.set("guiConfig", config);
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
        const result = await redate(files);

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

