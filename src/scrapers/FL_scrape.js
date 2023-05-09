
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
	"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
	"x-requested-with": "XMLHttpRequest",
	"Referer": "https://www.netflix.com/",
	"content-type": "application/json"
};

var requestOptions = {
	method: "POST",
	headers: newOpts,
	redirect: "follow",
    cache: "no-cache"
};

var domOpts = {
    runScripts: "dangerously",
    cookieJar: new CookieJar(),
    virtualConsole: new VirtualConsole()
}

var genreCategories = {
    recentlyAdded: "1592210"
}

var localCookies = {};

export async function Init(input) {
    console.log("Running FL_scrape.js");

    return "what";
}

export async function Init(media, payload, output) {
	var out = [];

	// var listLength = 120;
	// var listLength = payload[0].media.length;
	var percentage = 0;
	mediaType = media;
	var currentPackSize = 0;
    var getDetail = null;
    var dom;
    var initLogin;
    var initDom;
    var initCookieFields = {};

	console.log("Current media target: " + media);

	if (output) {
		outputPath = output;
		mediaFilePath = outputPath + "/pack/";
		console.log(resolve(mediaFilePath));
	} else {
		outputPath = filePackName + mediaType;
		mediaFilePath = filePackName + mediaType;
	}

	if (fs.existsSync(mediaFilePath)) {
		currentPackSize = fs.readdirSync(mediaFilePath).length;
		console.log("pack size: " + currentPackSize);
		logbuffer.flush();
	}

    initLogin = await fetch("https://www.netflix.com/login", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "method": "POST" 
    }).then((result => {
        let headersCookie = result.headers.get("set-cookie").split(/\s*;\s*/);
        initCookieFields.setCookie = [];
        initCookieFields.targetCookie = {};
        
        for(var i = 0; i < headersCookie.length; i++) {
            if(headersCookie[i].includes(",") && (!headersCookie[i].includes("Expires"))) {
                headersCookie[i] = headersCookie[i].split(/\s*,\s*/);
                for(var thing in headersCookie[i]) {
                    initCookieFields.setCookie.push(headersCookie[i][thing]);
                }
            } else {
                initCookieFields.setCookie.push(headersCookie[i]);
            }
        }

        for(var fields in initCookieFields.setCookie) {
            if(initCookieFields.setCookie[fields].includes("flwssn")) {
                initCookieFields.targetCookie.flwssn = initCookieFields.setCookie[fields];
            } else if(initCookieFields.setCookie[fields].includes("nfvdid")) {
                initCookieFields.targetCookie.nfvdid = initCookieFields.setCookie[fields];
            } else if(initCookieFields.setCookie[fields].includes("SecureNetflixId")) {
                initCookieFields.targetCookie.secNetflixId = initCookieFields.setCookie[fields];
            } else if(initCookieFields.setCookie[fields].includes("NetflixId")) {
                initCookieFields.targetCookie.netflixId = initCookieFields.setCookie[fields];
            } else if(initCookieFields.setCookie[fields].includes("memclid")) {
                initCookieFields.targetCookie.memclid = initCookieFields.setCookie[fields];
            }
        }
        console.log(initCookieFields);

        result.text()
    }))


    try {
        //ignore the error it gives.
        initDom = new JSDOM(initLogin, domOpts);
    } catch (e) {
        console.log("JSDOM parsed successfully, but returned an error...");
        if(debug) {
            console.log(e.message);
        }
    }
    

    // console.log(initDom);
    // console.log(initDom.window.netflix.reactContext.models.loginContext.data.flow.fields);
    // initCookieFields.memclid = initDom.window.netflix.reactContext.models.loginContext.data.flow.fields;
    // initCookieFields.authURL = initDom.window.netflix.reactContext.models.loginContext.data.userInfo.authURL;
    // initCookieFields.flwssn = initDom.window.netflix.reactContext.models.loginContext.data.flow.flwssn;
    // console.log(initSrc.headers.get("set-cookie"));
    // return;

	if (mediaType == "movies") {
        
	} else if (mediaType == "series") {
    }

    var testFetch = await fetch("https://www.netflix.com/login", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": `${initCookieFields.targetCookie.flwssn}memclid=8ae65d91-27bc-4536-8a3b-5ca8c3997200; nfvdid=BQFmAAEBEN_Xo9p3Qkn5hAiHPo1oJ0Vg41E__SnOe3KIGP138MvfG6wlQa6b_AoFkJgO_tqTsTKCFUPdg4vdgZcR9IGOGvuZkUJTOd4GyjOoOFTUADoFkJcHRKGxpP9ISWziO4MYLRSsJUTUJ1X8iEbbmcdX3950; OptanonConsent=consentId=2321a651-1623-46c0-9dcc-85f3ed230e1d&datestamp=Thu+Feb+23+2023+11%3A00%3A11+GMT-0500+(Eastern+Standard+Time)&version=202301.1.0&interactionCount=0&isGpcEnabled=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1; OptanonAlertBoxClosed=2022-04-15T16:38:11.922Z; profilesNewSession=0; netflix-sans-normal-3-loaded=true; netflix-sans-bold-3-loaded=true`,
            "Referer": "https://www.netflix.com/login",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `userLoginId=dmdddd%40freedddd.com&password=CyanStdddd&rememberMe=true&flow=websiteSignUp&mode=login&action=loginAction&withFields=rememberMe%2CnextPage%2CuserLoginId%2Cpassword%2CcountryCode%2CcountryIsoCode%2CrecaptchaResponseToken%2CrecaptchaError%2CrecaptchaResponseTime&authURL=1677168006177.PU7ogyxPjVbw9An3cjKftPLnkMo%3D&nextPage=&showPassword=&countryCode=%2B1&countryIsoCode=US&recaptchaResponseToken=03AFY_a8UgszqAcKHEEDiHnq3GmoMtkSATQBZzbpykz4khzV6fZNd8OObnn1nPaLbLtylPAak-IjQHuSEJRkztpk24QT2hJcF74lyn6Uwl56ccy4b5wMcgRh74ypaYRoHpDUQzsaTuxOlEu2de9MT57N1rFYjWy-B8b_woOGIgxFGCNXXF7swhpgoCCWtXgRAo_MxI6Al_Em-XqSW6Fp6atxy9C10ll75mCDK9KnR9fjTbK39XQ8kQLJVkqNtBRcXE-yAuAvZBJfdhD0OI8C5dgLxx9uK52KvSBjj7ZKbdc_r5C-Fjyz1Y05aw1KF3Q_8G93_A0FDKmQazVoBMVUJQrO-mNHMxJanl5saxX7FQgdMz9yOhtNpvlfwhFKB_MDWeUPoJMRvcib1CdMbsAGwwJ9o0959HIW2zJOu-UvlDXqU8z1zTQkxzm8jOtTXMepajBTKgMBT6S7q1r-ljazpmUsZ2a2h_wP4wS3GTi-Ls3mEatu-Gow6qTwiqLA8hOcX6C--MxWlD29ViCB5prW9R6KO0O_r7zYfp4xbL_fwsjtaZnT02liYdgunKevAO-MXeAOldPm2VJJj7ykkUn3v7OFEhjtOtKEccjIyqoV6YtDNMdripEms8LblWyTO_ogsYsqrsnLBloqqmsVOTJ6-ywsA_RtWzcmHPALmvhINdm_ryoNK5qTzaUcFgj1WxfpnqrRNblZsG5ZXhI708odrjelZf0BMd3EMcyAqbR---VmfzHGLGc4uHRhWS3BQlYdo_E_wddstQ0aUXs6KHmrnThCClzvVpZPRp_Dfa-9hGN6gRJ9s5uzq5Ha7--kvRzyLQqX9-L-MJHh11SFiMHUmfgs9Z3PH5Wga7h-4TfQFqkwNleELfdFyZVDDIplo4_deaIYN7jEwOzYCbwb6xgDkTnaHYrYjOpwxUMube8tl8SVjz_0jJrVyP6bTydhid4awzLpRSqFyfGMG-2pwLP49yVLbxJyO3q4131gUlFew6RnumfHDSrc3cr5_CRm5jFo4ZVfGhdQIT5UWKnKd-hOeV9jyi0VOahtG29GH1shNQhXHVeMlBfnrL5KRhedg876vfxpY1rn0jUkQxuLXB_r0AVQTFQN2P42N5Q5EYjHrcCYgHLgJOoYRJdeCz6DjuggG3vl_3lw87Zd6h9XK3oS1UY34XI9Qk2NLY2rN-ERmZ5i2IfwF-n4onH41Q1rrivjh7gciJFYWka2qaeCz3eRR3rmjDXmfS9aA1ccW8CLtTp2r2nteajA1eJpO--Z2zHagnjs4_w0_w3hR7fb-5cGtgcZLtelF3EJK87N46r6QSpdTLhihlDATRIh4IFOZvXHw-eQWbSfIkbhHjKFVc1YvG3zXibhQREhwqHND-ss8H1NupVhXf8F1YyrcM4waqrk580F4DeM-iGhB847ezvYYZS1ruP_ezOKpQ_47U5QpEDF3B5mlZ5zsn1eyNHBrFb9SxLke8W2vPu7_tnC176kg9LRqtiSo64HG2kt-i9ZYFwcpb4F5x-woe37rWKpQ1Iv5hVVBQ2MYMpiJuptLPIcvnpJ3tEQb6wrBJWk7UyiEz2r7R4gfQnYHjb1DL2hacYnNlfhIn-hJ_f_h7&recaptchaResponseTime=265`,
        "method": "POST"    
    });
    
    // console.log(testFetch);
    //save cookies
    console.log("Getting cookers")
    var headersCookie = testFetch.headers.get("set-cookie");
    // console.log(headersCookie);
    // console.log(typeof headersCookie);
    // for(var thing in headersCookie.split(';')) {
    //     console.log(thing);
    // }
    
    testFetch = await testFetch.text();

    try {
        //ignore the error it gives.
        dom = new JSDOM(testFetch, domOpts);
    } catch (e) {
        console.log("JSDOM parsed successfully, but returned an error...");
        if(debug) {
            console.log(e.message);
        }
    }
    //goal is to get netflix.reactContext.models.nmTitleUI for seasons and titles from here on dom
    // console.log(dom.window.netflix);1
    console.log(dom.window.netflix.reactContext.models.loginContext.data.flow.fields.userLoginId);
    console.log(dom.window.netflix.reactContext.models.loginContext.data.flow.fields);
    // console.log(JSON.stringify(domOpts.cookieJar.cookies))
    
    // console.log(dom.window.netflix.reactContext.models.loginContext.data.flow.fields);
    // console.log(testFetch);
	console.log("Done");
    
	logbuffer.flush();

	// await libUtil.PackAllToJSON(out, output, listLength, mediaType, maxPackSize);
    
}