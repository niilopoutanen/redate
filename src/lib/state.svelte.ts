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
});

export const config = $state({
    fileHandling: null,
    format: "",
});