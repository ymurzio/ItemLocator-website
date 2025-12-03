const host = 'http://localhost:8080';
const itemUrl = '/item';
const boxUrl = '/box';

const dataIndex = 0;
const idIndex = 1;
const boxIndex = 2;

var items = [];
var boxes = [];

var pageTotal;
var pageIndex;
var currentPageLink;
var recordsPerPage = 20;

onWindowLoad();

createItemsTable(host + itemUrl, host + boxUrl);

/**
 * Get items based on the itemsUrl
 * @itemsUrl URL of items
 */
async function getItems(itemsUrl) {
    try {
        var hasNextLink = false;
        var j = 0;

        const response = await fetch(itemsUrl);
        const myJson = await response.json();

        try {
            if (typeof myJson.page.totalPages !== 'undefined') {
                pageTotal = myJson.page.totalPages;
                pageIndex = myJson.page.number;
            }
        } catch(error) {
            console.log('no pagination: ', error);
            pageTotal = 1;
            pageIndex = 0;
        }

        currentPageLink = myJson._links.self.href;

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
            } else {
                hasNextLink = false;
            }
        } catch(error) {// haven't seen this happen yet
            console.log('no next link. exiting while', error);
            hasNextLink = false;
        }
    } catch(error) {
        console.log('no good. bad fetch:', error);
    }

}

/**
 * Create the whole items table.
 * @itemsUrl As the page you're on or search you entered changes you pass in the appropriate itemsUrl
 */
async function createItemsTable(itemsUrl, boxesUrl) {
    await getItems(itemsUrl);
    await getBoxes();

    // create header
    var myDiv = document.getElementById("items_table_div");

    var table = document.createElement("table");
    table.id = 'my_table';

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
        // send in the i index to the function
        var row = await createTableRow(i);

        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);

    createPagination();
}

async function createTableRow(i) {
    var row = document.createElement("tr");
    var itemName = document.createElement("td");

    var itemText = document.createElement("input");
    itemText.type = 'text';
    itemText.value = items[i][dataIndex];
    itemText.setAttribute('url', items[i][idIndex]);
    itemText.onchange = async function() {
        updateItemName(this);
    };

    itemName.appendChild(itemText);

    var deleteTD = document.createElement("td");

    var deleteInput = document.createElement("input");
    deleteInput.type = "button";
    deleteInput.className = "delete_button";
    deleteInput.value = "Delete";
    const delUrl = items[i][idIndex];
    deleteInput.setAttribute('url', delUrl);
    deleteInput.onclick = async function() {
        const status = await deleteItem(this.getAttribute("url"));

        if (status) {
            this.parentNode.parentNode.remove();
        }
    };

    deleteTD.appendChild(deleteInput);

    // box name here
    var boxTD = document.createElement("td");

    var boxDropdown = document.createElement("select");

    var defaultCreated = false;
    var boxId = await fetchBoxId(items[i][boxIndex]);

    // create options for dropdown with the names of the boxes
    for (var j = 0; j < boxes.length; j++) {
        var boxOption = document.createElement("option");
        boxOption.value = boxes[j][idIndex];
        boxOption.textContent = boxes[j][dataIndex];

        if (boxId === boxes[j][idIndex]) {
            boxOption.selected = true;
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

    boxDropdown.setAttribute('item_url', items[i][boxIndex]);
    boxDropdown.onchange = async function() {
        await updateBox(this.getAttribute("item_url"), this.value);
    };

    boxTD.appendChild(boxDropdown);


    row.appendChild(itemName);
    row.appendChild(deleteTD);
    row.appendChild(boxTD);

    return row;
}

async function updateBox(itemURL, boxURL) {
    if (boxURL === "") {
        deleteItem(itemURL); //only deletes the link to the box
    } else {

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
            console.error('error box update:', error); // this error is happening because we are not expecting a json response from the put call. I am not sure if we should expect any response.
        });
    }
    console.log("bye from updateBox");
}

async function deleteItem(itemURL) {
    var status = false;
    await fetch(itemURL, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('delete successfull:', data);
        status = true;
    })
    .catch(error => {
        console.error('error deleting:', error);
    });

    return status;
}

async function getBoxes() {
    try {
        var hasNextLink = false;
        var url = host + boxUrl;
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
}

/**
 * Takes the item's box url and gets the actual url of the box.
 * @param itemBoxURL URL of the item/box ex. items/5/box
 * @return Actual URL of the box ex. box/1
 */
async function fetchBoxId(itemBoxURL) {
    var retURL;

    await fetch(itemBoxURL)
    .then(response => response.json())
    .then(data => {
        console.log('fetch successfull:', data);
        retURL = data._links.self.href;
    })
    .catch(error => {
        console.info("This item doesn't have a box. Should be ok:", error);
    });

    return retURL;
}

async function createItem(form) {
    var name = form.new_items_input.value;

    if (name === "") {
        console.debug("found the blank");
        return;
    }

    const status = await postItem(name);

    if (status) {
        // add the new item from the array to the table
        var table = document.getElementById('my_table');
        var row = await createTableRow(items.length - 1);

        table.appendChild(row);

        form.new_items_input.value = "";
    }

}

async function postItem(name) {
    var status = false;
    var url = host + itemUrl;
    
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
            status = true;

            var j = items.length;
            items[j] = [];
            items[j][dataIndex] = data.name;
            items[j][idIndex] = data._links.self.href;
            items[j][boxIndex] = data._links.box.href;
        })
        .catch(error => {
            console.error('error item POST:', error);
        });

        return status;
}

