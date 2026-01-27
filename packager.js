import fs from 'fs';
import path from 'path';
import packager from 'electron-packager';

const packagerOptions = {
    dir: '.',
    out: 'dist',
    platform: ['win32', 'darwin'],
    ignore: [
        'node_modules*',
        'tsconfig.json',
        'packager.js',
        'cleaner.cjs',
        '.gitignore',
        'README.md',
        '^/server($|/)',
        '^/electron($|/)',
        'svelte.config.js',
        'vite.config.ts',
        '.svelte-kit($|/)'
    ],
    overwrite: true,
    icon: "/static/favicon.ico"
};

packager(packagerOptions).then(outPath => {
    moveFiles(outPath);
}).catch(err => {
    console.log(err);
});

function moveFiles(buildPath) {
    return;
    for(const path of buildPath){
        console.log("processing path", path);
        fs.rmSync(`${path}/resources`, { recursive: true });
        fs.mkdirSync(`${path}/resources/app`, { recursive: true });
        fs.cpSync("./build", `${path}/build`, { recursive: true });
        fs.cpSync("./build", `${path}/resources/app/build`, { recursive: true });
        fs.cpSync("package.json", `${path}/resources/app/package.json`);
    }

}