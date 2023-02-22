const BUTTON_OPEN_ID = "button-open-";
const BUTTON_DELETE_ID = "button-delete-";
const ROW_ID = "row-"
const TABLE_BODY_ID = "table"

let data = {};
let keys = [];
/*
browser.storage.local.set({
        1111: {
            name: "test1",
            urls: [
                "https://www.mozilla.org/en-US/",
                "https://duckduckgo.com/",
                "https://www.google.com/"
            ]
        },
        2222: {
            name: "test2",
            urls: [
                "https://www.mozilla.org/en-US/",
                "https://www.nytimes.com/",
                "https://www.npr.org/"
            ]
        },
        3333: {
            name: "test3",
            urls: [
                "https://www.mozilla.org/en-US/",
                "https://www.youtube.com/",
                "https://github.com/"
            ]
        }
    })
*/
browser.storage.local.get()
    .then((d) => {
        data = d;
        console.log(data);

        // Populate table in popup
        keys = Object.keys(data);
        let table = document.getElementById(TABLE_BODY_ID);
        for (let i = 0; i < keys.length; i ++) {
            win = data[keys[i]];
            table.innerHTML += `<tr id="${ROW_ID + keys[i]}">
                    <td> ${win.name} </td>
                    <td> <button id="${BUTTON_OPEN_ID + keys[i]}"><i class="bi bi-window-plus"></i></button> </td>
                    <td> <button id="${BUTTON_DELETE_ID + keys[i]}"><i class="bi bi-trash3"></i></button> </td>
                </tr>`;
        }
    });

document.addEventListener("click", (e) => {
    switch (e.currentTarget.id) {
        case "new-window": {
            const urlsToOpen = [
                "https://www.mozilla.org/en-US/",
                "https://duckduckgo.com/",
                "https://www.google.com/"
            ];
            browser.windows.create({
                url: urlsToOpen["urls"]
            });
            break;
        }

        case "print-all": {
            console.log(document.getElementsByTagName("html")[0].innerHTML);
        }

        default: {
            // TODO: make this more elegant
            // This makes sure that, even though the icon is clicked, we are
            // looking at the id of the button that the icon is in. I have seen
            // that this can be done with e.currentTarget but I don't know how.
            console.log(e.currentTarget.tagName);
            let button = null;
            if (e.target.tagName == "button") {
                button = e.target;
            } else {
                button = e.target.parentNode;
            }
            
            console.log("button pressed with id " + button.id);
            console.log(e.currentTarget);
            if (button.id.startsWith(BUTTON_OPEN_ID)) {
                let key = button.id.split(BUTTON_OPEN_ID)[1];
                console.log("Opening " + key);
                browser.windows.create({
                    // TODO: move to storing data part instead of here where
                    // it's being retrieved?
                    url: data[key]["urls"].filter(s => s.startsWith("http"))
                });

                // Remove row
                // TODO: add this to a function
                let rowToRemove = document.getElementById(ROW_ID + key);
                rowToRemove.parentNode.removeChild(rowToRemove);
                browser.storage.local.remove(key);
            } else if (button.id.startsWith(BUTTON_DELETE_ID)) {
                let key = button.id.split(BUTTON_DELETE_ID)[1];
                console.log("Deleting " + key);
                let rowToRemove = document.getElementById(ROW_ID + key);
                rowToRemove.parentNode.removeChild(rowToRemove);
                browser.storage.local.remove(key);
            }
        }
    }
});