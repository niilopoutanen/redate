import { DEFAULT_CONFIG } from "redate-cli/defaults";


export const APP_STATES = {
    INITIAL: "initial",
    FILES_READY: "files-ready",
    PROCESSING: "processing",
    DONE: "done",
    ERROR: "error"
} as const;

export const appState = $state({
    processing: false,
    status: "initial",
    latestResult: null
});

export const config = $state({ ...DEFAULT_CONFIG });

// @ts-ignore
export async function updateConfig(target: 'cli' | 'gui', key, value) {
    await window.electron.setConfigKey(target, key, value);

    // @ts-ignore
    if (!config[target]) config[target] = {};
    // @ts-ignore
    config[target][key] = value;
}