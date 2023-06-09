import * as fs from "fs"
import dotenv from "dotenv"
import { Command } from "commander"
import * as path from "path"
import logbuffer from "console-buffer"
import * as mainScrape from "./src/mainScrape.js"
import * as printHelper from "./src/util/printHelper.js"

const program = new Command()

program
	.name("ppp_gov_scrapper")
	.description("This is a CLI tool to scrape data from gov sites of PPP.")
	.version("0.0.1")

program
	.option("-i, --input <path>", "The input source file")
	.option("-o, --output <path>", "The output file path")
	.option("-s, --state <params>", "The state to scrape")

program.parse(process.argv)

const options = program.opts()
if (!process.argv[2]) {
	console.log("Type -h or --help for available commands")
}

console.log(program.opts())

Init()

async function Init() {
	dotenv.config()
	var keyList = []

	var input = "!@%@!$Citrus World /.% #@% !@%^ #@^#!Inc."

	Object.keys(options).forEach((opts) => {
		process.env[opts] = options[opts]
		keyList.push(opts)
	})

	if (!options.input) {
		console.log("Input file not specified")
		return
	}

	if (options.state && options.state.length == 2) {
		if (options.input) {
			process.env.currentState = options.state
			mainScrape.Init(options.input, options.state, options.output)
		} else {
			console.log("You require an -i/--input for scraping")
		}
	} else if (options.state.length != 2) {
		console.log(`Invalid state: ${options.state}`)
		printHelper.PrintValidStateOpts()
	}

	function printValidStateOpts() {
		var files = fs.readdirSync(`${process.env.SCRAPERS}`)

		console.log("Available options are:")
		for (var i = 0; i < files.length; i++) {
			console.log(path.parse(files[i]).name.substr(0, 2))
		}
	}
}
