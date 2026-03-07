export const APP_STATES = {
    INITIAL: "initial",
    FILES_READY: "files-ready",
    PROCESSING: "processing",
    DONE: "done",
    ERROR: "error"
} as const;

export const appState = $state({
    files: [],
    processing: false,
    status: "initial",
    latestResult: null
});

export const config = $state({
    fileHandling: null,
    format: "",
});

export const guiConfig = $state({
    confirmProcessing: true,
    quitWhenDone: false,
});

export function updateGuiConfig(values) {
    Object.assign(guiConfig, values);

    window.electron.setGuiConfig({
        confirmProcessing: guiConfig.confirmProcessing,
        quitWhenDone: guiConfig.quitWhenDone
    });
}
