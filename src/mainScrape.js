import * as fs from "fs";

export async function Init(input, state, output) {
    console.log(`${process.env.SCRAPERS}/${state}_scrape.js`);
    try {
        var scraper = await import(`${process.env.SCRAPERS}/${state}_scrape.js`);
    } catch (e) {
        console.log(e);
        console.log("Invalid state");
        printValidStateOpts();
    }

    await scraper.Init();
    console.log("startingggg");
    return "what";
}

function saveFile(output, data) {
    fs.writeFile(output, data, (err) => {
        if (err) throw err;
        console.log("File saved");
    });
}

function printValidStateOpts() {
    var files = fs.readdirSync("./scrapers");

    console.log("Available options are:");
    for (var i = 0; i < files.length; i++) {
        console.log(path.parse(files[i]).name.substr(0, 2));
    }
}
