import fs from "fs";
import path from "path";
import exifr from "exifr";
import { TOKENS, DEFAULT_CONFIG, SUPPORTED_FILES } from "./defaults.js";
import Conf from "conf";

/**
 * @typedef {Object<string, any>} Config
 * A flexible config object where keys and structure can change.
 */
/**
 * @typedef {Object} Result
 * @property {number} totalFiles - Total number of files encountered.
 * @property {number} processed - Number of files successfully processed.
 * @property {number} skippedNoDate - Number of files skipped due to missing date.
 * @property {number} skippedHidden - Number of hidden files (dotfiles) skipped.
 * @property {number} skippedUnsupported - Number of files skipped due to unsupported file format.
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

export const config = new Conf({
    configName: "redate",
    defaults: DEFAULT_CONFIG,
    projectName: "ReDate",
});


/** @type {Record<string, (src: string, dest: string) => Promise<void>>} */
const fileHandlers = {
    rename: async (src, dest) => {
        await fs.promises.rename(src, dest);
    },

    copy: async (src, dest) => {
        await fs.promises.copyFile(src, dest);
    },

    copytofolder: async (src, dest) => {
        const dir = path.dirname(src);
        const targetDir = path.join(dir, "redate");
        await fs.promises.mkdir(targetDir, { recursive: true });

        await fs.promises.copyFile(
            src,
            path.join(targetDir, path.basename(dest))
        );
    }
};


export async function redate(paths) {
    const result = {
        totalFiles: 0,
        processed: 0,
        skippedNoDate: 0,
        skippedUnsupported: 0,
        skippedHidden: 0,
        errors: []
    };

    const tasks = paths.map(async (path) => {
        if (!fs.existsSync(path)) {
            result.errors.push(`Path does not exist: ${path}`);
            return;
        }

        const stats = fs.statSync(path);

        if (stats.isFile()) {
            await processFile(path, config.store, result);
        } else if (stats.isDirectory()) {
            await processFiles(path, config.store, result);
        }
    });

    await Promise.all(tasks);

    return result;
}

/**
 * Process all files in a folder.
 * @param {string} folderPath - Path to the folder.
 * @param {Config} config - Configuration object.
 * @param {Result} result - Result object to update.
 */
export async function processFiles(folderPath, config, result) {
    const files = fs.readdirSync(folderPath);

    const tasks = files.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const stat = await fs.promises.stat(filePath);

        if (!stat.isFile()) return;

        await processFile(filePath, config, result);
    });

    await Promise.all(tasks);
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
        if (path.basename(filePath).startsWith(".")) {
            result.skippedHidden += 1;
            return;
        }

        const ext = path.extname(filePath).slice(1).toLowerCase();
        if (!SUPPORTED_FILES.has(ext)) {
            result.skippedUnsupported += 1;
            return;
        }

        const date = await getDateFromFile(filePath);
        if (!date) {
            result.skippedNoDate += 1;
            return;
        }

        const originalName = path.basename(filePath);
        const newFileName = formatFileName(date, originalName, config);

        await applyFileHandling(filePath, newFileName, config);

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
async function applyFileHandling(srcPath, newFileName, config) {
    const dir = path.dirname(srcPath);
    const dest = path.join(dir, newFileName);

    const handler = fileHandlers[config.cli.fileHandling];

    if (!handler) {
        throw new Error(`Unknown fileHandling: ${config.cli.fileHandling}`);
    }

    await handler(srcPath, dest);
}

/**
 * Format a filename according to the config format and tokens.
 * @param {Date} date - Date to use for formatting.
 * @param {string} originalName - Original file name.
 * @param {Config} config - Configuration object.
 * @returns {string} The formatted file name.
 */

export function formatFileName(date, originalName, config) {
    let formatted = config.cli.format;

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
    return date;

    // const offset = exif.OffsetTimeOriginal;

    // if (!offset) return date;

    // const sign = offset[0] === '-' ? -1 : 1;
    // const [h, m] = offset.slice(1).split(':').map(Number);
    // const offsetMs = sign * (h * 60 + m) * 60_000;

    // return new Date(date.getTime() + offsetMs);
}

export default redate;