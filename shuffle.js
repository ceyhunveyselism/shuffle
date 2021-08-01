let prompt = require("prompt-sync")(autocomplete="");
let fs = require("fs");
let chalk = require("chalk");
let argumente = Array.from(process.argv.slice(2));
let https = require('https');
let cmd = require('child_process');
let http = require('https');
let url = 'https://raw.githubusercontent.com/ceyhunveyselism/shuffle/main/shuffle.js'; 
let path = 'shuffleUpdate.js'

let settings = {
    auto: "auto.shfl",
    type: "word",
    debug: false,
    ccpe: 3,
    history: [],
    autosaveHistory: false,
    autoupdate: true
}

if(settings.autoupdate) {
    console.log(chalk.green("Checking for updates..."));
    let request = http.get(url, function(response) {
        if(response.statusCode === 200) {
            let file = fs.createWriteStream(path);
            response.pipe(file);
            if(fs.readFileSync(__filename.slice(__dirname.length + 1) != fs.readFileSync("shuffleUpdate.js"))) {
                console.log(chalk.yellow("[Autoupdate]"), "A new version of shuffle has been released! Do you want to update your current shuffle?");
                console.log("(This will delete your settings file.)");
                let yn = prompt("(Y/N): ").toLowerCase();
                if(yn == "n") {
                    console.log("Aborted autoupdate.");
                    return;
                } else if(yn == "y") {
                    fs.rmSync("set.shfl");
                    fs.rmSync(__filename.slice(__dirname.length + 1));
                    fs.renameSync("shuffleUpdate.js", __filename.slice(__dirname.length + 1));
                    cmd("node " + __filename.slice(__dirname.length + 1));
                    process.exit();
                }
            }
        }

        if(response.statusCode != 200) {
            console.log(chalk.blue("[FATAL ERROR] Status code other then 200: Github is probably down. Check later for updates."));
        }

        request.setTimeout(15000, function() {
            console.log(chalk.red("[ERROR] Failed to download shuffle.js from github: Aborting autoupdate check"));
            request.destroy();
        });
    });
}

if(argumente[0]) {
    let choice = "Undefined"
    argumente.forEach(function(element, index) {
        if(element == "-word") {
            choice = "word";
            argumente.splice(index, 1)
        }
        if(element == "-chr") {
            choice = "other";
            argumente.splice(index, 1)
        }
    });
    let shuff = argumente.join(choice == "word" ? " " : "");
    console.log(chalk.whiteBright(shuffle(shuff, choice)))
    return;
}

if(fs.existsSync("set.shfl")) {
    settings = JSON.parse(fs.readFileSync("set.shfl"));
}

function shuffle(text, type = "word") {
    _temp = text.toString().split(settings.type == "word" && type == "word" ? " " : "");
    _templ = _temp.length;
    _sh = [];
    if(settings.debug)
        console.log("Set variables.");
    for(var i = 0; i < _templ; i++) {
        _elem = _temp[Math.floor(Math.random() * _temp.length)];
        if(settings.debug)
            console.log("Inside for loop: Element is " + _elem);
        _sh.push(_elem);
        if(settings.debug)
            console.log("Total: " + _temp)
        _temp.splice(_temp.indexOf(_elem), 1)
        if(settings.debug)
            console.log("Total (new): " + _temp);
    }
    return _sh.join(settings.type == "word" && type == "word" ? " " : "");
}

if(!fs.existsSync("set.shfl")) {
    console.log(chalk.red("[WARNING]"), " Shuffle settings file not found, creating...");
    fs.appendFileSync("set.shfl", JSON.stringify(settings));
    if(!fs.existsSync("set.shfl")) {
        console.log(chalk.red("[ERROR]"), " Shuffle settings file failed to create. Ignoring...");
    }
    console.log(chalk.green("[INFO]"), " Settings file successfully created.");
}

if(!fs.existsSync(settings.auto) && Math.round(Math.random() * 3) == 2) {
    console.log(`Tip: You can make a ${settings.auto} file to automatically shuffle words whenever the app opens.`)
}

if(fs.existsSync(settings.auto)) {
    console.log(chalk.whiteBright(`Automatically shuffled ${settings.auto}: ${shuffle(fs.readFileSync(settings.auto))}`));
}

function save() {
    fs.writeFileSync("set.shfl", JSON.stringify(settings));
}
let count = 0;
let sessionhistory = []

console.log(`Type the ${settings.type == "word" ? "words" : "characters"} to shuffle`)

while(true) {
    let shufflet = prompt(chalk.greenBright("Input: "));
    count++
    if(count == settings.ccpe) {
        console.clear();
        count = 0;
    }
    if(shufflet == "clear") {
        console.clear();
        continue;
    }
    if(shufflet == "history") {
        console.log("Shuffle history:")
        sessionhistory.forEach(element => {
            console.log(element)
        });
        prompt(chalk.green("--Press any key to continue--"))
        continue;
    }
    if(shufflet == "clearhistory -session") {
        sessionhistory = []
        save()
        console.log("Successfully cleared session history. (Not saved history)");
        prompt(chalk.green("--Press any key to continue--"))
        continue;
    }
    if(shufflet == "savehistory -overwrite") {
        settings.history = sessionhistory;
        save()
        console.log("Overwrote current saved history and saved history.")
        prompt(chalk.green("--Press any key to continue--"))
        continue;
    }
    if(shufflet == "savehistory") {
        sessionhistory.forEach(element => {
            settings.history.push(element);
        });
        save()
        console.log("Saved history on top of current history.")
        prompt(chalk.green("--Press any key to continue--"))
        continue;
    }
    if(shufflet == "clearhistory") {
        let yn = prompt("Are you sure you want to completely erase all saved history? [Y/N]: ").toLowerCase();
        if(yn == "n") {
            console.log("Aborted.");
            prompt(chalk.green("--Press any key to continue--"))
            continue;
        } else {
            settings.history = [];
            save()
            prompt(chalk.green("--Press any key to continue--"))
            continue;
        }
    }
    let words = shuffle(shufflet)
    console.log(chalk.redBright("Output:"), words);
    sessionhistory.push(words);
    if(settings.autosaveHistory) {
        settings.history = sessionhistory;
        save();
    }
}
