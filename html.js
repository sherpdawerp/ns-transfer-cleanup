/**
 * This file contains all the CSS, HTML, and injected JS needed for transfer-cleanup to function.
 */

const transferCleanupCSS = `
.transfer-cleanup-content {
    margin: 1%
}

.transfer-cleanup-control-label {
    font-weight: 700;
    display: inline-block;
    width: auto;
    margin-bottom: 5px;
}

.transfer-cleanup-checkbox-label {
    display: inline-block;
    width: auto;
    margin-bottom: 5px;
}

.transfer-cleanup-help-block {
    width: auto;
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
}

.transfer-cleanup-form-group {
    width: auto;
}

.transfer-cleanup-form-control {
    display: block;
    padding: 6px 12px;
    line-height: 1.2;
    border-radius: 5px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    margin-bottom: 30px;\
}

input.transfer-cleanup-form-control {
    width: 90%
}

textarea.transfer-cleanup-form-control {
    height: auto;
    width: 90%;
}

.transfer-cleanup-file {
    padding: 10px;
}

.transfer-cleanup-checkbox {
    margin-bottom: 10px;
}

.transfer-cleanup-button {
    font-size: 14px;
    margin-top: 10px;
}

pre {
    margin: 2px;
    padding: 10px;
    background-color: #C3C3C3;
    width: 90%;
}

#transfer-cleanup-run-output {
    font-family: monospace;
}

#transfer-cleanup-start-info {
    margin-left: 10px;
    color: red;
}

input:invalid {
    border: solid red 3px;
}`;

const transferCleanupLinkCSS = `
<style>
    td.createcol p {
        padding-left: 10em;
    }

    a {
        text-decoration: none;
        color: black;
    }

    a:visited {
        color: grey;
    }

    table {
        border-collapse: collapse;
        display: table-cell;
        max-width: 100%;
        background-color: lightgrey;
    }
    
    td p {
        padding: 0.5em;
    }
</style>`;

const transferCleanupBannerLinkHTML = `
<div class="belcontent">
    <a href="/page=blank/x-transfer-cleanup=main" class="bellink">
        <i class="icon-cards" id="x-transfer-cleanup"></i>CLEANUP
    </a>
</div>`;

const transferCleanupRunPageHTML = `
<div class="transfer-cleanup-content">
    <p class="lead">
        transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers.
    </p>
    <div class="transfer-cleanup-panel">
        <div class="transfer-cleanup-panel-heading">
            <h3 class="transfer-cleanup-panel-title">
                <a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a>
            </h3>
        </div>
        <div class="transfer-cleanup-panel-body">
            <div class="transfer-cleanup-run-output-box">
                <textarea class="transfer-cleanup-form-control" id="transfer-cleanup-run-output" rows="20" readonly></textarea>
            </div>
            <div id="transfer-cleanup-control-buttons">
                <button id="pauseButton" class="button transfer-cleanup-button">Pause Running</button>
                <button id="stopButton" class="button transfer-cleanup-button">Stop Running</button>
            </div>
        </div>
    </div>
</div>`;

