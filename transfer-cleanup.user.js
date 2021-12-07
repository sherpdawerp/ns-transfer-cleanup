// ==UserScript==
// @name            transfer-cleanup
// @author          SherpDaWerp
// @description     ns-transfer-cleanup reloaded
// @version         1
// @downloadURL     https://github.com/sherpdawerp/ns-transfer-cleanup/raw/master/transfer-cleanup.user.js
// @match           https://www.nationstates.net/*
// @grant           console.log
// @run-at          document-end
// ==/UserScript==

/**
 * Licensed under the Apache License 2.0. The full text of the license is viewable on the script's about page, or in the LICENSE file of the repository.
 */

const transferCleanupCSS = `.transfer-cleanup-content{margin: 1%}.transfer-cleanup-control-label{font-weight: 700; display: inline-block; width: auto; margin-bottom: 5px;}.transfer-cleanup-checkbox-label{display: inline-block; width: auto; margin-bottom: 5px;}.transfer-cleanup-help-block{width: auto; display: block; margin-top: 5px; margin-bottom: 10px;}.transfer-cleanup-form-group{width: auto;}.transfer-cleanup-form-control{display: block; padding: 6px 12px; line-height: 1.2; border-radius: 5px; box-shadow: inset 0 1px 1px rgba(0,0,0,.075); margin-bottom: 30px;}input.transfer-cleanup-form-control{width: 90%}textarea.transfer-cleanup-form-control{height: auto; width: 90%;}.transfer-cleanup-file{padding: 10px;}.transfer-cleanup-checkbox{margin-bottom: 10px;}.transfer-cleanup-button{font-size: 14px; margin-top: 10px;}pre{margin: 2px; padding: 10px; background-color: #C3C3C3; width: 90%;}#transfer-cleanup-run-output{font-family: monospace;}#transfer-cleanup-start-info{margin-left: 10px; color: red;}input:invalid{border: solid red 3px;}`;

const transferCleanupLinkCSS = `<style>td.createcol p{padding-left: 10em;}a{text-decoration: none; color: black;}a:visited{color: grey;}table{border-collapse: collapse; display: table-cell; max-width: 100%; background-color: lightgrey;}td p{padding: 0.5em;}</style>`;

const transferCleanupBannerLinkHTML = `<div class="belcontent"> <a href="/page=blank/x-transfer-cleanup=main" class="bellink"> <i class="icon-cards" id="x-transfer-cleanup"></i>CLEANUP </a> </div>`;

const transferCleanupRunPageHTML = `<div class="transfer-cleanup-content"> <p class="lead">transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers. </p><div class="transfer-cleanup-panel"> <div class="transfer-cleanup-panel-heading"> <h3 class="transfer-cleanup-panel-title"> <a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a </h3> </div><div class="transfer-cleanup-panel-body"> <div class="transfer-cleanup-run-output-box"> <textarea class="transfer-cleanup-form-control" id="transfer-cleanup-run-output" rows="20" readonly></textarea> </div><div id="transfer-cleanup-control-buttons"> <button id="pauseButton" class="button transfer-cleanup-button">Pause Running</button><button id="stopButton" class="button transfer-cleanup-button">Stop Running</button></div></div></div></div>`;

