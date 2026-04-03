const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    close: (windowType: 'drop' | 'settings') => ipcRenderer.send('close-window', windowType),
    minimize: (windowType: 'drop' | 'settings') => ipcRenderer.send('minimize-window', windowType),
    settings: () => ipcRenderer.send('settings'),
    browse: async () => {
        const files = await ipcRenderer.invoke('browse');
        return files;
    },
    go: (path) => ipcRenderer.send('go', path),

    startProcessing: (files) => {
        ipcRenderer.send('start-processing', files);
    },
    onProcessingComplete: (callback) =>
        ipcRenderer.on('processing-complete', (_event, result) =>
            callback(result)
        ),

    getGuiConfig: () => ipcRenderer.invoke("gui-config:get"),
    setGuiConfig: (config) => ipcRenderer.invoke("gui-config:set", config),

    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (newConfig) => ipcRenderer.send('update-config', newConfig),
    updateValue: (key, value) => ipcRenderer.send('update-value', { key, value }),

    getErrorCause: () => ipcRenderer.invoke('get-error-cause'),
    closeErrors: () => ipcRenderer.send('close-errors'),

    showFilePath(file) {
        const path = webUtils.getPathForFile(file)
        return path;
    }
})