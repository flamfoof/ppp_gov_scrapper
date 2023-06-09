import util from "util"
import * as fs from "fs"
import logbuffer from "console-buffer"
import JSONStream from "JSONStream"

const readFileAsync = util.promisify(fs.readFile)

var optsHeaderDefault = {
	method: "GET",
	headers: {
		"User-Agent": "Webb",
	},
}

var consolePrint = []
const fileAssetPackName = "pack_"

export function test() {
	console.log("test")
}

export async function APISearchQuery(api, opts, mRetry = process.env.MAX_RETRY, type = "json") {
	var getDetail

	if (opts == {}) {
		opts = optsHeaderDefault
	}

	for (var k = 0; k < mRetry; k++) {
		var fetchLogger = ""
		try {
			var APIQuery = api
			// console.log("Querying: " + APIQuery);
			getDetail = await fetch(APIQuery, opts)
			fetchLogger = await getDetail.text()
			if (type == "json") {
				getDetail = JSON.parse(fetchLogger)
			} else {
				getDetail = fetchLogger
			}

			if (getDetail.status_code == 34 && k > 2) {
				return (getDetail = null)
			} else if (getDetail.hasOwnProperty("status_code")) {
				throw "Fetch returned 401/404 status code: " + getDetail.status_message
			}
		} catch (e) {
			console.log("Node fetch crashed because Error: " + e)
			// console.log("Fetch results: " + fetchLogger);
			console.log("Retrying.....")

			logbuffer.flush()

			if (fetchLogger && fetchLogger.match(/(network request)/)) {
				await sleep(process.env.RETRY_SLEEP_TIMER)
			}

			if (fetchLogger && fetchLogger.match(/(client)/) && (await isElevated())) {
				exec(process.env.RESTART_NET_BAT, function (err, stdout) {
					if (err) console.log(err)

					console.log(stdout)
				})

				await sleep(process.env.RETRY_SLEEP_TIMER)
			}

			getDetail = null

			await sleep(process.env.BASIC_SLEEP_TIMER)
		}

		if (getDetail && getDetail.hasOwnProperty("errors")) {
			getDetail = null
		}

		if (getDetail) {
			k = mRetry
		}

		logbuffer.flush()
	}

	if (!getDetail || getDetail.length == 0) {
		return null
	}

	var keys = Object.keys(getDetail)

	if (keys.length == 0) {
		return null
	}

	return getDetail
}

export async function WebQuery(api, opts, mRetry = process.env.MAX_RETRY, type = "json") {
	var getDetail

	if (opts == {}) {
		opts = optsHeaderDefault
	}

	for (var k = 0; k < mRetry; k++) {
		var fetchLogger = ""
		try {
			var APIQuery = api
			// console.log("Web Querying: " + APIQuery);
			getDetail = await fetch(APIQuery, opts)
			getDetail = await getDetail.text()
			// fetchLogger = await getDetail.text();

			if (getDetail.status_code == 34 && k > 2) {
				return (getDetail = null)
			} else if (getDetail.hasOwnProperty("status_code")) {
				throw "Fetch returned 401/404 status code: " + getDetail.status_message
			} else if (!getDetail.substring(0, 50).includes("<!doctype html>")) {
				throw "Amazon no likey scraping" + getDetail.substring(0, 50)
			}
		} catch (e) {
			console.log("Node fetch crashed because Error: " + e)
			// console.log("Fetch results: " + fetchLogger);
			console.log("Retrying.....")

			logbuffer.flush()

			if (fetchLogger && fetchLogger.match(/(network request)/)) {
				await sleep(process.env.RETRY_SLEEP_TIMER)
			}

			if (fetchLogger && fetchLogger.match(/(client)/) && (await isElevated())) {
				exec(process.env.RESTART_NET_BAT, function (err, stdout) {
					if (err) console.log(err)

					console.log(stdout)
				})

				await sleep(process.env.RETRY_SLEEP_TIMER)
			}

			getDetail = null

			await sleep(process.env.RETRY_SLEEP_TIMER)
		}

		if (getDetail && getDetail.hasOwnProperty("errors")) {
			getDetail = null
		}

		if (getDetail) {
			k = mRetry
		}

		logbuffer.flush()
	}

	return getDetail
}