const transferCleanupMainPageHTML = `<div class="transfer-cleanup-content"> <p class="lead">transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers. </p><div class="transfer-cleanup-panel"> <div class="transfer-cleanup-panel-heading"> <h3 class="transfer-cleanup-panel-title"><a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a </h3> </div><div class="transfer-cleanup-panel-body"> <div id="userAgentFormGroup" class="transfer-cleanup-form-group"> <label class="transfer-cleanup-control-label" for="userAgent">User-Agent</label> <span class="transfer-cleanup-help-block">A string identifying you (the user of this program) to NationStates. Using the name of your main nation is recommended. This field defaults to the name of the currently logged-in nation. </span> <input id="userAgent" class="transfer-cleanup-form-control" type="text" value="" autocomplete="off"> </div><div id="mainNationFormGroup" class="transfer-cleanup-form-group"> <label class="transfer-cleanup-control-label" for="mainNation">Main Nation</label> <span class="transfer-cleanup-help-block">The name of the nation that you want the cards gifted to. Defaults to the name of the currently logged-in nation.</span> <input id="mainNation" class="transfer-cleanup-form-control" type="text" value="" autocomplete="off"> </div><div id="rateLimitFormGroup" class="transfer-cleanup-form-group"> <label class="transfer-cleanup-control-label" for="Ratelimit">Ratelimit</label> <span class="transfer-cleanup-help-block">The number of milliseconds between NationStates API Requests. Minimum 600.</span> <input id="rateLimit" class="transfer-cleanup-form-control" type="number" min="600" value="600" autocomplete="off"> </div><div id="credentialsFormGroup" class="transfer-cleanup-form-group"> <label class="transfer-cleanup-control-label" for="credentials">Puppet Names and Passwords</label> <span class="transfer-cleanup-help-block">Input names and passwords here, so that every different name/password pair is on a new line. The format for each line is "nationname,password". For example: <pre>
myfirstpuppet,password1
mysecondpuppet,password2</pre>Inputting passwords is required for this tool to function. <b>For more information about how passwords are used, check the <a href="/page=blank/x-transfer-cleanup=about#passwords">about page</a>.</b> </span><br><textarea id="credentials" class="transfer-cleanup-form-control" rows="10"></textarea> <span class="transfer-cleanup-help-block">Alternatively, you can upload a credentials file from your computer. The format should be a .csv or .txt file, and it should be written according to the rules above. </span> <input id="credentialsFile" class="transfer-cleanup-form-control transfer-cleanup-file" type="file"> </div><div id="cardsFormGroup" class="transfer-cleanup-form-group"> <label class="transfer-cleanup-control-label" for="credentials">Transfer Card(s)</label> <span class="transfer-cleanup-help-block">Input the transfer cards you wish to move here. The following rules apply:<br>Each line must be of the form "cardId,season". For example, if you have:<pre>
1342163,2
2019443,1</pre>then nations with either of those two cards will make an attempt to transfer them back to your main nation.
</span><br><textarea id="transferCards" class="transfer-cleanup-form-control" rows="5"></textarea> <span class="transfer-cleanup-help-block">Alternatively, you can upload a cards file from your computer. The format should be a .csv or .txt file, and it should be written according to the rules above. </span> <input id="cardsFile" class="transfer-cleanup-form-control transfer-cleanup-file" type="file"> </div><div id="transfer-cleanup-controls"> <button id="startButton" class="button transfer-cleanup-button">Start</button><label id="transfer-cleanup-start-info"></label></div></div></div></div>`;

