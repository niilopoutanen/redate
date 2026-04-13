#!/usr/bin/env node
import { Command } from "commander";
import https from "https";
import { execSync } from "child_process";
import readline from "readline";
import { DEFAULT_CONFIG } from "./defaults.js";
import redate from "./core.js";
import os from "os";
import { config } from "./core.js";

const program = new Command();

program
    .name("redate")
    .description("Rename images based on EXIF dates")
    .version("0.7.1");


program
    .command("process <paths...>")
    .description("Process file(s) or folder(s)")
    .action(async (paths) => {
        const result = await redate(paths);
        console.log(`Total files: ${result.totalFiles}`);
        console.log(`Processed: ${result.processed}`);
        console.log(`Skipped (no date): ${result.skippedNoDate}`);
        console.log(`Skipped (hidden files): ${result.skippedHidden}`);
        console.log(`Skipped (unsupported file format): ${result.skippedUnsupported}`);
        console.log(`Skipped (duplicate handling): ${result.skippedDuplicates}`);

        if (result.errors.length > 0) {
            console.log("Errors:");
            result.errors.forEach((err) => console.log(`  - ${err}`));
        }
    });

const configCommand = program
    .command("config")
    .description("Manage configuration");

    configCommand
        .command("get [key]")
        .action((key) => {
            if (!key) {
                console.log(structuredClone(config.store));
                return;
            }

            console.log(config.store[key]);
        });


configCommand
    .command("edit")
    .description("Open config file in editor")
    .action(() => {
        let editor = process.env.EDITOR;

        if (!editor) {
            const platform = os.platform();

            if (platform === "win32") {
                editor = "notepad";
            } else if (platform === "darwin") {
                editor = "open";
            } else {
                editor = "nano";
            }
        }

        execSync(`${editor} "${config.path}"`, { stdio: "inherit" });
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
            execSync("npm install -g redate-cli", { stdio: "inherit" });

            console.log("Update completed.");
        } catch (err) {
            console.error("Update failed:", err.message);
        }
    });
program.parse(process.argv);


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