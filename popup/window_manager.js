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

        // Populate table in popup
        keys = Object.keys(data).filter(s => !s.startsWith("open"));
        let table = document.getElementById(TABLE_BODY_ID);
        console.log(keys.length);
        if (keys.length == 0) {
            document.getElementById(NO_WINDOW_MESSAGE_ID)
                .removeAttribute("hidden");
        }
        for (let i = 0; i < keys.length; i ++) {
            win = data[keys[i]];

            table.innerHTML += `<tr id="${ROW_ID + keys[i]}">
                    <td class="window-name"> <span id="${NAME_ID + keys[i]}"> ${win.name} </span> </td>
                    <td> <button id="${BUTTON_OPEN_ID + keys[i]}"><i class="bi bi-window-plus"></i></button>
                    <button id="${BUTTON_DELETE_ID + keys[i]}"><i class="bi bi-trash3"></i></button> </td>
                </tr>`;
        }
    });

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
                    url: data[key]["urls"].filter(s => s.startsWith("http"))
                });
                // Store name of opened window in local memory
                if (data[key].hasCustomName) {
                    await browser.storage.local.set({
                        openWindowNames: Object.assign({
                            [win.id]: data[key].name
                        }, data.openWindowNames)
                    });
                }

                // Remove row
                // TODO: add this to a function?
                let rowToRemove = document.getElementById(ROW_ID + key);
                rowToRemove.parentNode.removeChild(rowToRemove);
                browser.storage.local.remove(key);
                
            } else if (button.id.startsWith(BUTTON_DELETE_ID)) {
                let key = button.id.split(BUTTON_DELETE_ID)[1];
                let rowToRemove = document.getElementById(ROW_ID + key);
                let table = rowToRemove.parentNode;
                table.removeChild(rowToRemove);
                console.log(table.children.length);
                if (table.children.length == 0) {
                    document.getElementById(NO_WINDOW_MESSAGE_ID)
                        .removeAttribute("hidden");
                }
                await browser.storage.local.remove(key);
            }
        }
    }
});

document.addEventListener("dblclick", (e) => {
    if (e.target.id.startsWith(NAME_ID)) {
        if (nameChange) {
            document.getElementById(NAME_ID + nameChange).innerHTML = data[nameChange].name;
        }

        let key = e.target.id.split(NAME_ID)[1];
        nameChange = key;
        console.log("namechange set to "+ key);
        e.target.innerHTML = `<input id="${NAME_INPUT_ID + key}" text="${e.target.innerHTML}">`;
        let inputBox = document.getElementById(NAME_INPUT_ID + key);
    }
});

document.addEventListener("keypress", (e) => {
    console.log("keypressed");
    console.log(e);
    if (e.code == "Enter") {
        console.log(nameChange);
        let win = data[nameChange];
        let newName = document.getElementById(NAME_INPUT_ID + nameChange).value;
        document.getElementById(NAME_ID + nameChange).innerHTML = newName;

        browser.storage.local.set({
            [nameChange]: {
                name: newName,
                hasCustomName: true,
                urls: data[nameChange].urls
            }
        });
        nameChange = null;
    }

});