const transferCleanupAboutPageHTML = `<div class="transfer-cleanup-content"> <p class="lead">transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers.</p><div class="transfer-cleanup-panel"> <div class="transfer-cleanup-panel-heading"> <h3 class="transfer-cleanup-panel-title"><a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a </h3> </div><div class="transfer-cleanup-panel-body"> <div class="transfer-cleanup-about-panel"> <h5 class="transfer-cleanup-panel-title" id="about"> About This Program </h5> <div class="transfer-cleanup-about-content"><p><em>transfer-cleanup</em> Copyright © 2021 SherpDaWerp<br><br>With thanks to:<br><b>nslogin-web</b> Copyright © 2017 Auralia<br>for providing an excellent visual template for projects like this<br><br><em>Github Repository: </em><a href="https://github.com">Coming Soon</a><br><em>NationStates Forum Page: </em><a href="https://github.com">Coming Soon</a><br><br><em>NationStates Cards Discord Server: </em><a href="https://discord.com/invite/yn5a4p9">https://discord.com/invite/yn5a4p9</a></p></div></div><div class="transfer-cleanup-about-panel"> <h5 class="transfer-cleanup-panel-title" id="passwords"> How Transfer-Cleanup Handles Passwords </h5> <div class="transfer-cleanup-about-content">All code is run client-side and passwords are only transmitted to NationStates. Nothing is transferred to any contributor (me or any other) as third parties. You can verify this yourself by reading the source code of this program (available on <a href="">GitHub</a>, or alternatively, installed into your browser). Passwords cannot be saved to localstorage and are only kept while they are actively input into transfer-cleanup. If you choose to upload your credentials as a file, you are choosing the file that the browser accesses (so this tool cannot see anything you don't give it). Furthermore, this file is then only read in-browser and not transmitted anywhere. </div></div><div class="transfer-cleanup-about-panel"> <h5 class="transfer-cleanup-panel-title" id="license"> License </h5> <div class="transfer-cleanup-about-content"><p><em>transfer-cleanup</em> is licensed under the Apache License 2.0:</p><h2><a id="Apache_License_0"></a>Apache License</h2> <p><em>Version 2.0, January 2004</em><br><em>&lt;<a href="http://www.apache.org/licenses/">http://www.apache.org/licenses/</a>&gt; </em> </p><h3> <a id="Terms_and_Conditions_for_use_reproduction_and_distribution_6"></a>Terms and Conditions for use, reproduction, and distribution</h3> <h4><a id="1_Definitions_8"></a>1. Definitions</h4> <p>“License” shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.</p><p>“Licensor” shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.</p><p>“Legal Entity” shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, “control” means <strong>(i)</strong> the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or <strong>(ii)</strong> ownership of fifty percent (50%) or more of the outstanding shares, or <strong>(iii)</strong> beneficial ownership of such entity.</p><p>“You” (or “Your”) shall mean an individual or Legal Entity exercising permissions granted by this License.</p><p>“Source” form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.</p><p>“Object” form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.</p><p>“Work” shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).</p><p>“Derivative Works” shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.</p><p>“Contribution” shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, “submitted” means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as “Not a Contribution.”</p><p>“Contributor” shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.</p><h4><a id="2_Grant_of_Copyright_License_62"></a>2. Grant of Copyright License</h4> <p>Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.</p><h4><a id="3_Grant_of_Patent_License_70"></a>3. Grant of Patent License</h4> <p>Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.</p><h4><a id="4_Redistribution_85"></a>4. Redistribution</h4> <p>You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:</p><ul> <li><strong>(a)</strong> You must give any other recipients of the Work or Derivative Works a copy of this License; and </li><li><strong>(b)</strong> You must cause any modified files to carry prominent notices stating that You changed the files; and </li><li><strong>(c)</strong> You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and </li><li><strong>(d)</strong> If the Work includes a “NOTICE” text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License. </li></ul> <p>You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.</p><h4><a id="5_Submission_of_Contributions_119"></a>5. Submission of Contributions</h4> <p>Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.</p><h4><a id="6_Trademarks_128"></a>6. Trademarks</h4> <p>This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.</p><h4><a id="7_Disclaimer_of_Warranty_135"></a>7. Disclaimer of Warranty</h4> <p>Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.</p><h4><a id="8_Limitation_of_Liability_146"></a>8. Limitation of Liability</h4> <p>In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.</p><h4> <a id="9_Accepting_Warranty_or_Additional_Liability_158"></a>9. Accepting Warranty or Additional Liability</h4> <p>While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.</p><p><em>END OF TERMS AND CONDITIONS</em></p></div></div></div></div></div>`;

const transferCleanupShowFileScript = `
    function showFileUpload(input) {
        let reader = new FileReader(),
            fileInput = input;

        reader.onload = function() {
            while (input.tagName !== "TEXTAREA") {
                input = input.previousSibling;
            }
            input.value = input.value + reader.result;
        };
        
        reader.onerror = function() {
            alert(reader.error);
        };

        for (let file of fileInput.files) {
            reader.readAsText(file);
        }
    }
`;

var transferCleanupPaused = false,
    transferCleanupStopped = false;

function readURLParameters(path) {
    let splitPath = path.split("/"),
        parameters = {};

    for (let item of splitPath) {
        let itemVals = item.split("=");
        parameters[itemVals[0]] = itemVals[1];
    }
    return parameters;
}

