const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
    settings: () => ipcRenderer.send('settings'),
    browse: () => ipcRenderer.send('browse'),
    go: (path) => ipcRenderer.send('go', path),

    startProcessing: (files) => {
        console.log("Renderer sending files:", files); // debug
        ipcRenderer.send('start-processing', files);
    },
    onProcessingComplete: (callback) =>
        ipcRenderer.on('processing-complete', (_event, result) =>
            callback(result)
        ),



    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (newConfig) => ipcRenderer.send('update-config', newConfig),


    getErrorCause: () => ipcRenderer.invoke('get-error-cause'),
    closeErrors: () => ipcRenderer.send('close-errors'),

    showFilePath(file) {
        const path = webUtils.getPathForFile(file)
        return path;
    }
})