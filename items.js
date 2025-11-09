var items = [];
const dataIndex = 0;
const idIndex = 1;
const boxIndex = 2;

//deleteItem('http://localhost:8080/item/3');

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

    // create header
    var myDiv = document.getElementById("itemstablediv");

    var table = document.createElement("table");

    var header = document.createElement("tr");
    var itemName = document.createElement("th");
    itemName.appendChild(document.createTextNode("Items"));
    header.appendChild(itemName);
    table.appendChild(header);
    
    // create rows
    for (var i = 0; i < items.length; i++) {
        var row = document.createElement("tr");
        var rowName = document.createElement("td");
        rowName.appendChild(document.createTextNode(items[i][dataIndex]));

        var deleteTD = document.createElement("td");

        var del = document.createElement("input");
        del.type = "button";
        del.className = "delete-button";
        del.value = "Delete";
        const delUrl = items[i][idIndex];
        del.setAttribute('url', delUrl);
        del.onclick = async function() {
            await deleteItem(this.getAttribute("url"));
            var myDiv = document.getElementById("itemstablediv");
            var table = document.querySelector("table");
            myDiv.removeChild(table);
            items = [];
            createItemsTable();
        };

        deleteTD.appendChild(del);

        row.appendChild(rowName);
        row.appendChild(deleteTD);
        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);

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

// get list of boxes
// populate box name that is linked to item
// drop down with list of boxes previously selected
// > this will call a put that updates the box then refreshes the table
