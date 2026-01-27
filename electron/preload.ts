const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    close: () => ipcRenderer.send('close'),
    settings: () => ipcRenderer.send('settings'),
    browse: () => ipcRenderer.send('browse'),
})