#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import exifr from 'exifr';
import https from "https";
import { execSync } from "child_process";
import readline from "readline";
import { getConfig, setConfig, TOKENS, DEFAULT_CONFIG } from "./config.js";


const program = new Command();

program
    .name("redate")
    .description("Rename images based on EXIF dates")
    .version("0.2.2");

program
    .command("process <paths...>")
    .description("Process file(s) or folder(s)")
    .action(async (paths) => {
        for (const p of paths) {
            if (!fs.existsSync(p)) {
                console.error(`Path does not exist: ${p}`);
                continue;
            }

            const stats = fs.statSync(p);

            if (stats.isFile()) {
                await processFile(p);
            } else if (stats.isDirectory()) {
                await processFiles(p);
            } else {
                console.error(`Unsupported path type: ${p}`);
            }
        }
    });

const configCommand = program
    .command("config")
    .description("Manage configuration");

configCommand
    .command("get [key]")
    .action((key) => {
        const config = getConfig();
        if (!key) {
            console.log(config);
            return;
        }

        console.log(config[key]);
    });

configCommand
    .command("set <key> <value>")
    .action((key, value) => {
        setConfig({ [key]: value });
        console.log(`${key} updated to ${value}`);
    });

configCommand
    .command("reset")
    .action(() => {
        setConfig(DEFAULT_CONFIG);
        console.log("Config reset to defaults");
    });


program
    .command("update")
    .description("Check for newer version and update globally")
    .action(async () => {
        try {
            const currentVersion = program.version();

            const latestVersion = await getLatestVersionFromNpm("redate-cli");

            if (!latestVersion) {
                console.error("Could not check latest version.");
                return;
            }

            if (latestVersion === currentVersion) {
                console.log(`You are already using the latest version (${currentVersion}).`);
                return;
            }

            console.log(`New version available: ${latestVersion}`);
            console.log(`Current version: ${currentVersion}`);

            const shouldUpdate = await askYesNo("Update globally now? (y/n): ");

            if (!shouldUpdate) {
                console.log("Update cancelled.");
                return;
            }

            console.log("Updating...");
            execSync("npm install -g redate", { stdio: "inherit" });

            console.log("Update completed.");
        } catch (err) {
            console.error("Update failed:", err.message);
        }
    });
program.parse(process.argv);



const fileHandlers = {
    rename: (src, dest) => {
        fs.renameSync(src, dest);
    },

    copy: (src, dest) => {
        fs.copyFileSync(src, dest);
    },

    copy_in_folder: (src, dest) => {
        const dir = path.dirname(src);
        const targetDir = path.join(dir, "redate");
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        fs.copyFileSync(src, path.join(targetDir, path.basename(dest)));
    }
};


async function processFiles(folderPath) {
    const files = fs.readdirSync(folderPath);
    const config = getConfig();
    for (const file of files) {
        const filePath = path.join(folderPath, file);

        if (!fs.statSync(filePath).isFile()) continue;

        processFile(filePath, config);
    }
}



async function processFile(filePath, config) {
    if (!config || config == null) {
        config = getConfig();
    }

    const date = await getDateFromFile(filePath);
    if (!date) return;

    const originalName = path.basename(filePath);
    const newFileName = formatFileName(date, originalName, config);

    applyFileHandling(filePath, newFileName, config);

    console.log(`Processed: ${newFileName}`);
}
function applyFileHandling(srcPath, newFileName, config) {
    const dir = path.dirname(srcPath);
    const dest = path.join(dir, newFileName);

    const handler = fileHandlers[config.fileHandling];

    if (!handler) {
        throw new Error(`Unknown fileHandling: ${config.fileHandling}`);
    }

    handler(srcPath, dest);
}


export function formatFileName(date, originalName, config) {
    let formatted = config.format;

    const sortedTokens = Object.keys(TOKENS).sort((a, b) => b.length - a.length);

    for (const key of sortedTokens) {
        formatted = formatted.replaceAll(key, TOKENS[key].value(date));
    }

    const ext = path.extname(originalName);
    return `${formatted}${ext}`;
}
async function getDateFromFile(filePath) {
    const exif = await exifr.parse(filePath, { reviveValues: true });


    const date =
        exif?.DateTimeOriginal ||
        exif?.CreateDate ||
        exif?.ModifyDate;

    if (!date) {
        console.error(`No EXIF date found for file: ${filePath}`);
        return null;
    };

    const offset = exif.OffsetTimeOriginal;

    if (!offset) return date;

    const sign = offset[0] === '-' ? -1 : 1;
    const [h, m] = offset.slice(1).split(':').map(Number);
    const offsetMs = sign * (h * 60 + m) * 60_000;

    return new Date(date.getTime() + offsetMs);
}


function getLatestVersionFromNpm(packageName) {
    return new Promise((resolve, reject) => {
        https
            .get(`https://registry.npmjs.org/${packageName}/latest`, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.version);
                    } catch (e) {
                        reject(e);
                    }
                });
            })
            .on("error", reject);
    });
}

function askYesNo(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}