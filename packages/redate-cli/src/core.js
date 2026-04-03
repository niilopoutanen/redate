import fs from "fs";
import path from "path";
import exifr from "exifr";
import { getConfig } from "./config.js";
import { TOKENS } from "./defaults.js";


/**
 * @typedef {Object<string, any>} Config
 * A flexible config object where keys and structure can change.
 */
/**
 * @typedef {Object} Result
 * @property {number} totalFiles - Total number of files encountered.
 * @property {number} processed - Number of files successfully processed.
 * @property {number} skippedNoDate - Number of files skipped due to missing date.
 * @property {string[]} errors - Array of error messages.
 */

/**
 * @typedef {Object} ExifData
 * @property {Date} [DateTimeOriginal]
 * @property {Date} [CreateDate]
 * @property {Date} [ModifyDate]
 * @property {string} [OffsetTimeOriginal]
 */

/**
 * Process an array of paths (files or directories).
 * @param {string[]} paths - Array of file or folder paths.
 * @returns {Promise<Result>} The summary of the processing.
 */


/** @type {Record<string, (src: string, dest: string) => void>} */
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
    const result = {
        totalFiles: 0,
        processed: 0,
        skippedNoDate: 0,
        errors: []
    };

    for (const p of paths) {
        if (!fs.existsSync(p)) {
            result.errors.push(`Path does not exist: ${p}`);
            continue;
        }

        const stats = fs.statSync(p);

        if (stats.isFile()) {
            await processFile(p, config, result);
        } else if (stats.isDirectory()) {
            await processFiles(p, config, result);
        }
    }

    return result;
}

/**
 * Process all files in a folder.
 * @param {string} folderPath - Path to the folder.
 * @param {Config} config - Configuration object.
 * @param {Result} result - Result object to update.
 */
export async function processFiles(folderPath, config, result) {
    if (!config) config = getConfig();
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (!fs.statSync(filePath).isFile()) continue;

        await processFile(filePath, config, result);
    }
}

/**
 * Process a single file.
 * @param {string} filePath - Path to the file.
 * @param {Config} config - Configuration object.
 * @param {Result} result - Result object to update.
 */
export async function processFile(filePath, config, result) {
    result.totalFiles += 1;

    try {
        const date = await getDateFromFile(filePath);
        if (!date) {
            result.skippedNoDate += 1;
            return;
        }

        const originalName = path.basename(filePath);
        const newFileName = formatFileName(date, originalName, config);

        applyFileHandling(filePath, newFileName, config);

        result.processed += 1;
    } catch (err) {
        result.errors.push(`Error processing file ${filePath}: ${err.message}`);
    }
}

/**
 * Apply the configured file handling operation.
 * @param {string} srcPath - Source file path.
 * @param {string} newFileName - New file name.
 * @param {Config} config - Configuration object.
 */
function applyFileHandling(srcPath, newFileName, config) {
    const dir = path.dirname(srcPath);
    const dest = path.join(dir, newFileName);

    const handler = fileHandlers[config.fileHandling];

    if (!handler) {
        throw new Error(`Unknown fileHandling: ${config.fileHandling}`);
    }

    handler(srcPath, dest);
}

/**
 * Format a filename according to the config format and tokens.
 * @param {Date} date - Date to use for formatting.
 * @param {string} originalName - Original file name.
 * @param {Config} config - Configuration object.
 * @returns {string} The formatted file name.
 */

export function formatFileName(date, originalName, config) {
    let formatted = config.format;

    const sortedTokens = Object.keys(TOKENS).sort((a, b) => b.length - a.length);

    formatted = formatted.replace(/<([a-zA-Z_]+)>/g, (_, token) => {
        if (sortedTokens.includes(token)) {
            return TOKENS[token].value(date);
        }
        return `<${token}>`;
    });

    const ext = path.extname(originalName);
    return `${formatted}${ext}`;
}

/**
 * Extract a Date object from a file using EXIF data.
 * @param {string} filePath - Path to the file.
 * @returns {Promise<Date|null>} Date of the file, or null if not found.
 */
export async function getDateFromFile(filePath) {
    const exif = await exifr.parse(filePath, { reviveValues: true });


    const date =
        exif?.DateTimeOriginal ||
        exif?.CreateDate ||
        exif?.ModifyDate;

    if (!date) {
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