// TODO: change structure of storage.local so that all windows are stored in a
// certain key

const BUTTON_OPEN_ID = "button-open-";
const BUTTON_DELETE_ID = "button-delete-";
const ROW_ID = "row-"
const NAME_ID = "name-"
const NAME_INPUT_ID = "name-input-"
const TABLE_BODY_ID = "table"

const NO_WINDOW_MESSAGE_ID = "no-window-message";

let data = {};
let keys = [];

// Key for the window whose name is being changed
let nameChange = null;

// Retrieve and display data
browser.storage.local.get()
    .then((d) => {
        data = d;
        console.log(data);

        if (data.windows == undefined) {
            data["windows"] = {};
        }

        // Populate table in popup
        keys = Object.keys(data.windows).filter(s => !s.startsWith("open"));
        let table = document.getElementById(TABLE_BODY_ID);
        if (keys.length == 0) {
            document.getElementById(NO_WINDOW_MESSAGE_ID)
                .removeAttribute("hidden");
        }
        for (let i = 0; i < keys.length; i ++) {
            win = data.windows[keys[i]];

            table.innerHTML += `<tr id="${ROW_ID + keys[i]}">
                    <td class="window-name"> <span id="${NAME_ID + keys[i]}"> ${win.name} </span> </td>
                    <td> <button id="${BUTTON_OPEN_ID + keys[i]}"><i class="bi bi-window-plus"></i></button>
                    <button id="${BUTTON_DELETE_ID + keys[i]}"><i class="bi bi-trash3"></i></button> </td>
                </tr>`;
        }
    });

/**
 * Removes the window represented with the given key in local storage from the
 * popup, local storage, and {@code data}.
 * 
 * @param {*} key the key used in local storage to represent the window to
 *      remove
 */
async function removeSavedWindow(key) {
    let rowToRemove = document.getElementById(ROW_ID + key);
    let table = rowToRemove.parentNode;
    table.removeChild(rowToRemove);
    if (table.children.length == 0) {
        document.getElementById(NO_WINDOW_MESSAGE_ID)
            .removeAttribute("hidden");
    }

    delete data.windows[key];

    await browser.storage.local.set({windows: data.windows});
}

document.addEventListener("click", async (e) => {
    switch (e.target.id) {
        case "print-all": {
            console.log(document.getElementsByTagName("html")[0].innerHTML);
            break;
        }

        default: {
            // TODO: make this more elegant
            // This makes sure that, even though the icon is clicked, we are
            // looking at the id of the button that the icon is in. I have seen
            // that this can be done with e.currentTarget but I don't know how.
            let button = null;
            if (e.target.tagName == "button") {
                button = e.target;
            } else {
                button = e.target.parentNode;
            }
            
            if (button.id.startsWith(BUTTON_OPEN_ID)) {
                let key = button.id.split(BUTTON_OPEN_ID)[1];
                let win = await browser.windows.create({
                    // TODO: move to storing data part instead of here where
                    // it's being retrieved?
                    url: data.windows[key]["urls"].filter(s => s.startsWith("http"))
                });
                // Store name of opened window in local memory
                if (data.windows[key].hasCustomName) {
                    await browser.storage.local.set({
                        openWindowNames: Object.assign(data.openWindowNames, {
                            [win.id]: data.windows[key].name
                        })
                    });
                }

                await removeSavedWindow(key);
            } else if (button.id.startsWith(BUTTON_DELETE_ID)) {
                let key = button.id.split(BUTTON_DELETE_ID)[1];
                await removeSavedWindow(key);
            }
        }
    }
});

document.addEventListener("dblclick", (e) => {
    if (e.target.id.startsWith(NAME_ID)) {
        if (nameChange) {
            document.getElementById(NAME_ID + nameChange).innerHTML =
                    data.windows[nameChange].name;
        }

        let key = e.target.id.split(NAME_ID)[1];
        nameChange = key;
        e.target.innerHTML = `<input id="${NAME_INPUT_ID + key}" text="${e.target.innerHTML}">`;
        let inputBox = document.getElementById(NAME_INPUT_ID + key);
    }
});

document.addEventListener("keypress", (e) => {
    if (e.code == "Enter") {
        let win = data.windows[nameChange];
        let newName = document.getElementById(NAME_INPUT_ID + nameChange).value;
        document.getElementById(NAME_ID + nameChange).innerHTML = newName;

        data.windows[nameChange] = {
            name: newName,
            hasCustomName: true,
            urls: data.windows[nameChange].urls
        };

        browser.storage.local.set({
            windows: data.windows
        });
        nameChange = null;
    }

});