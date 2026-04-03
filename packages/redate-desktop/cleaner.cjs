const fs = require('fs');

function renameFiles() {
    const preloadFile = __dirname + "/build/preload.js";

    if (fs.existsSync(preloadFile)) {
        fs.renameSync(preloadFile, preloadFile.replace(".js", ".cjs"));
    }

    const iconFile = __dirname + "/src/lib/assets/icon.png";

    if(fs.existsSync(iconFile)){
        fs.copyFileSync(iconFile, __dirname + "/build/icon.png");
    }
}

renameFiles();