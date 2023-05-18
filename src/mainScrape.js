import * as fs from "fs";
import * as path from "path";
import readline from "readline";
import * as printHelper from "./util/printHelper.js"

export async function Init(input, state, output) {
    var fileStream = fs.existsSync(input) ? fs.createReadStream(input) : Exit(`Input file does not exist: (${input})`);
    
    console.log(`${process.env.SCRAPERS}/${state}_scrape.js`);
    var scraper;
    try {
        scraper = await import(`./scrapers/FL_scrape.js`);
    } catch (e) {
        console.log(e);
        console.log("Invalid state");
        printHelper.PrintValidStateOpts();
        return;
    }

    
    await scraper.Init("what");

    return;
}

function SaveFile(output, data) {
    fs.writeFile(output, data, (err) => {
        if (err) throw err;
        console.log("File saved");
    });
}

function Exit(reason) {
    console.log(reason);
    console.log("Exiting...");
    process.exit();
}

async function ReadFromCSV() {
    if (isLarge) {
        console.log("Starting stream lol");
        var streamOut = [];cls
        var readStream = fs.createReadStream(input.location, { encoding: "utf8" })
        var rl = readline.createInterface({ input: readStream });
        var currIndex = 0
        var readIndex = 0;
        var uniqueShowIndex = 0;
        var prevUniqueShowIndex = -1;
        var currShowTitle = "";

        console.log("File is too large, so going to stream it");

        rl.on("line", (line) => {
            if(currIndex != 0) 
            {
                var lineInfo = line.replace("\"", "");
                lineInfo = lineInfo.replaceAll(",,", ',"",');
                lineInfo = lineInfo.split('","');
                
                if(currShowTitle != lineInfo[0])
                {
                    currShowTitle = lineInfo[0];
                    uniqueShowIndex++;
                }

                if(uniqueShowIndex % maxPackSize == 0 && prevUniqueShowIndex != uniqueShowIndex) {
                    console.log("Line: " + currIndex)
                    logbuffer.flush();
                    rl.pause();
                    streamOut.push(lineInfo);
                    prevUniqueShowIndex = uniqueShowIndex;
                } else {
                    streamOut.push(lineInfo);
                }
            }
                
            currIndex++;
        });
    }
}