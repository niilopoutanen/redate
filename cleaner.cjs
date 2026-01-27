const fs = require('fs');

function renameFiles() {
    const mainFile = __dirname + "/build/electron.js";
    const preloadFile = __dirname + "/build/preload.js";

    /*if (fs.existsSync(mainFile)) {
        fs.renameSync(mainFile, mainFile.replace(".js", ".cjs"));
    }*/

    if (fs.existsSync(preloadFile)) {
        fs.renameSync(preloadFile, preloadFile.replace(".js", ".cjs"));
    }

    console.log("Renamed files to .cjs");
}

renameFiles();