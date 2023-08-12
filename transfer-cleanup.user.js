// stats, global because I CBA passing them around
var stats_RequestsMade = 0;

/**
 * Logs a message to the output box and scrolls down to it.
 */ 
function logMessageToRunPage(message) {
    document.getElementById("transfer-cleanup-run-output").value = document.getElementById("transfer-cleanup-run-output").value + message;
  	document.getElementById("transfer-cleanup-run-output").scrollTop = document.getElementById("transfer-cleanup-run-output").scrollHeight;
}

/**
 * "wrapper" function that ratelimits NS API calls
 */
async function transferCleanupAPIWrapper(url, args) {
    let ctime = Number(performance.now());
    let timeDif = (lastRequestSentTime - Number(performance.now())) + transferCleanupRateLimit;
  
    if (timeDif > 0) {
        console.log(`ratelimiter waiting | current: ${ctime} | last: ${lastRequestSentTime} | waiting: ${timedif}`);

        await new Promise(resolve => {
            setTimeout(() => {
                resolve("");
            }, timeDif);
        });
    }

    let response = await fetch(url + "&script=sherpdawerp-transfer-cleanup", args);
    lastRequestSentTime = Number(performance.now());
    console.log(`request made | time: ${lastRequestSentTime}`);

    return response;
}

/*
 * "wrapper" function that ratelimits NS API calls.
 * Uses new ratelimiting headers; mashes out 30 requests and then waits for the rest of the timeframe before
 * continuing.
 *
 * THIS DEFINITELY WON'T PLAY NICE WITH OTHER SCRIPTS!!!
 */
async function transferCleanupAPIWrapperExperimental(url, args) {
    let response = await fetch(url + "&script=sherpdawerp-transfer-cleanup", args);
    stats_RequestsMade += 1;
    console.log(`request made | time: ${performance.now()} | total requests: ${stats_RequestsMade}`);

    if (Number(response.headers["RateLimit-Remaining"]) == 0) {
        timeToWait = Number(response.headers["RateLimit-Reset"]) + 1;

        console.log(`ratelimit bucket filled | waiting: ${timeToWait}`);

        await new Promise(resolve => {
            setTimeout(() => {
                resolve("");
            }, timeToWait * 1000);
        });
    }

    return response;
}

