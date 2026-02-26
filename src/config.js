import os from "os";
import path from "path";
import fs from "fs";

const CONFIG_DIR = path.join(os.homedir(), ".redate");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export const DEFAULT_CONFIG = {
    format: "yyyy-mm-dd hh-min-ss",

    fileHandling: "rename" // rename, copy, copy_in_folder
};

export const TOKENS = {
    yyyy: { desc: "4-digit year", value: (date) => date.getFullYear() },
    yy: { desc: "2-digit year", value: (date) => String(date.getFullYear()).slice(-2) },
    mm: { desc: "Month with leading zero", value: (date) => String(date.getMonth() + 1).padStart(2, "0") },
    m: { desc: "Month without leading zero", value: (date) => date.getMonth() + 1 },
    mmm: { desc: "Short month name", value: (date) => date.toLocaleString("en-US", { month: "short" }) },
    mmmm: { desc: "Full month name", value: (date) => date.toLocaleString("en-US", { month: "long" }) },
    dd: { desc: "Day with leading zero", value: (date) => String(date.getDate()).padStart(2, "0") },
    d: { desc: "Day without leading zero", value: (date) => date.getDate() },
    ddd: { desc: "Day short name", value: (date) => date.toLocaleString("en-US", { weekday: "short" }) },
    dddd: { desc: "Day full name", value: (date) => date.toLocaleString("en-US", { weekday: "long" }) },
    hh: { desc: "Hour 00-23", value: (date) => String(date.getHours()).padStart(2, "0") },
    h: { desc: "Hour 0-23", value: (date) => date.getHours() },
    H: { desc: "Hour 1-12", value: (date) => ((date.getHours() + 11) % 12 + 1) },
    HH: { desc: "Hour 01-12", value: (date) => String((date.getHours() + 11) % 12 + 1).padStart(2, "0") },
    a: { desc: "AM/PM", value: (date) => date.getHours() < 12 ? "AM" : "PM" },
    A: { desc: "am/pm", value: (date) => date.getHours() < 12 ? "am" : "pm" },
    min: { desc: "Minutes with leading zero", value: (date) => String(date.getMinutes()).padStart(2, "0") },
    m_: { desc: "Minutes without leading zero", value: (date) => date.getMinutes() },
    ss: { desc: "Seconds with leading zero", value: (date) => String(date.getSeconds()).padStart(2, "0") },
    s: { desc: "Seconds without leading zero", value: (date) => date.getSeconds() },
    ms: { desc: "Milliseconds", value: (date) => date.getMilliseconds() },
    w: {
        desc: "Week of year", value: (date) => {
            const start = new Date(date.getFullYear(), 0, 1);
            const diff = (date - start) + ((start.getDay() + 6) % 7) * 86400000;
            return Math.floor(diff / (7 * 86400000)) + 1;
        }
    },
    D: {
        desc: "Day of year", value: (date) => {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = date - start;
            return Math.floor(diff / 86400000);
        }
    },
};

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