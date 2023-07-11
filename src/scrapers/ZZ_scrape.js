import * as netAPI from "../util/netAPI.js"
import * as cheerio from "cheerio"
import axios from "axios"
import * as fs from "fs"
import * as util from "util"
import logbuffer from "console-buffer"
import { request } from "http"

var outputPath = "./netflix/output/"
var counter = 0
var maxPackSize = process.env.MAX_PACK_ITEM
var filePackName = "./pack/"
var fileAssetPackName = "pack_"
var mediaType
var mediaFilePath
var params
var debug = true

var requestHeaders = {
	headers: {
		"user-agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
		"x-requested-with": "XMLHttpRequest",
		"content-type": "application/json",
		"Sec-Ch-Ua-Platform": "Linux",
		Cookie: "",
		"Cache-Control": "no-cache",
	},
}

export async function Init(input) {
	//post
	//https://opencorporates.com/companies?q=ALLIED+MACHINE+%26+ENGINEERING+CORP&utf8=%E2%9C%93
	//payload:

	//post
	//https://opencorporates.com/companies?q=ALLIED+MACHINE+%26+ENGINEERING+CORP&utf8=%E2%9C%93
	//payload:

	var targetSearch = input
	var baseURL = `https://opencorporates.com/companies?q=${encodeURIComponent(input)}&utf8=%E2%9C%93`
	var baseURLPayload = {
	}
	requestHeaders.data = JSON.stringify(baseURLPayload)
	requestHeaders.method = "POST"
	if(process.env.COOKIES)
		requestHeaders.headers.Cookie = process.env.COOKIES

	var urlSearch = `${baseURL}`
	var urlDetails = null
	var officers = []
	var continueParse = false;
	util.inspect.defaultOptions.depth = 1
	
	return new Promise(function (resolve, reject) {
		
		axios
			.request(urlSearch, requestHeaders)
			.then((response) => {
				console.log("whaaats")
				var result = response.data.toString();

				if(!process.env?.COOKIES)
				{
					result = result.substring(result.indexOf("<!--"), result.indexOf("</script>"))

					result = result.replace("document.cookie", "var document = {}\ndocument.cookie")
					result = result.replace("document.location.reload(true);", "console.log(document.cookie)\nreturn document.cookie");
					result += "\ngo()"
					var cookies = eval(result);
					
					process.env.COOKIES = cookies
					requestHeaders.headers.Cookie = process.env.COOKIES
				}
				continueParse = true;
			})
			.finally(() => {
				if (continueParse) {
					axios
						.request(urlSearch, requestHeaders)
						.then((response) => {
							content = response.data
							console.log("yeaaaah")
							console.log(content)
						})
						.finally(() => {
							console.log("def resolved")
							console.log(continueParse)
							resolve("yeh")
						})
						.catch((e) => {
							console.log("Failed to get Details at: " + urlDetails + " for: " + targetSearch)
							reject(e)
						})
				} else {
					reject("No Detail results found at: " + urlSearch + " for: " + targetSearch)
				}
			})
			.catch((error) => {
				console.log("Failed to get search at: " + urlSearch)
				reject(error)
			})
	})
}
