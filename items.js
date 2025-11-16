var items = [];
const dataIndex = 0;
const idIndex = 1;
const boxIndex = 2;

var boxes = [];
//deleteItem('http://localhost:8080/item/3');
//postItem("itempost test");

//createNewItemForm();

createItemsTable();

async function getItems() {
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/item';
        var j = 0;
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.item.length);
            for (var i = 0; i < myJson._embedded.item.length; i++) {
                items[j] = [];
                items[j][dataIndex] = myJson._embedded.item[i].name;
                items[j][idIndex] = myJson._embedded.item[i]._links.self.href;
                items[j][boxIndex] = myJson._embedded.item[i]._links.box.href;
                j++;
            }
            try {
                if (typeof myJson._links.next !== 'undefined') {
                    hasNextLink = true;
                    url = myJson._links.next.href;
                } else {
                    hasNextLink = false;
                }
            } catch(error) {// haven't seen this happen yet
                console.log('no next link. exiting while', error);
                hasNextLink = false;
            }
        } while (hasNextLink === true);
    } catch(error) {
        console.log('no good. bad fetch:', error);
    }
    console.log('full arrary', items.length);

}

async function createItemsTable() {
    await getItems();
    await getBoxes();

    // create header
    var myDiv = document.getElementById("itemstablediv");

    var table = document.createElement("table");

    var header = document.createElement("tr");
    var itemHeader = document.createElement("th");
    itemHeader.appendChild(document.createTextNode("Items"));
    var deleteColumn = document.createElement("th");
    var boxColumn = document.createElement("th");
    boxColumn.appendChild(document.createTextNode("Box"));

    header.appendChild(itemHeader);
    header.appendChild(deleteColumn);
    header.appendChild(boxColumn);
    table.appendChild(header);
    
    // create rows
    for (var i = 0; i < items.length; i++) {
        var row = document.createElement("tr");
        var itemName = document.createElement("td");

//        var itemText = document.createTextNode(items[i][dataIndex]);
        var itemText = document.createElement("input");
        itemText.type = 'text';
        itemText.value = items[i][dataIndex];
        itemText.setAttribute('url', items[i][idIndex]);
        itemText.onchange = async function() {
            updateItemName(this);
        };

        itemName.appendChild(itemText);

        var deleteTD = document.createElement("td");

        var del = document.createElement("input");
        del.type = "button";
        del.className = "delete-button";
        del.value = "Delete";
        const delUrl = items[i][idIndex];
        del.setAttribute('url', delUrl);
        del.onclick = async function() {
            await deleteItem(this.getAttribute("url"));

            refreshItemsTable();
            var myDiv = document.getElementById("itemstablediv");
            var table = document.querySelector("table");
            myDiv.removeChild(table);
            items = [];
            boxes = [];
            createItemsTable();
        };

        deleteTD.appendChild(del);

        // box name here
        var boxTD = document.createElement("td");

        var boxDropdown = document.createElement("select");

        var defaultCreated = false;
        var boxId = await fetchBoxId(items[i][boxIndex]);
        console.log("box url for default:", boxId);
        // create options for dropdown with the names of the boxes
        for (var j = 0; j < boxes.length; j++) {
            var boxOption = document.createElement("option");
            boxOption.value = boxes[j][idIndex];
            boxOption.textContent = boxes[j][dataIndex];

            if (boxId === boxes[j][idIndex]) {
                boxOption.selected = true;
                console.log("HI FROM DEFAULT DD");
                defaultCreated = true;
            }

            boxDropdown.appendChild(boxOption);   

        }

        //create blank option
        var boxOption = document.createElement("option");
        if (defaultCreated === false) {
            boxOption.selected = true;
        }
        boxDropdown.appendChild(boxOption);
        
        boxDropdown.setAttribute('item-url', items[i][boxIndex]);
        boxDropdown.onchange = async function() {
            await updateBox(this.getAttribute("item-url"), this.value);
/*            var myDiv = document.getElementById("itemstablediv");
            var table = document.querySelector("table");
            myDiv.removeChild(table);
            items = [];
            boxes = [];
            createItemsTable();
            */
        };

        boxTD.appendChild(boxDropdown);


        row.appendChild(itemName);
        row.appendChild(deleteTD);
        row.appendChild(boxTD);
        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);

}

async function updateBox(itemURL, boxURL) {
    console.log("hi from updateBox");
    console.log(itemURL);
    console.log(boxURL);

    await fetch(itemURL, {
        method: 'PUT',
        headers: {
        'Content-Type': 'text/uri-list'
        },
        body: boxURL
    })
    .then(response => response.json())
    .then(data => {
        console.log('box update successfull:', data);
    })
    .catch(error => {
        console.error('error box update:', error);
    });

    console.log("bye from updateBox");
}

async function deleteItem(itemURL) {
    await fetch(itemURL, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('delete successfull:', data);
    })
    .catch(error => {
        console.error('error deleting:', error);
    });
}

async function getBoxes() {
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/box';
        var j = 0;
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.box.length);
            for (var i = 0; i < myJson._embedded.box.length; i++) {
                boxes[j] = [];
                boxes[j][dataIndex] = myJson._embedded.box[i].name;
                boxes[j][idIndex] = myJson._embedded.box[i]._links.self.href;
                boxes[j][boxIndex] = myJson._embedded.box[i]._links.location.href;
                j++;
            }
            try {
                if (typeof myJson._links.next !== 'undefined') {
                    hasNextLink = true;
                    url = myJson._links.next.href;
                } else {
                    hasNextLink = false;
                }
            } catch(error) {// haven't seen this happen yet
                console.log('no next link. exiting while', error);
                hasNextLink = false;
            }
        } while (hasNextLink === true);
    } catch(error) {
        console.log('no good. bad fetch:', error);
    }
    console.log('full arrary', boxes.length);
}

async function fetchBoxId(itemBoxURL) {
    var retURL;
    await fetch(itemBoxURL)
    .then(response => response.json())
    .then(data => {
        console.log('fetch successfull:', data);
        retURL = data._links.self.href;
    })
    .catch(error => {
        console.error('error fetching:', error);
    });

    return retURL;
}

// create new item
// put an input box in the div newitems
// save button that adds it
// save button calls the Post for item with the name
// if someone hits save and there is no data then do not call post

/*async function createNewItemForm() {
    var myDiv = document.getElementById("newitemsdiv");

    var newItemForm = document.createElement("form");
    newItemForm.id = "new_item_form";
    var newItemLabel = document.createElement("label");

    var itemInput = document.createElement("input");
}
*/

async function saveItem(form) {
    var name = form.new_items_input.value;

    await postItem(name);

    refreshItemsTable();

    form.new_items_input.value = "";
}

async function postItem(name) {

    var url = 'http://localhost:8080/item';
    
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Item POST successfull:', data);
        })
        .catch(error => {
            console.error('error item POST:', error);
        });
}

async function refreshItemsTable() {
            var myDiv = document.getElementById("itemstablediv");
            var table = document.querySelector("table");
            myDiv.removeChild(table);
            items = [];
            boxes = [];
            createItemsTable();
}

async function updateItemName(input) {
    var name = input.value;
    var itemUrl = input.getAttribute('url');

    await patchItem(name, itemUrl);

    refreshItemsTable();
}

async function patchItem(name, url) {

//    var url = 'http://localhost:8080/item';
    
    await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Item PATCH successfull:', data);
        })
        .catch(error => {
            console.error('error item PATCH:', error);
        });
}


