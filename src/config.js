import os from "os";
import path from "path";
import fs from "fs";
import { DEFAULT_CONFIG, TOKENS } from "./defaults.js";
const CONFIG_DIR = getConfigDir();
const CONFIG_FILE = path.join(CONFIG_DIR, "cli-config.json");


function ensureConfig() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(
            CONFIG_FILE,
            JSON.stringify(DEFAULT_CONFIG, null, 2)
        );
    }
}

export function getConfig() {
    ensureConfig();
    const stored = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));

    return deepMerge(DEFAULT_CONFIG, stored);
}

export function setConfig(partialConfig) {
    const current = getConfig();
    const updated = deepMerge(current, partialConfig);

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
    return updated;
}

function deepMerge(target, source) {
    const output = { ...target };

    for (const key of Object.keys(source)) {
        if (
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key])
        ) {
            output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            output[key] = source[key];
        }
    }

    return output;
}


function getConfigDir() {

    switch (process.platform) {
        case "win32":
            return path.join(process.env.LOCALAPPDATA || process.env.APPDATA, "Poutanen", "ReDate");

        case "darwin":
            return path.join(os.homedir(), "Library", "Application Support", "ReDate");

        default:
            const xdg = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
            return path.join(xdg, appName);
    }
}