import { ipcMain, BrowserWindow, dialog, app } from "electron";
import { dropWindow, settingsWindow, createDropWindow, createSettingsWindow } from "./electron.js";
import redate from "redate-cli";
import Conf from 'conf';
import { DEFAULT_CONFIG } from 'redate-cli/defaults';


const config = new Conf({
    configName: "redate",
    defaults: DEFAULT_CONFIG,
    projectName: "ReDate",
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

ipcMain.handle("config:get", () => {
    return config.store;
});
ipcMain.handle("config:get-key", (_event, target: 'cli' | 'gui', key: string) => {
    return config.get(`${target}.${key}`);
});
ipcMain.handle("config:set-key", (_event, target: 'cli' | 'gui', key: string, value: any) => {
    config.set(`${target}.${key}`, value);
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


ipcMain.on('start-processing', async (event, files) => {
    const startTime = Date.now();

    try {
        const result = await redate(files);

        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
        }

        let success = true;
        if (result.errors && result.errors.length > 0) {
            success = false;
        }
        event.sender.send('processing-complete', {
            success: success,
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