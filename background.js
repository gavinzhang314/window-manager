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
function storeRemovedWindows() {
    let urls = [];
    let windowName = "";
    console.log("session change");
    browser.sessions.getRecentlyClosed({maxResults: 1})
        .then((sessionArr) => {
            console.log(sessionArr);
            let session = sessionArr[0];
            console.log(session);
            // Check that last session change is a window closing
            if (session.window) {
                console.log("session is window");
                tabs = session.window.tabs;
                console.log(tabs);
                windowName = getHostName(tabs[0].url);

                for(let i = 0; i < tabs.length; i ++) {
                    console.log(tabs[i].url);
                    urls.push(tabs[i].url);
                }

                return browser.storage.local.set({
                    // TODO: change to random string?
                    [session.window.sessionId]: {
                        name: windowName,
                        urls: urls
                    }
                });
            }
        })
        .catch((e) => console.log(e));
}

browser.sessions.onChanged.addListener(storeRemovedWindows);