async function transferCleanupCardOwnersRequest(cardInfo, useragent) {
    let response = await transferCleanupAPIWrapper(
        "https://www.nationstates.net/cgi-bin/api.cgi?q=card+owners&cardid="+cardInfo[0]+"&season="+cardInfo[1],
        {
            method: "GET",
            headers: {
                "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
            }
        }
    );

    if (response.status != 200) {
        logMessageToRunPage("Error: Requesting owners of "+cardInfo[0]+":"+cardInfo[1]+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
      
        console.log(await response.text());
        return [];
    } else {
        let parser = new DOMParser(),
            parsed = parser.parseFromString((await response.text()), "text/xml"),
            owners = [];

        if (parsed.getElementsByTagName("OWNER").length < 1) {
            logMessageToRunPage("Warning: Card "+cardInfo[0]+":"+cardInfo[1]+" doesn't seem to exist. We'll skip it and continue.\n");
        }

        for (let owner of parsed.getElementsByTagName("OWNER")) {
            owners.push(owner.textContent);
        }

        return owners;
    }
}

async function transferCleanupDoGiftCard(cardInfo, credentials, toNation, lastCredentials, useragent) {
    let newLastCredentials = {nation: "", pin: "", autologin: "", password: ""},
        reqHeaders = {},
        parser = new DOMParser(),
        giftToken = "";
  	
  	if (credentials[0] === document.getElementById("loggedin").getAttribute("data-nname")) {
      	logMessageToRunPage("Warning: Gifting from the currently logged-in nation is unsupported.\n");
      	return newLastCredentials;
    } else if (credentials[0] === toNation) {
      	logMessageToRunPage("Info: Skipping circular gift from "+credentials[0]+" to "+toNation+".\n");
      	return newLastCredentials;
    }

    // set pin if available
    if (credentials[0] === lastCredentials["nation"]) {
        reqHeaders = {
            "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
            "X-Pin": lastCredentials["pin"],
          	"X-Autologin": lastCredentials["autologin"],
          	"X-Password": lastCredentials["password"]
        }
        newLastCredentials = lastCredentials;
        console.log(`reusing old credentials | gifting to: ${credentials[0]} | last creds: ${lastCredentials['nation']}`);
    } else {
        reqHeaders = {
            "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
            "X-Password": credentials[1]
        }
        console.log(`no credentials | gifting to: ${credentials[0]} | last creds: ${lastCredentials['nation']}`);
    }

    let response = await transferCleanupAPIWrapper(
      	"https://www.nationstates.net/cgi-bin/api.cgi?nation="+credentials[0]+"&c=giftcard&cardid="+cardInfo[0]+"&season="+cardInfo[1]+"&to="+toNation+"&mode=prepare",
      	{
        		method: "GET",
        		headers: reqHeaders
    		}
    );

    if (response.status != 200) {
        logMessageToRunPage("Error: Preparing gift of "+cardInfo[0]+":"+cardInfo[1]+" from "+credentials[0]+" to "+toNation+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
      
      	console.log(await response.text());
        return null;
    } else {
        if (newLastCredentials["nation"] === "") {
            newLastCredentials["nation"] = credentials[0];
            newLastCredentials["pin"] = response.headers.get("X-Pin");
          	newLastCredentials["autologin"] = response.headers.get("X-Autologin");
          	newLastCredentials["password"] = credentials[1];
            console.log(`request successful | updating credentials`);
                               
            reqHeaders["X-Pin"] = response.headers.get("X-Pin");
          	reqHeaders["X-Autologin"] = response.headers.get("X-Autologin");
        }

        let parsed = parser.parseFromString((await response.text()), "text/xml");
        
        if (parsed.getElementsByTagName("SUCCESS").length != 1) {
            if (parsed.getElementsByTagName("ERROR").length == 1) {
                logMessageToRunPage("Warning: "+parsed.getElementsByTagName("ERROR")[0].textContent);
            }
            
            return newLastCredentials;
        } else {
            giftToken = parsed.getElementsByTagName("SUCCESS")[0].textContent;
        }
    }

    response = await transferCleanupAPIWrapper(
      	"https://www.nationstates.net/cgi-bin/api.cgi?nation="+credentials[0]+"&c=giftcard&cardid="+cardInfo[0]+"&season="+cardInfo[1]+"&to="+toNation+"&mode=execute&token="+giftToken,
      	{
            method: "GET",
            headers: reqHeaders
        }
    );

    if (response.status != 200) {
        logMessageToRunPage("Error: Preparing gift of "+cardInfo[0]+":"+cardInfo[1]+" from "+credentials[0]+" to "+toNation+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
      
        console.log(await response.text());
        return null;
    } else {
        let parsed = parser.parseFromString((await response.text()), "text/xml");

        if (parsed.getElementsByTagName("SUCCESS").length != 1) {
            if (parsed.getElementsByTagName("ERROR").length == 1) {
                logMessageToRunPage("Warning: "+parsed.getElementsByTagName("ERROR")[0].textContent+"\n");
            }
        } else {
            logMessageToRunPage("Info: "+parsed.getElementsByTagName("SUCCESS")[0].textContent+"\n");
        }
    }

    return newLastCredentials;
}

/**
 * Main application logic of the program.
 */
async function transferCleanupButtonRunScript() {
    let x_userAgent = document.getElementById("userAgent").value,
        x_mainNation = canonicalise(document.getElementById("mainNation").value),
        x_credentials = document.getElementById("credentials").value,
        x_transferCards = document.getElementById("transferCards").value;
  	transferCleanupRateLimit = document.getElementById("rateLimit").value;
    
    if (transferCleanupRateLimit < 600) {
        document.getElementById("transfer-cleanup-start-info").innerHTML = "You cannot have a ratelimit less than 600ms!";
        return;
    }

    // create run page
    document.getElementById("content").innerHTML = transferCleanupRunPageHTML;
    document.getElementById("pauseButton").addEventListener("click", transferCleanupPause, false);
    document.getElementById("stopButton").addEventListener("click", transferCleanupStop, false);

    let giftQueue = [],
        cardLineNum = 1,
        credLineNum = 1;

    for (let transferCard of x_transferCards.split("\n")) {
        if (transferCleanupStopped) {
          	logMessageToRunPage("Stopped!\n");
            return;
        }
        await waitUntilUnpaused();

        transferCard = transferCard.split(",");

        if (transferCard.length != 2) {
            logMessageToRunPage("Error: Bad transfer card format \""+x_transferCards.split("\n")[cardLineNum-1]+"\" on line "+cardLineNum+"\n");
            logMessageToRunPage("       Terminating program...\n");
            return;
        }

        logMessageToRunPage("Info: Checking owners for cardid "+transferCard[0]+" / season "+transferCard[1]+"\n");

        let owners = await transferCleanupCardOwnersRequest(transferCard, x_userAgent);

        for (let owner of owners) {
            credLineNum = 1;
            for (let credential of x_credentials.split("\n")) {
                credential = credential.split(",");

                if (credential.length != 2) {
                    logMessageToRunPage("Error: Bad credential format \""+x_credentials.split("\n")[credLineNum-1]+"\" on line "+credLineNum+"\n");
                    logMessageToRunPage("       Terminating program...\n");
                    return;
                }
              
                if (canonicalise(credential[0]) === owner) {
                    giftQueue.push({from: canonicalise(credential[0]), pwd: credential[1], cardid: transferCard[0], season: transferCard[1]});
                }

                credLineNum++;
            }
        }

        cardLineNum++;
    }

    logMessageToRunPage("Info: Finished checking owners for all transfer cards...\n");
    let lastCredentials = {nation: "", pin: "", autologin: "", password: ""};
  
    for (let gift of giftQueue) {
        if (transferCleanupStopped) {
            logMessageToRunPage("Stopped!\n");
            return;
        }
        await waitUntilUnpaused();

        logMessageToRunPage("Info: Gifting "+gift["cardid"]+":"+gift["season"]+" from "+gift["from"]+" to "+x_mainNation+"...\n");

        lastCredentials = await transferCleanupDoGiftCard([gift["cardid"], gift["season"]], [gift["from"], gift["pwd"]], x_mainNation, lastCredentials, x_userAgent);
        if (lastCredentials == null) {
            return;
        }
    }

    logMessageToRunPage("Finished!\n");
}

function createTransferCleanupMainPage() {
    let x_NsContent = document.getElementById("content");
    x_NsContent.innerHTML = transferCleanupMainPageHTML;

    document.getElementById("userAgent").setAttribute("value", document.getElementById("loggedin").getAttribute("data-nname"));
    document.getElementById("mainNation").setAttribute("value", document.getElementById("loggedin").getAttribute("data-nname"));
    document.getElementById("credentialsFile").setAttribute("onchange", "showFileUpload(this);");
    document.getElementById("cardsFile").setAttribute("onchange", "showFileUpload(this);");
    document.getElementById("startButton").addEventListener("click", transferCleanupButtonRunScript, false);
}

function createFileUploadJS() {
    let x_NsHeader = document.head || document.getElementsByTagName('head')[0],
        transferCleanupUploadScript = document.createElement('script');

    x_NsHeader.appendChild(transferCleanupUploadScript);
    transferCleanupUploadScript.type = "text/javascript";
    transferCleanupUploadScript.appendChild(document.createTextNode(transferCleanupShowFileScript));
}

function createTransferCleanupCSS() {
    let x_NsPageHeader = document.head || document.getElementsByTagName('head')[0],
        transferCleanupStyle = document.createElement('style');

    x_NsPageHeader.appendChild(transferCleanupStyle);
    transferCleanupStyle.type = "text/css"; // NB: "type" is only a deprecated property for <li> elements, if your IDE is yelling at you

    transferCleanupStyle.appendChild(document.createTextNode(transferCleanupCSS));
}

function createTransferCleanupAboutPage() {
    let x_nsPageContent = document.getElementById("content");
    
    x_nsPageContent.innerHTML = transferCleanupAboutPageHTML;
}

function createTransferCleanupLink() {
  	if (document.getElementById("puppet-suite-link") == null) {
        let transferCleanupLink = document.createElement("div"),
            x_NsPageBanner = document.getElementById("banner");

        transferCleanupLink.innerHTML = transferCleanupBannerLinkHTML;
        transferCleanupLink.setAttribute("class", "bel");
        transferCleanupLink.setAttribute("id", "puppet-suite-link");

        // little bit dodgy ig
        x_NsPageBanner.insertBefore(transferCleanupLink, x_NsPageBanner.lastChild.previousSibling);
    } else {
        // setup for dropdown menu?
    }
}

function transferCleanupChangePageTitle() {
  	document.getElementsByTagName("title")[0].innerHTML = "NationStates | TransferCleanup Userscript";
}

(async function() {
    "use strict";
    createTransferCleanupLink();

    let x_NsURLParams = readURLParameters(window.location.pathname);
    if (Object.keys(x_NsURLParams).includes("x-transfer-cleanup")) {
        if (x_NsURLParams["x-transfer-cleanup"] == "main") {
          	lastRequestSentTime = Number(performance.now());
          	
            createFileUploadJS();
            createTransferCleanupCSS();
            createTransferCleanupMainPage();
          	transferCleanupChangePageTitle()
        } else if (x_NsURLParams["x-transfer-cleanup"] == "about") {
            createTransferCleanupCSS();
            createTransferCleanupAboutPage();
          	transferCleanupChangePageTitle();
        }
    }
})();
