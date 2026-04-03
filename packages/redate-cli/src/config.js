import Conf from "conf";

import { DEFAULT_CONFIG } from "./defaults.js";

const config = new Conf({
    configName: "redate",
    defaults: DEFAULT_CONFIG,
    projectName: "ReDate",
});

export function getConfig() {
    return config.store;
}

export function setConfig(partialConfig) {
    config.set(partialConfig);
    return getConfig();
}

export function getConfigPath() {
    return config.path;
}