export async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function PackJSONWhenFull(out, index, mediaFilePath) {
	var maxPackSize = process.env.MAX_PACK_ITEM
	if (maxPackSize < 1) {
		throw "Pack size must be greater than 0"
	}

	if (index % maxPackSize == maxPackSize - 1 && index > 0) {
		if (!fs.existsSync(mediaFilePath)) {
			fs.mkdirSync(mediaFilePath, {
				recursive: true,
			})
		}

		await WriteToJSON(
			out,
			resolve(mediaFilePath) + "/",
			fileAssetPackName + (index - (maxPackSize - 1)) / maxPackSize
		)

		out.length = 0

		await sleep(1)
	}
}

export async function WriteToJSON(json, outputPath, name) {
	console.log(outputPath)
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, {
			recursive: true,
		})
	}
	var destination = name ? outputPath + "/" + name : outputPath + "/" + "out.json"

	try {
		logbuffer.flush()
		var packager = ""
		var transformStream = JSONStream.stringify("[\n\t", ",\n\t", "\n]")
		var outputStream = fs.createWriteStream(destination)
		outputStream.write("[\n\t")

		for (var i = 0; i < json.length; ++i) {
			packager += JSON.stringify(json[i]) + (i < json.length - 1 ? ",\n\t" : "")
			if (i != 0 && i % 10000 == 0) {
				outputStream.write(packager)
				packager = ""
			}
		}
		outputStream.write(packager)
		outputStream.write("\n]")
		transformStream.end()

		//JSON stream is not async, so this helps...
		await sleep(1)
	} catch (e) {
		console.log(e)
		process.exit(1)
	}
}

export async function PackAllToJSON(
	json,
	paths,
	itemAmount,
	maxPackSize = process.env.MAX_PACK_SIZE
) {
	var finalResult = []
	var filePackLength = itemAmount
	var mediaFilePath = paths.output + `${paths.state}/${process.env.PACK_NAME}`
	
	console.log(maxPackSize)
	console.log("Packing all")

	for (var i = 0; i < filePackLength; i++) {
		var fileChunk = JSON.parse(await readFileAsync(`${mediaFilePath}/${paths.state}_${i}.json`))
		console.log(mediaFilePath + ("pack_" + i))
		for (var j = 0; j < fileChunk.length; j++) {
			finalResult.push(fileChunk[j])
		}
	}

	// Push the final remaining search items
	// for (var i = 0; i < json.length; i++) {
	// 	finalResult.push(json[i])
	// }
	console.log("Almost done packing")

	await WriteToJSON(finalResult, paths.output + `${paths.state}`, `ppp_${paths.state}_out.json`)
}

export function AddToPrintConsole(string) {
	consolePrint.push(string)
}

export function PrintAllConsole() {
	var string = ""
	for (var i = 0; i < consolePrint.length; i++) {
		string += consolePrint[i] + "\n"
	}
	console.log(string)
	consolePrint.length = 0
	logbuffer.flush()
}

export function CalculateRuntimeSeconds(seconds) {
	var time = ""
	var hours, minutes

	minutes = Math.ceil((seconds / 60) % 60)
	hours = Math.floor(seconds / 3600)

	if (hours > 0) {
		time += hours + "h"
	}
	if (minutes > 0) {
		time += " " + minutes + "m"
	}

	return time
}

export function PreventDuplicateFirstItem(indexx, currentPackSize) {
	return indexx
}

export function isEmpty(obj) {
	for (var i in obj) {
		return false
	}

	return true
}

export function SanitizeSpecialChar(string) {
	return string.replace(/[^\w ]/g, "").replace(/\s+/g, " ")
}
