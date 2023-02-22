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

function trackRemovedWindows(windowId) {
    let urls = [];
    let windowName = "";
    console.log("window removed");
    // TODO: sometimes the first recently closed thing seems to be a tab,
    // not a window. Therefore, this should be changed to a for loop that
    // takes the output of getRecentlyClosed() and runs thru it until it gets a
    // window.
    browser.sessions.getRecentlyClosed({max: 1})
        .then((sessionArr) => {
            console.log(sessionArr);
            /*let session = null;
            console.log("looking for " + windowId)
            for (let i = 0; i < sessionArr.length; i ++) {
                console.log(sessionArr[i].window);
                if (sessionArr[i].window != undefined) {x
                    console.log(sessionArr[i].window.id);
                    if (sessionArr[i].window.id == windowId) {
                        console.log("found");
                        console.log(sessionArr[i].window);
                    }
                }
            }
            for (let i = 0; i < sessionArr.length; i ++) {
                if (sessionArr[i].window != undefined) {
                    session = sessionArr[i];
                    break;
                }
            }*/
            let session = sessionArr[0];
            tabs = session.window.tabs;
            console.log(tabs);
            windowName = getHostName(tabs[0].url);
            for(let i = 0; i < tabs.length; i ++) {
                console.log(tabs[i].url);
                urls.push(tabs[i].url);
            }

            return browser.storage.local.set({
                [windowId]: {
                    name: windowName,
                    urls: urls
                }
            });
        })
        .catch((e) => console.log(e));
}

browser.windows.onRemoved.addListener(trackRemovedWindows);