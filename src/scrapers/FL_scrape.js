import * as netAPI from "../util/netAPI.js"
import * as cheerio from "cheerio"
import axios from "axios"
import * as fs from "fs"
import * as util from "util"
import logbuffer from "console-buffer"

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
	var baseURL = "https://search.sunbiz.org"
	//should be input
	var targetSearch = netAPI.SanitizeSpecialChar(input)
	var urlSearch = `${baseURL}/Inquiry/CorporationSearch/SearchResults/EntityName/${encodeURIComponent(
		targetSearch
	)}/Page1`
	var urlDetails = null
	var officers = []
	var searchPage = null
	// urlSearch = "http://localhost:5000" //delete after
	// var file = fs.readFileSync("./out/test.txt") // delete after

	util.inspect.defaultOptions.depth = 1

	return new Promise(function (resolve, reject) {
		var searchedItem
		axios
			.get(urlSearch, requestHeaders)
			.then((response) => {
				// response.data = file //delete after
				const $ = cheerio.load(response.data)
				const page = $("#search-results")

				searchPage = SearchPageItem(targetSearch, page)
				searchedItem = SearchMatchedItem(targetSearch, searchPage)
				if (searchedItem != null) {
					urlDetails = baseURL + searchedItem?.link
				}
			})
			.finally(() => {
				var content = null
				if (urlDetails) {
					axios
						.get(urlDetails, requestHeaders)
						.then((response) => {
							const $ = cheerio.load(response.data)
							content = $(".detailSection")
							officers = PageScrape(content)
						})
						.finally(() => {
							console.log("def resolved")
							resolve(officers)
						})
						.catch((e) => {
							console.log("Failed to get Details at: " + urlDetails)
							reject(e)
						})
				} else {
					reject("No Detail results found at: " + urlSearch)
				}
			})
			.catch((error) => {
				console.log("Failed to get search at: " + urlSearch)
				//reject and return error code
				reject(error)
			})
	})
}

function PageScrape(officerDetailList) {
	var officers = null

	for (var i = 0; i < officerDetailList.length; i++) {
		if (
			officerDetailList[i].children[1].children[0].data.match(
				/(officer|director|president|authorized|person)/gi
			)
		) {
			const officerDetail = officerDetailList[i].children

			officers = ExtractProperties(officerDetail)
		}
	}

	return officers
}

function ExtractProperties(officer) {
	const officers = []
	var officerTemplates = {
		title: "",
		firstName: "",
		middleName: "",
		lastName: "",
		address: "",
		state: "",
		city: "",
		zipcode: "",
	}

	for (var i = 0; i < officer.length; i++) {
		const officerProperties = JSON.parse(JSON.stringify(officerTemplates))

		if (
			officer[i]?.tagName == "span" &&
			officer[i].children.length > 0 &&
			officer[i]?.children[0].data?.match(/title/gi)
		) {
			//get current index of the element in the list
			const itemIndex = officer.indexOf(officer[i])

			//get the rest of the properties
			const name = officer[i].parent.children[itemIndex + 5].data
				.replace(/\s+/g, " ")
				.trim()
				.split(" ")
			const addressDiv = officer[i].parent.children[itemIndex + 6].children[1]
			const address = addressDiv.children[0].data.replace(/\s+/g, " ").trim()
			const location = addressDiv.children[2].data.replace(/\s+/g, " ").trim().split(" ")

			officerProperties.title = officer[i].children[0].data.replace(/Title\s/gi, "")
			officerProperties.firstName = name[1]
			officerProperties.middleName = name[2] ? name[2] : ""
			officerProperties.lastName = name[0].replace(",", "")
			officerProperties.address = address
			officerProperties.state = location[1]
			officerProperties.city = location[0].replace(",", "")
			officerProperties.zipcode = location[2]

			officers.push(officerProperties)
		}
	}

	return officers
}

function SearchPageItem(companyName, page) {
	//return an item from search page's table
	var companyItems = []

	var searchResults = page
	var searchResult = searchResults.find("tbody")
	var companyList = searchResult.find("tr")

	for (var el = 0; el < companyList.length; el++) {
		var target = companyList[el]
		var targetRows = target.children.filter((e) => e.type == "tag")
		var detailTarget = targetRows
		var items = {}

		items.companyName = netAPI.SanitizeSpecialChar(
			detailTarget[0].children[0].children[0]?.data
		)
		items.link = detailTarget[0].children[0].attribs.href
		items.status = detailTarget[2].children[0].data
		if (netAPI.SanitizeSpecialChar(items.companyName).match(companyName)) {
			companyItems.push(items)
		}
	}

	return companyItems
}

function SearchMatchedItem(company, companyItems) {
	var validCompany = null

	for (var item in companyItems) {
		if (
			companyItems[item].companyName == netAPI.SanitizeSpecialChar(company) &&
			!companyItems[item].status.match(/INACT/gi)
		) {
			validCompany = companyItems[item]
			break
		}
	}

	if (!validCompany) {
		for (var item in companyItems) {
			if (netAPI.SanitizeSpecialChar(companyItems[item].companyName) == company) {
				validCompany = companyItems[item]
				validCompany.matchedName = companyItems[item].companyName
				break
			}
		}
	}

	if (!validCompany) {
		for (var item in companyItems) {
			if (netAPI.SanitizeSpecialChar(companyItems[item].companyName).match(company)) {
				validCompany = companyItems[item]
				validCompany.matchedName = companyItems[item].companyName
				break
			}
		}
	}

	return validCompany
}
