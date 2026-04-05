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
    onProcessingComplete: (callback) => {
        ipcRenderer.on('processing-complete', (_event, result) =>
            callback(result)
        )
    },


    getConfigKey: (target: 'cli' | 'gui', key: string) => ipcRenderer.invoke('config:get-key', target, key),
    setConfigKey: (target: 'cli' | 'gui', key: string, value: any) => ipcRenderer.invoke('config:set-key', target, key, value),
    getConfig: () => ipcRenderer.invoke('config:get'),

    getErrorCause: () => ipcRenderer.invoke('get-error-cause'),
    closeErrors: () => ipcRenderer.send('close-errors'),

    getVersion: () => ipcRenderer.invoke('get-version'),
    isMac: () => ipcRenderer.invoke('is-mac'),
    
    showFilePath(file) {
        const path = webUtils.getPathForFile(file)
        return path;
    }
})