#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import exifr from 'exifr';


const program = new Command();

program
    .name("redate")
    .description("Rename images based on EXIF dates")
    .version("0.1.1")
    .argument("[paths...]", "File(s) or folder(s) to process")
    .action((paths) => {
        if (!paths || paths.length === 0) {
            program.help({ error: true });
        }
        for (const p of paths) {
            if (!fs.existsSync(p)) {
                console.error(`Path does not exist: ${p}`);
                continue;
            }

            const stats = fs.statSync(p);
            if (stats.isFile()) {
                processFile(p);
            } else if (stats.isDirectory()) {
                processFiles(p);
            } else {
                console.error(`Unsupported path type: ${p}`);
            }
        }
    });

program.parse(process.argv);



function processFiles(folderPath) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.statSync(filePath).isFile()) {
            getDateFromFile(filePath).then((date) => {
                if (date) {
                    const newFileName = formatFileName(date, file);
                    fs.renameSync(filePath, path.join(folderPath, newFileName));
                    console.log(`Renamed to: ${newFileName}`);
                }
            }).catch((err) => {
                console.error(`Error reading EXIF data from ${filePath}: ${err}`);
            });
        }
    }
}



function processFile(filePath) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        console.log(`Processing file: ${filePath}`);
        getDateFromFile(filePath).then((date) => {
            if (date) {
                const dir = path.dirname(filePath);
                const originalName = path.basename(filePath);
                const newFileName = formatFileName(date, originalName);
                fs.renameSync(filePath, path.join(dir, newFileName));
                console.log(`Renamed to: ${newFileName}`);
            } else {
                console.log(`No EXIF date found for file: ${filePath}`);
            }
        }).catch((err) => {
            console.error(`Error reading EXIF data from ${filePath}: ${err}`);
        });
    }
    else {
        console.error(`File does not exist: ${filePath}`);
    }
}


function formatFileName(date, originalName) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const ext = path.extname(originalName);

    return `${yyyy}-${mm}-${dd} ${hh}-${min}-${ss}${ext}`;
}


async function getDateFromFile(filePath) {
    const exif = await exifr.parse(filePath, { reviveValues: true });
    if (!exif?.DateTimeOriginal) return null;

    const date = exif.DateTimeOriginal;
    const offset = exif.OffsetTimeOriginal;

    if (!offset) return date;

    const sign = offset[0] === '-' ? -1 : 1;
    const [h, m] = offset.slice(1).split(':').map(Number);
    const offsetMs = sign * (h * 60 + m) * 60_000;

    return new Date(date.getTime() + offsetMs);
}