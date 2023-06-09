import * as fs from "fs"
import * as path from "path"
import readline from "readline"
import * as printHelper from "./util/printHelper.js"
import * as netAPI from "./util/netAPI.js"
import logbuffer from "console-buffer"

var scraper

export async function Init(input, state, output) {
	var fileStream = fs.existsSync(input)
		? fs.createReadStream(input)
		: Exit(`Input file does not exist: (${input})`)
	var sanitizedInput = netAPI.SanitizeSpecialChar(input)
	var packCount = 0
	var packNum = 0
	var res
	var packPath = `${output}/${state}/${process.env.PACK_NAME}/`
	var paths = {
		output: output,
		state: state,
		packPath: packPath,
		name: `${state}`,
	}
	
	var remainingItems = []

	CreateDirectory(output)

	// try {
	// 	DeleteDirectory(packPath)
	// } catch (e) {
	// 	console.log("Failed to delete directory: " + e.message)
	// }

	if (fs.existsSync(packPath)) {
		try {
			packNum = fs.readdirSync(packPath).length
			console.log(packNum)
			packCount = packNum * process.env.MAX_PACK_SIZE
			console.log(`Pack count: ${packCount}`)
		} catch (e) {
			console.log("Encountered file error: " + e)
		}
	} else {
		CreateDirectory(packPath)
	}

	console.log(`${process.env.SCRAPERS}/${state}_scrape.js`)

	try {
		scraper = await import(`./scrapers/${state}_scrape.js`)
	} catch (e) {
		console.log(e)
		console.log("Invalid state")
		printHelper.PrintValidStateOpts()
		return
	}

	remainingItems = await ReadFromCSV(fileStream, paths, packCount)

	//updating packNum
	packNum = fs.readdirSync(packPath).length

	await netAPI.PackAllToJSON(remainingItems, paths, packNum)
	// process.exit(1)
	return res
}

function SaveFile(output, name, data) {
	CreateDirectory(output)

	output += name
	fs.writeFileSync(output, data, (err) => {
		console.log(output)
		if (err) throw err
	})
}

function CreateDirectory(dir) {
	console.log(`Creating directory: ${dir}`)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function DeleteDirectory(dir) {
	console.log(`Deleting directory: ${dir}`)
	if (fs.existsSync(dir)) {
		fs.rmdirSync(dir, { recursive: true, force: true })
	}
}

function Exit(reason) {
	console.log(reason)
	console.log("Exiting...")
	process.exit()
}

async function ReadFromCSV(inputStream, paths, storedCount) {
	var streamOut = []
	var readStream = inputStream
	var rl = readline.createInterface({ input: readStream })
	var currIndex = -1
	var fileCount = Math.floor(storedCount / process.env.MAX_PACK_SIZE)
	var readIndex = 0
	var prevFileCount = 0
	var companyDetail = null

	console.log("File is too large, so going to stream it")
	for await (const line of rl) {
		if (currIndex >= 0 && currIndex > storedCount - 1) {
			// await netAPI.sleep(process.env.SLEEP_TIMER)
			var urlSearchTarget
			var companyDetail
			var employeeDetail
			var lineInfo = line.replaceAll(",,", "\n")
			lineInfo = lineInfo.replaceAll(',"', "\n")
			lineInfo = lineInfo.replaceAll('",', "\n")
			//split all commas
			lineInfo = lineInfo.replaceAll(/(?<=\w),(?=\w)/g, "\n")
			lineInfo = lineInfo.replaceAll(".,", ".\n")
			lineInfo = lineInfo.split("\n")

			urlSearchTarget = lineInfo[2]

			employeeDetail = await RunScraper(urlSearchTarget)
			employeeDetail = employeeDetail ? employeeDetail : await RunScraper(urlSearchTarget, {"state":"FL"})

			companyDetail = {
				businessName: lineInfo[2].replaceAll('"', ""),
				address: lineInfo[3].replaceAll('"', ""),
				city: lineInfo[4],
				state: lineInfo[5],
				employees: employeeDetail ? JSON.stringify(employeeDetail) : null,
			}

			if ((currIndex + 1) % process.env.MAX_PACK_SIZE == 0) {
				console.log("Line: " + currIndex)
				logbuffer.flush()
				prevFileCount = fileCount
				if (companyDetail) streamOut.push(companyDetail)

				var output = `${paths.output}/${paths.state}/${process.env.PACK_NAME}/`
				var fileName = `${paths.name}_${fileCount}.json`
				var fileData = JSON.stringify(streamOut, null, 2)

				if (fileCount == prevFileCount) {
					console.log("Writing to file: " + output + fileName)
					SaveFile(output, fileName, fileData)
					streamOut = []
					fileCount++
				}
			} else {
				if (companyDetail) streamOut.push(companyDetail)
			}
		}

		currIndex++
	}

	console.log("Finished reading file")

	var output = `${paths.output}/${paths.state}/${process.env.PACK_NAME}/`
	var fileName = `${paths.name}_${fileCount}.json`
	var fileData = JSON.stringify(streamOut, null, 2)

	console.log("Writing to last file: " + output + fileName)
	SaveFile(output, fileName, fileData)

	return streamOut
}

async function RunScraper(target, config = null) {
	var res
	console.log(target)

	if(config?.state && process.env.currentState != config.state) {
		scraper = await import(`./scrapers/${config.state}_scrape.js`)
	}

	try {
		res = await scraper.Init(target)
	} catch (e) {
		console.log("Scraping failed because: " + e)
		console.log(e)
	}
	
	return res
}
