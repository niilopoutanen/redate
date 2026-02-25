#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import exifr from 'exifr';
import { getConfig, setConfig, TOKENS } from "./config.js";


const program = new Command();

program
    .name("redate")
    .description("Rename images based on EXIF dates")
    .version("0.1.1");

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
const DEFAULT_FORMAT = "yyyy-mm-dd hh-min-ss";

const formatCommand = program
    .command("format")
    .description("Manage date format");

formatCommand
    .command("set <format>")
    .description("Set global date format")
    .action((format) => {
        setConfig({ format });
        console.log(`Format set to: ${format}`);
    });

formatCommand
    .command("get")
    .description("Show current global date format")
    .action(() => {
        const config = getConfig();
        console.log(`Current format: ${config.format}`);
    });

formatCommand
    .command("reset")
    .description("Reset format to default")
    .action(() => {
        setConfig({ format: DEFAULT_FORMAT });
        console.log(`Format reset to default: ${DEFAULT_FORMAT}`);
    });

program.parse(process.argv);




async function processFiles(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);

        if (!fs.statSync(filePath).isFile()) continue;

        try {
            const date = await getDateFromFile(filePath);

            if (!date) {
                console.log(`No EXIF date found for file: ${filePath}`);
                continue;
            }

            const newFileName = formatFileName(date, file);
            fs.renameSync(filePath, path.join(folderPath, newFileName));
            console.log(`Renamed to: ${newFileName}`);

        } catch (err) {
            console.log(`Skipped (unsupported or invalid): ${filePath}`);
        }
    }
}



async function processFile(filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        console.error(`File does not exist: ${filePath}`);
        return;
    }

    console.log(`Processing file: ${filePath}`);

    try {
        const date = await getDateFromFile(filePath);

        if (!date) {
            console.log(`No EXIF date found for file: ${filePath}`);
            return;
        }

        const dir = path.dirname(filePath);
        const originalName = path.basename(filePath);
        const newFileName = formatFileName(date, originalName);

        fs.renameSync(filePath, path.join(dir, newFileName));
        console.log(`Renamed to: ${newFileName}`);
    } catch (err) {
        console.error(`Error reading EXIF data from ${filePath}: ${err}`);
    }
}



export function formatFileName(date, originalName) {
    const config = getConfig();
    let formatted = config.format;

    for (const key in TOKENS) {
        if (formatted.includes(key)) {
            formatted = formatted.replaceAll(key, TOKENS[key].value(date));
        }
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