const transferCleanupMainPageHTML = `
<div class="transfer-cleanup-content">
    <p class="lead">transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers. </p>
    <div class="transfer-cleanup-panel">
        <div class="transfer-cleanup-panel-heading">
            <h3 class="transfer-cleanup-panel-title">
                <a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a>
            </h3>
        </div>
        <div class="transfer-cleanup-panel-body">
            <div id="userAgentFormGroup" class="transfer-cleanup-form-group">
                <label class="transfer-cleanup-control-label" for="userAgent">User-Agent</label>
                <span class="transfer-cleanup-help-block">A string identifying you (the user of this program) to NationStates. Using the name of your main nation is recommended. This field defaults to the name of the currently logged-in nation. </span>
                <input id="userAgent" class="transfer-cleanup-form-control" type="text" value="" autocomplete="off">
            </div>
            <div id="mainNationFormGroup" class="transfer-cleanup-form-group">
                <label class="transfer-cleanup-control-label" for="mainNation">Main Nation</label>
                <span class="transfer-cleanup-help-block">The name of the nation that you want the cards gifted to. Defaults to the name of the currently logged-in nation.</span>
                <input id="mainNation" class="transfer-cleanup-form-control" type="text" value="" autocomplete="off">
            </div>
            <div id="rateLimitFormGroup" class="transfer-cleanup-form-group">
                <label class="transfer-cleanup-control-label" for="Ratelimit">Ratelimit</label>
                <span class="transfer-cleanup-help-block">The number of milliseconds between NationStates API Requests. Minimum 600.</span>
                <input id="rateLimit" class="transfer-cleanup-form-control" type="number" min="600" value="600" autocomplete="off">
            </div>
            <div id="credentialsFormGroup" class="transfer-cleanup-form-group">
                <label class="transfer-cleanup-control-label" for="credentials">Puppet Names and Passwords</label>
                <span class="transfer-cleanup-help-block">Input names and passwords here, so that every different name/password pair is on a new line. The format for each line is "nationname,password". For example: <pre>
myfirstpuppet,password1
mysecondpuppet,password2</pre>Inputting passwords is required for this tool to function. <b>For more information about how passwords are used, check the <a href="/page=blank/x-transfer-cleanup=about#passwords">about page</a>.</b> </span>
                <br>
                <textarea id="credentials" class="transfer-cleanup-form-control" rows="10"></textarea>
                <span class="transfer-cleanup-help-block">Alternatively, you can upload a credentials file from your computer. The format should be a .csv or .txt file, and it should be written according to the rules above. </span>
                <input id="credentialsFile" class="transfer-cleanup-form-control transfer-cleanup-file" type="file">
            </div>
            <div id="cardsFormGroup" class="transfer-cleanup-form-group">
                <label class="transfer-cleanup-control-label" for="credentials">Transfer Card(s)</label>
                <span class="transfer-cleanup-help-block">Input the transfer cards you wish to move here. The following rules apply:<br>Each line must be of the form "cardId,season". For example, if you have:<pre>
1342163,2
2019443,1</pre>then nations with either of those two cards will make an attempt to transfer them back to your main nation.
</span>
                <br>
                <textarea id="transferCards" class="transfer-cleanup-form-control" rows="5"></textarea>
                <span class="transfer-cleanup-help-block">Alternatively, you can upload a cards file from your computer. The format should be a .csv or .txt file, and it should be written according to the rules above. </span>
                <input id="cardsFile" class="transfer-cleanup-form-control transfer-cleanup-file" type="file">
            </div>
            <div id="transfer-cleanup-controls">
                <button id="startButton" class="button transfer-cleanup-button">Start</button>
                <label id="transfer-cleanup-start-info"></label>
            </div>
        </div>
    </div>
</div>`;

const transferCleanupAboutPageHTML = `
<div class="transfer-cleanup-content">
    <p class="lead">transfer-cleanup is a free, open-source userscript tool that helps to automatically cleanup after mass-copy card transfers.</p>
    <div class="transfer-cleanup-panel">
        <div class="transfer-cleanup-panel-heading">
            <h3 class="transfer-cleanup-panel-title">
                <a href="/page=blank/x-transfer-cleanup=main">Configuration</a> | <a href="/page=blank/x-transfer-cleanup=about">About</a>
            </h3>
        </div>
        <div class="transfer-cleanup-panel-body">
            <div class="transfer-cleanup-about-panel">
                <h5 class="transfer-cleanup-panel-title" id="about">About This Program</h5>
                <div class="transfer-cleanup-about-content">
                    <p><em>transfer-cleanup</em> Copyright © 2023 SherpDaWerp
                    <br><br>
                    With thanks to:
                    <br>
                    <b>nslogin-web</b> Copyright © 2017 Auralia
                    <br>
                    for providing an excellent visual template for projects like this
                    <br><br>
                    <em>Github Repository: </em><a href="https://github.com">Coming Soon</a>\
                    <br>
                    <em>NationStates Forum Page: </em>
                    <a href="https://github.com">Coming Soon</a>
                    <br><br>
                    <em>NationStates Cards Discord Server: </em>
                    <a href="https://discord.com/invite/yn5a4p9">https://discord.com/invite/yn5a4p9</a>
                </p>
            </div>
        </div>
        <div class="transfer-cleanup-about-panel">
            <h5 class="transfer-cleanup-panel-title" id="passwords"> How Transfer-Cleanup Handles Passwords </h5>
            <div class="transfer-cleanup-about-content">
                All code is run client-side and passwords are only transmitted to NationStates. Nothing is transferred to any contributor (me or any other) as third parties. You can verify this yourself by reading the source code of this program (available on <a href="https://github.com/sherpdawerp/ns-transfer-cleanup">GitHub</a>, or alternatively, installed into your browser). Passwords cannot be saved to localstorage and are only kept while they are actively input into transfer-cleanup. If you choose to upload your credentials as a file, you are choosing the file that the browser accesses (so this tool cannot see anything you don't give it). Furthermore, this file is then only read in-browser and not transmitted anywhere. 
            </div>
        </div>
        <div class="transfer-cleanup-about-panel">
            <h5 class="transfer-cleanup-panel-title" id="license"> License </h5>
            <div class="transfer-cleanup-about-content"><em>transfer-cleanup</em> is licensed under the Apache License 2.0. For the full text of the license as it applies to this project, please view <a href="https://github.com/sherpdawerp/ns-transfer-cleanup/blob/master/LICENSE">the GitHub repository</a>. 
        </div>
    </div>
</div>`;

/**
 * Function to read text from a file and place it into the immediately-prior <textarea> element.
 * This function gets injected into the page's JS as a permission bypass: userscripts cannot access local files.
 */
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