async function refreshItemsTable(itemUrl) {
    var page_div = document.getElementById('page_div');
    page_div.innerHTML = "";

    var myDiv = document.getElementById("items_table_div");
    var table = document.querySelector("table");
    myDiv.removeChild(table);

    items = [];
    boxes = [];

    createItemsTable(itemUrl, host + boxUrl);
}

async function updateItemName(input) {
    var name = input.value;
    var itemUrl = input.getAttribute('url');

    await patchItemName(name, itemUrl);
}

async function patchItemName(itemName, url) {

    await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: itemName
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Item Name PATCH successfull:', data);
        })
        .catch(error => {
            console.error('error item name PATCH:', error);
        });

}

/**
 * after the html window loads the enter key can be used to save an item instead of clicking the save button
 * there is a listener for the enter key that prevents the page from making a submision and calls the create item function
 */
async function newItemsSaveOnEnter() {
    var myForm = document.getElementById("new_items_form");

    myForm.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            createItem(myForm);
        }
    });
}

/**
 * Creates a list of the page numbers that are clickable.
 */
async function createPagination() {
    console.log('hello from pagination!');

    // these are true if pages exist beyond the first and last displayed page number
    var morePreviousPagesExist = false;
    var moreNextPagesExist = false;

    // determine 1st and last displayed page numbers
    var firstPageNumber;
    if (pageIndex - 4 < 0 ) {
        firstPageNumber = 1;
    } else {
        firstPageNumber = pageIndex - 4;
        morePreviousPagesExist = true;
    }

    var lastPageNumber;
    if (pageIndex + 5 > pageTotal) {
        lastPageNumber = pageTotal;
    } else {
        lastPageNumber = pageIndex + 5;
        moreNextPagesExist = true;
    }

    // create list of numbers, loop through pageTotal
    // when pageIndex matches the i+1 of the loop then you make that number unclickable because that is the current page

    var page_div = document.getElementById('page_div');
    for (var i = firstPageNumber; i < lastPageNumber + 1; i++) {
        var pageLink;

        if (pageIndex + 1 === i) {
            pageLink = document.createElement("p");
            pageLink.innerHTML = i;
        } else {
            // set the page=N to i - 1 given next
            var link = currentPageLink;
            var newPageNumber = i - 1;
            var replacement = "page=" + newPageNumber;
            link = link.replace(/page=[0-9]*/, replacement);

            pageLink = document.createElement("input");
            pageLink.value = i;
            pageLink.type = "button"
            pageLink.className = "page_button";
            pageLink.setAttribute('url', link);
            pageLink.onclick = function() {
                pageLinkButton(this);
            }
        }

        page_div.appendChild(pageLink);
    }
}

async function pageLinkButton(button) {
    var itemUrl = button.getAttribute('url');
    await refreshItemsTable(itemUrl);

    var page_div = document.getElementById('page_div');
    page_div.innerHTML = "";
}

async function changeRecordsPerPage() {
    var recordsPerDiv = document.getElementById('records_per_page_div');
    var recordOptions = [10, 20, 50];
    var numberPerPageDropdown = document.createElement("select");

    for (var i = 0; i < recordOptions.length; i++) {
        var pageOption = document.createElement("option");
        pageOption.value = recordOptions[i];
        pageOption.textContent = recordOptions[i];

        if (recordOptions[i] === recordsPerPage) {
            pageOption.selected = true;
        } else {
            ;
        }

        numberPerPageDropdown.appendChild(pageOption);
    }

    numberPerPageDropdown.onchange = function() {
        updateRecordsPerPage(this);
    }

    recordsPerDiv.appendChild(numberPerPageDropdown);
}

/**
 * Update the records per page based on the dropdown and refresh the table.
 */
async function updateRecordsPerPage(dropdown) {
    recordsPerPage = dropdown.value;

    var link = currentPageLink;
    var newSizeNumber = recordsPerPage;
    var replacement = "size=" + newSizeNumber;
    link = link.replace(/size=[0-9]*/, replacement);

    var pageReplacement = "page=" + 0;
    link = link.replace(/page=[0-9]*/, replacement);

    var page_div = document.getElementById('page_div');
    page_div.innerHTML = "";
    await refreshItemsTable(link);
}

/**
 * Runs all functions that require the HTML page to be loaded before running.
 */
async function onWindowLoad() {
    window.onload = function () {
        newItemsSaveOnEnter();
        changeRecordsPerPage();
        searchOnEnter();
    }
}

async function searchOnEnter() {
    var myForm = document.getElementById("search_form");

    myForm.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            searchItems(myForm);
        }
    });
}

/**
 * Calculate the item api call based on the search term. Then refresh the table. Refreshing the table with the new search url will run the search.
 */
async function searchItems(searchForm) {
    // if the reset button was hit then reset the url and refresh
    if (searchForm === "RESET" || searchForm.search_input.value === "") {
        refreshItemsTable(host + itemUrl);
    } else {
        // calculate the new api
        //example url: http://localhost:8080/item/search/findByName?name=try
        var newUrl = host + itemUrl + '/search/findByName?name=' + searchForm.search_input.value;

        refreshItemsTable(newUrl);
    }
}
