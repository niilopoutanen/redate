#!/usr/bin/env node
import { Command } from "commander";
import https from "https";
import { execSync } from "child_process";
import readline from "readline";
import { getConfig, setConfig, TOKENS, DEFAULT_CONFIG } from "./config.js";
import redate from "./core.js";

const program = new Command();

program
    .name("redate")
    .description("Rename images based on EXIF dates")
    .version("0.2.3");

program
    .command("process <paths...>")
    .description("Process file(s) or folder(s)")
    .action(async (paths) => {
        await redate(paths);
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