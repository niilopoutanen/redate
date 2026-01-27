const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    close: () => ipcRenderer.send('close'),
    settings: () => ipcRenderer.send('settings'),
    browse: () => ipcRenderer.send('browse'),
    go: (path) => ipcRenderer.send('go', path),
    
    startProcessing: () => ipcRenderer.send('start-processing'),

    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (newConfig) => ipcRenderer.send('update-config', newConfig),

    fileCacheChanged: (callback) => ipcRenderer.on('file-cache-changed', (_event, value) => callback(value)),
    setFileCache: (files) => ipcRenderer.send('set-file-cache', files),
    getFileCache: () => ipcRenderer.invoke('get-file-cache'),

    setState: (state) => ipcRenderer.send('state-update', state),
    stateUpdate: (callback) => ipcRenderer.on('state-update', (_event, value) => callback(value)),
    progressUpdate: (callback) => ipcRenderer.on('progress-update', (_event, value) => callback(value)),

    getErrorCause: () => ipcRenderer.invoke('get-error-cause'),
    closeErrors: () => ipcRenderer.send('close-errors'),

    showFilePath(file) {
        const path = webUtils.getPathForFile(file)
        return path;
    }
})