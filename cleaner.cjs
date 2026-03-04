const fs = require('fs');

function renameFiles() {
    const preloadFile = __dirname + "/build/preload.js";

    if (fs.existsSync(preloadFile)) {
        fs.renameSync(preloadFile, preloadFile.replace(".js", ".cjs"));
    }

    console.log("Renamed files to .cjs");
}

renameFiles();