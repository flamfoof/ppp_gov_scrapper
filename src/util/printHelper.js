import * as fs from "fs";
import dotenv from "dotenv";
import { Command } from "commander";
import * as path from "path";
import logbuffer from "console-buffer";

export function PrintValidStateOpts() {
    var files = fs.readdirSync(`${process.env.SCRAPERS}`);

    console.log("Available options are:");
    for (var i = 0; i < files.length; i++) {
        console.log(path.parse(files[i]).name.substr(0, 2));
    }
}