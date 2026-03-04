import fs from 'fs';
import path from 'path';
import packager from 'electron-packager';

const packagerOptions = {
    dir: 'build',
    out: 'dist',
    platform: ['win32', 'darwin'],
    asar: true,
    ignore: [
        'node_modules*',
        'tsconfig.json',
        'packager.js',
        'cleaner.cjs',
        '.gitignore',
        'README.md',
        '^/src($|/)',
        '^/static($|/)',
        'svelte.config.js',
        'vite.config.ts',
        '.svelte-kit($|/)'
    ],
    overwrite: true,
    icon: "/static/favicon.ico"
};

prepareBuildDir();
packager(packagerOptions).then(outPaths => {
    outPaths.forEach(out => pruneLocales(out));
}).catch(err => {
    console.log(err);
});
function prepareBuildDir() {
    console.log("moving required files");

    const packagePath = path.join(process.cwd(), "package.json");
    const buildPackagePath = path.join(process.cwd(), "build", "package.json");

    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    pkg.main = "electron.js";

    fs.writeFileSync(buildPackagePath, JSON.stringify(pkg, null, 2));
}

function pruneLocales(outPath) {
    const localesDir = path.join(outPath, 'locales');
    if (!fs.existsSync(localesDir)) return;

    fs.readdirSync(localesDir).forEach(file => {
        if (!file.startsWith('en')) {
            fs.unlinkSync(path.join(localesDir, file));
        }
    });
}