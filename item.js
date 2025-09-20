getRoom();

getAllRooms();

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

