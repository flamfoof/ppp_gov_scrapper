import * as netAPI from "../util/netAPI.js";

var outputPath = "./netflix/output/";
var counter = 0;
var maxPackSize = process.env.MAX_PACK_ITEM;
var filePackName = "./pack/";
var fileAssetPackName = "pack_";
var mediaType;
var mediaFilePath;
var params;
var debug = true;

var newOpts = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest",
    "content-type": "application/json",
};

var requestOptions = {
    method: "POST",
    headers: newOpts,
    redirect: "follow",
    cache: "no-cache",
};

export async function Init(input) {
    netAPI.test();    
    

    return "what";
}
