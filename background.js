/** Extracts the hostname from the provided url
 * 
 * @param {string} url the url to extract the hostname from
 * @returns the hostname in the url
 */
function getHostName(url) {
    // TODO: make more elegant
    try {
        return url.split("://")[1].split("/")[0];
    } catch {
        return url;
    }
}

/**
 * Checks to ensure that the last session is a window. If it is, extracts the
 * list of tabs open in that window session and stores it in local memory.
 */
async function storeRemovedWindows() {
    let session = 
            (await browser.sessions.getRecentlyClosed({maxResults: 1}))[0];
    // Check that last session change is a window closing
    if (session.window && session.window.type == "normal") {
        let data = await browser.storage.local.get();
        let tabs = session.window.tabs;
        let urls = [];

        for(let i = 0; i < tabs.length; i ++) {
            urls.push(tabs[i].url);
        }

        let windowObject = {};

        if (currClosingWindowName) {
            windowObject = {
                name: currClosingWindowName,
                hasCustomName: true,
                urls: urls
            }
            currClosingWindowName = null;
        } else {
            windowObject = {
                name: getHostName(tabs[0].url),
                hasCustomName: false,
                urls: urls
            }
        }
        if (data.windows) {
            await browser.storage.local.set({
                windows: Object.assign(data.windows, {
                    // TODO: change to random string?
                    [session.window.sessionId]: windowObject
                })
            });
        } else {
            await browser.storage.local.set({
                windows: {
                    // TODO: change to random string?
                    [session.window.sessionId]: windowObject
                }
            });
        }
    }
}

/**
 * Retrieves the name of the window with the given ID by using the ID as a key
 * for data.openWindowNames and returns the window name after deleting it from
 * data.openWindowNames.
 * 
 * @param {int} winId the ID if the window to retrieve the name of
 * @returns the name of the window
 */
async function retrieveWindowName(winId) {
    let data = await browser.storage.local.get();
    let name = data.openWindowNames[winId];
    delete data.openWindowNames[winId];
    await browser.storage.local.set({openWindowNames: data.openWindowNames});
    return name;
}

// The entire system for keeping track of names of open windows depends on the
// observation/assumption that windows.onRemoved triggers before
// sessions.onChanged. This is necessary because we only have access to the
// window ID when the window is open and we only have access to the session ID
// when the window is closed. Therefore, without this, we'd have to find a way
// to convert between window ID and session ID, which I don't think is 
// possible.

// Name of the window that is currently being closed.
let currClosingWindowName = null;

browser.sessions.onChanged.addListener(storeRemovedWindows);

browser.windows.onRemoved.addListener(
        (winId) => retrieveWindowName(winId)
                .then(name => {currClosingWindowName = name}));