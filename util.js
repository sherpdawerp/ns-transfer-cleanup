// "Interrupt flags" for pausing and stopping.
var transferCleanupPaused = false,
    transferCleanupStopped = false;

/**
 * "Interrupt handler" for pausing or unpausing. Sets the pause global.
 */
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
 * "Interrupt handler" for stopping. Sets the stop global.
 */
function transferCleanupStop() {
    logMessageToRunPage("Stopping...\n");
    transferCleanupStopped = true;
}

/**
 * Polls transferCleanupPaused to determine whether the program can restart running.
 */
async function waitUntilUnpaused() {
    if (transferCleanupPaused) {
        logMessageToRunPage("Paused!\n");
    }

    while (transferCleanupPaused) {
        await new Promise(resolve => {
            setTimeout() => {
                resolve("");
            }, 1000);
        });
    }
}

/**
 * Convert a string from general input to NS-standard-form.
 */
function canonicalise(string) {
    return string.toLowerCase().split(' ').join('_');
}

/**
 * Splits URL parameters into a nice object.
 */
function readURLParameters(path) {
    let splitPath = path.split("/"),
        parameters = {};

    for (let item of splitPath) {
        let itemVals = item.split("=");
        parameters[itemVals[0]] = itemVals[1];
    }
    return parameters;
}
