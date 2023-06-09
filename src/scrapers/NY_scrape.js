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
	//post
	//https://apps.dos.ny.gov/PublicInquiryWeb/api/PublicInquiry/GetComplexSearchMatchingEntities
	//payload:
	//{"searchValue":"GIRL SCOUTS OF THE UNITED STATES OF AMERICA","searchByTypeIndicator":"EntityName","searchExpressionIndicator":"BeginsWith","entityStatusIndicator":"AllStatuses","entityTypeIndicator":["Corporation","LimitedLiabilityCompany","LimitedPartnership","LimitedLiabilityPartnership"],"listPaginationInfo":{"listStartRecord":1,"listEndRecord":50}}

	//post
	//https://apps.dos.ny.gov/PublicInquiryWeb/api/PublicInquiry/GetEntityRecordByID
	//payload:
	//{"SearchID":"4658825","EntityName":"GIRL SCOUTS OF THE UNITED STATES OF AMERICA","AssumedNameFlag":"false"}

	var targetSearch = input
	var baseURL =
		"https://apps.dos.ny.gov/PublicInquiryWeb/api/PublicInquiry/GetComplexSearchMatchingEntities"
	var baseURLPayload = {
		searchValue: `${targetSearch}`,
		searchByTypeIndicator: "EntityName",
		searchExpressionIndicator: "BeginsWith",
		entityStatusIndicator: "AllStatuses",
		entityTypeIndicator: [
			"Corporation",
			"LimitedLiabilityCompany",
			"LimitedPartnership",
			"LimitedLiabilityPartnership",
		],
		listPaginationInfo: { listStartRecord: 1, listEndRecord: 50 },
	}
	requestHeaders.data = JSON.stringify(baseURLPayload)
	requestHeaders.method = "POST"

	var urlSearch = `${baseURL}`
	var urlDetails = null
	var officers = []

	util.inspect.defaultOptions.depth = 1

	return new Promise(function (resolve, reject) {
		axios
			.request(urlSearch, requestHeaders)
			.then((response) => {
				const result = response.data.entitySearchResultList

				if (result.length > 0) {
					var index = 0;
					var found = false;
					for (var i = 0; i < result.length; i++) {
						if (netAPI.SanitizeSpecialChar(result[i].entityName) == netAPI.SanitizeSpecialChar(targetSearch)) {
							index = i
							found = true;
							break
						}
					}
					if(found)
					{
						urlDetails =
						"https://apps.dos.ny.gov/PublicInquiryWeb/api/PublicInquiry/GetEntityRecordByID"
						requestHeaders.data = JSON.stringify({
							SearchID: `${result[index].dosID}`,
							EntityName: `${targetSearch}`,
							AssumedNameFlag: "false",
						})
					} else {
						reject("No matched results found at: " + urlSearch)
					}
					
				} else {
					reject("No search results found at: " + urlSearch)
				}
			})
			.finally(() => {
				var content = null
				if (urlDetails) {
					axios
						.request(urlDetails, requestHeaders)
						.then((response) => {
							content = response.data
							officers = ExtractProperties(content.ceo)
						})
						.finally(() => {
							console.log("def resolved")
							resolve(officers)
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
	
	if(!officer.name)
		return null
		
	const name = officer.name
			.replace(/\s+/g, " ")
			.trim()
			.split(" ")
			
	var officerProperties = officerTemplates;
	officerProperties.title = "CEO"
	officerProperties.firstName = name[0]
	officerProperties.middleName = name[2] ? name[1] : ""
	officerProperties.lastName = name[2] ? name[2].replace(",", "") : name[1].replace(",", "")
	officerProperties.address = officer.address.streetAddress
	officerProperties.state = officer.address.state
	officerProperties.city = officer.address.city
	officerProperties.zipcode = officer.address.zipCode + officer.address.zipPlus4
	officers.push(officerProperties)
	
	return officers
}