function transferCleanupPause() {
    if (transferCleanupPaused) {
        logMessageToRunPage("Resuming...\n");
        transferCleanupPaused = false;
        document.getElementById("pauseButton").innerHTML = "Pause Running";
    } else {
        logMessageToRunPage("Pausing...\n");
        transferCleanupPaused = true;
        document.getElementById("pauseButton").innerHTML = "Unpause Running";
    }
}

/**
 * Sets the value of transferCleanupStopped.
 */
function transferCleanupStop() {
    logMessageToRunPage("Stopping...\n");
    transferCleanupStopped = true;
}

/**
 * Horrific JS-async version of a sleep function.
 */
function sleep(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("");
        }, time);
    });
}

/**
 * Polls transferCleanupPaused to determine whether the program can restart running.
 */
async function waitUntilUnpaused() {
    if (transferCleanupPaused) {
        logMessageToRunPage("Paused!\n");
    }

    while (transferCleanupPaused) {
        await sleep(1000);
    }
}

function logMessageToRunPage(message) {
    document.getElementById("transfer-cleanup-run-output").value = document.getElementById("transfer-cleanup-run-output").value + message;
}

async function transferCleanupCardOwnersRequest(cardInfo, useragent) {
    let response = await fetch("https://www.nationstates.net/cgi-bin/api.cgi?q=card+owners&cardid="+cardInfo[0]+"&season="+cardInfo[1], {
        method: "GET",
        headers: {
            "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
        }
    });
    console.log(await response.text());

    if (response.status != 200) {
        logMessageToRunPage("Error: Requesting owners of "+cardInfo[0]+":"+cardInfo[1]+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
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
    let newLastCredentials = {nation: "", pin: ""},
        reqHeaders = {},
        parser = new DOMParser(),
        giftToken = "";

    // set pin if available
    if (credentials[0] === lastCredentials["nation"]) {
        reqHeaders = {
            "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
            "X-Pin": lastCredentials["pin"]
        }
        newLastCredentials = lastCredentials;
    } else {
        reqHeaders = {
            "User-Agent": "Transfer-Cleanup userscript/tool, developed by SherpDaWerp, in use by "+useragent,
            "X-Password": credentials[1]
        }
    }

    let response = await fetch("https://www.nationstates.net/cgi-bin/api.cgi?nation="+credentials[0]+"&c=giftcard&cardid="+cardInfo[0]+"&season="+cardInfo[1]+"&to="+toNation+"&mode=prepare", {
        method: "GET",
        headers: reqHeaders
    });
    console.log(response);

    if (response.status != 200) {
        logMessageToRunPage("Error: Preparing gift of "+cardInfo[0]+":"+cardInfo[1]+" from "+credentials[0]+" to "+toNation+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
        return null;
    } else {
        if (newLastCredentials["nation"] === "") {
            newLastCredentials["nation"] = credentials[0];
            newLastCredentials["pin"] = response.headers.get("X-Pin");
            reqHeaders["X-Pin"] = response.headers.get("X-Pin");
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

    response = await fetch("https://www.nationstates.net/cgi-bin/api.cgi?nation="+credentials[0]+"&c=giftcard&cardid="+cardInfo[0]+"&season="+cardInfo[1]+"&to="+toNation+"&mode=execute&token="+giftToken, {
        method: "GET",
        headers: reqHeaders
    });
    console.log(response);

    if (response.status != 200) {
        logMessageToRunPage("Error: Preparing gift of "+cardInfo[0]+":"+cardInfo[1]+" from "+credentials[0]+" to "+toNation+" failed.\n");
        logMessageToRunPage("       Terminating program...\n");
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
        x_mainNation = document.getElementById("mainNation").value,
        x_rateLimit = document.getElementById("rateLimit").value,
        x_credentials = document.getElementById("credentials").value,
        x_transferCards = document.getElementById("transferCards").value;
    
    if (x_rateLimit < 600) {
        document.getElementById("transfer-cleanup-start-info").innerHTML = "You cannot have a ratelimit less than 600ms!";
        return;
    }

    // create run page
    document.getElementById("content").innerHTML = transferCleanupRunPageHTML;
    document.getElementById("pauseButton").addEventListener("click", transferCleanupPause, false);
    document.getElementById("stopButton").addEventListener("click", transferCleanupStop, false);

    let giftQueue = [],
        cardLineNum = 1,
        credLineNum = 1,
        clock = new Date(),
        lastRequestTime = Number(clock.getTime());

    for (let transferCard of x_transferCards.split("\n")) {
        if (transferCleanupStopped) {
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

        let timeDif = (Number(lastRequestTime) - Number(clock.getTime())) + x_rateLimit;
        if (timeDif > 0) {
            await sleep(timeDif);
        }

        let owners = await transferCleanupCardOwnersRequest(transferCard, x_userAgent);
        lastRequestTime = Number(clock.getTime());

        for (let owner of owners) {
            credLineNum = 1;
            for (let credential of x_credentials.split("\n")) {
                credential = credential.split(",");

                if (credential.length != 2) {
                    logMessageToRunPage("Error: Bad credential format \""+x_credentials.split("\n")[credLineNum-1]+"\" on line "+credLineNum+"\n");
                    logMessageToRunPage("       Terminating program...\n");
                    return;
                }
                if (credential[0].toLowerCase().replace(" ", "_") === owner) {
                    giftQueue.push({from: credential[0], pwd: credential[1], cardid: transferCard[0], season: transferCard[1]});
                }

                credLineNum++;
            }
        }

        cardLineNum++;
    }

    logMessageToRunPage("Info: Finished checking owners for all transfer cards...\n");
    let lastCredentials = {nation: "", pin: ""};
    for (let gift of giftQueue) {
        if (transferCleanupStopped) {
            logMessageToRunPage("Stopped!\n");
            return;
        }
        await waitUntilUnpaused();

        logMessageToRunPage("Info: Gifting "+gift["cardid"]+":"+gift["season"]+" from "+gift["from"]+" to "+x_mainNation+"...\n");

        let timeDif = (Number(lastRequestTime) - Number(clock.getTime())) + x_rateLimit*2;
        if (timeDif > 0) {
            await sleep(timeDif);
        }

        lastCredentials = await transferCleanupDoGiftCard([gift["cardid"], gift["season"]], [gift["from"], gift["pwd"]], x_mainNation, lastCredentials, x_userAgent);
        if (lastCredentials == null) {
            return;
        }
        lastRequestTime = Number(clock.getTime());
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
    transferCleanupStyle.type = "text/css"; // NB: "type" is only a deprecated property for <li> elements

    transferCleanupStyle.appendChild(document.createTextNode(transferCleanupCSS));
}

function createTransferCleanupAboutPage() {
    let x_nsPageContent = document.getElementById("content");
    
    x_nsPageContent.innerHTML = transferCleanupAboutPageHTML;
}

function createTransferCleanupLink() {
    let transferCleanupLink = document.createElement("div"),
        x_NsPageBanner = document.getElementById("banner");

    transferCleanupLink.innerHTML = transferCleanupBannerLinkHTML;
    transferCleanupLink.setAttribute("class", "bel");

    // little bit dodgy ig
    x_NsPageBanner.insertBefore(transferCleanupLink, x_NsPageBanner.lastChild.previousSibling);
}

(async function() {
    "use strict";
    createTransferCleanupLink();

    let x_NsURLParams = readURLParameters(window.location.pathname);
    if (Object.keys(x_NsURLParams).includes("x-transfer-cleanup")) {
        if (x_NsURLParams["x-transfer-cleanup"] == "main") {
            createFileUploadJS();
            createTransferCleanupCSS();
            createTransferCleanupMainPage();
        } else if (x_NsURLParams["x-transfer-cleanup"] == "about") {
            createTransferCleanupCSS();
            createTransferCleanupAboutPage();
        }
    }
})();
