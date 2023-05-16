import * as fs from "fs";
import * as path from "path";
import * as printHelper from "./util/printHelper.js"

export async function Init(input, state, output) {
    var fileStream = fs.existsSync(input) ? fs.createReadStream(input) : Exit("Input file does not exist");
    
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
    process.exit();
}