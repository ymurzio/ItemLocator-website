//getRoom();

//getAllRooms();

statusChecker();

getAllEverything();

async function getRoom() {
    var url = 'http://localhost:8080/room/2';
    console.log(url);
    try {
        const roomA = await fetch (url);
        console.log(roomA);
        const mydata = await roomA.json();
        console.log(mydata);
        console.log(mydata.roomName);
        console.log(mydata._links.room.href);
        console.log(document.getElementById("abc"));
        var para = document.getElementById("abc")
        para.textContent = mydata.roomName;
    } catch(error) {
        console.log('Error fetching data:', error);
    }
}

// get all rooms and display them in a table
async function getAllRooms() {
    console.log('Starting all rooms in a table');

    // get all the room names. loop over all pages
    var roomNames = [];
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/room';
        var j = 0;
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.room.length);
            for (var i = 0; i < myJson._embedded.room.length; i++) {
                roomNames[j] = myJson._embedded.room[i].roomName;
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
    console.log('full arrary', roomNames.length);

    // create header
    var myDiv = document.getElementById("tablediv");

    var table = document.createElement("table");

    var header = document.createElement("tr");
    var roomName = document.createElement("th");
    roomName.appendChild(document.createTextNode("Room"));
    header.appendChild(roomName);
    table.appendChild(header);
    
    // create rows
    for (var i = 0; i < roomNames.length; i++) {
        var row = document.createElement("tr");
        var rowName = document.createElement("td");
        rowName.appendChild(document.createTextNode(roomNames[i]));
        row.appendChild(rowName);
        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);


}

// get all locations and rooms and display them in a table
async function getAllEverything() {
    console.log('Starting all items in a table');

    const itemIndex = 0;
    const boxIndex = 1;
    const locationIndex = 2;
    const roomIndex = 3;

    // get all the item names. loop over all pages
    var itemsAll = [];
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8309/item';
        var j = 0;// we need j to be different than i because i is local to a page
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.item.length);
            for (var i = 0; i < myJson._embedded.item.length; i++) {
                itemsAll[j] = [];

                itemsAll[j][itemIndex] = myJson._embedded.item[i].name;

                var boxLink = myJson._embedded.item[i]._links.box.href;
                try {
                    const boxResponse = await fetch(boxLink);
                    const boxJson = await boxResponse.json();
                    itemsAll[j][boxIndex] = boxJson.name;

                    var locationLink = boxJson._links.location.href;
                    const locationResponse = await fetch(locationLink);
                    const locationJson = await locationResponse.json();
                    itemsAll[j][locationIndex] = locationJson.nearTo;

                    const roomLink = locationJson._links.room.href;
                    const roomResponse = await fetch(roomLink);
                    const roomJson = await roomResponse.json();
                    itemsAll[j][roomIndex] = roomJson.roomName;

                } catch(error) {
                    console.log('box or location or room not found. bad fetch:', error);
                }

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
    console.log('full arrary', itemsAll.length);
/*
     try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/box';
        var j = 0;// we need j to be different than i because i is local to a page
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.box.length);
            for (var i = 0; i < myJson._embedded.box.length; i++) {
                itemsAll[j][1] = myJson._embedded.box[i].name;
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
    

    console.log('Starting all rooms in a table');

    // get all the room names. loop over all pages
    var roomNames = [];
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/room';
        var j = 0;
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.room.length);
            for (var i = 0; i < myJson._embedded.room.length; i++) {
                roomNames[j] = myJson._embedded.room[i].roomName;
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
    console.log('full arrary', roomNames.length);
    
    console.log('Starting locations array');

    // get all the location names. loop over all pages
    var locations = [];
    try {
        var hasNextLink = false;
        var url = 'http://localhost:8080/location';
        var j = 0;
        do {
            const response = await fetch(url);
            const myJson = await response.json();
            console.log(myJson);
            console.log(myJson._embedded.location.length);
            for (var i = 0; i < myJson._embedded.location.length; i++) {
                locations[j] = myJson._embedded.location[i].nearTo;
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
    console.log('full arrary', locations.length);

*/
    // create header
    var myDiv = document.getElementById("tablediv");

    var table = document.createElement("table");

    var header = document.createElement("tr");
    var itemHeader = document.createElement("th");
    itemHeader.appendChild(document.createTextNode("Item"));
    var boxHeader = document.createElement("th");
    boxHeader.appendChild(document.createTextNode("Box"));
    var locationHeader = document.createElement("th");
    locationHeader.appendChild(document.createTextNode("Location"));
     
    var roomHeader = document.createElement("th");
    roomHeader.appendChild(document.createTextNode("Room"));

    header.appendChild(itemHeader);
    header.appendChild(boxHeader);
    header.appendChild(locationHeader);
    header.appendChild(roomHeader);
    table.appendChild(header);
    
    // create rows
    for (var i = 0; i < itemsAll.length; i++) {
        var row = document.createElement("tr");

        var itemName = document.createElement("td");
        itemName.appendChild(document.createTextNode(itemsAll[i][itemIndex]));
        row.appendChild(itemName);

        var boxName = document.createElement("td");
        boxName.appendChild(document.createTextNode(itemsAll[i][boxIndex]));
        row.appendChild(boxName);

        var locationName = document.createElement("td");
        locationName.appendChild(document.createTextNode(itemsAll[i][locationIndex]));
        row.appendChild(locationName);

        var roomName = document.createElement("td");
        roomName.appendChild(document.createTextNode(itemsAll[i][roomIndex]));
        row.appendChild(roomName);

        table.appendChild(row);
    }

    // append the header and rows
    myDiv.appendChild(table);

}

async function statusChecker() {
    try {
        var url = 'http://localhost:8309/item';
        const response = await fetch(url);
    } catch(error) {
        console.log('no good. bad fetch:', error);
        var statusText = document.getElementById('service-status');
        statusText.appendChild(document.createTextNode("Service is off!"));
    }
}
