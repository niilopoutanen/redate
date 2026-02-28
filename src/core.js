import fs from "fs";
import path from "path";
import exifr from "exifr";
import { getConfig, TOKENS } from "./config.js";

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

export async function redate(paths) {
    const config = getConfig();

    for (const p of paths) {
        if (!fs.existsSync(p)) {
            console.error(`Path does not exist: ${p}`);
            continue;
        }

        const stats = fs.statSync(p);

        if (stats.isFile()) {
            await processFile(p, config);
        } else if (stats.isDirectory()) {
            await processFiles(p, config);
        }
    }
}


export async function processFiles(folderPath, config) {
    if (!config || config == null) {
        config = getConfig();
    }
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);

        if (!fs.statSync(filePath).isFile()) continue;

        await processFile(filePath, config);
    }
}

export async function processFile(filePath, config) {
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


export async function getDateFromFile(filePath) {
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

export default redate;