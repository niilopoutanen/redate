import { BrowserWindow, app, ipcMain, dialog, nativeTheme } from 'electron';
import path from 'path';
import liquidGlass from "electron-liquid-glass";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dev = !app.isPackaged;
let dropWindow: BrowserWindow;

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
        webPreferences: {
            nodeIntegration: true,
            preload: getPreloadPath()
        },
    })

    const options = {
        tintColor: "#44000010",
        cornerRadius: 25
    };

    liquidGlass.addView(dropWindow.getNativeWindowHandle(), options);
    if (dev) {
        dropWindow.loadURL("http://localhost:5173/drop");
        dropWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        dropWindow.loadFile("build/drop.html");
    }

    dropWindow.show();
}


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
ipcMain.on('close', (event) => {
    app.quit();
});

ipcMain.on('settings', (event) => {

});


ipcMain.on('browse', (event, title) => {
    dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then(function (response) {
        if (!response.canceled) {

        } else {
            //No files selected
        }
    });
})



function getPreloadPath(): string {
    const filePath = path.join(dirName() + "/preload.cjs");
    return filePath;
}

function dirName() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return __dirname;
}