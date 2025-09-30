var items = [];
const dataIndex = 0;
const idIndex = 1;
const boxIndex = 2;

//getItems();

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
        row.appendChild(rowName);
        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);

}
