
/////////////////////////////////////////////

var entities = [], count = 0;
var io = require("socket.io").listen(19387);

var INITIAL_X = 5;
var INITIAL_Y = 5;
var INITIAL_VEL_X = 0;
var INITIAL_VEL_Y = 0;
var master = 0;

io.set('log level', 1);
io.sockets.on("connection", function (socket) {
    var myNumber = count++;
	
    //assign number    
    var mySelf = entities[myNumber] = [myNumber, INITIAL_X, INITIAL_Y, INITIAL_VEL_X, INITIAL_VEL_Y];
	//declare first client as master layout
	if(myNumber == 0) {
		master = socket.id
		console.log('master id: ' + master);
		socket.send('MASTER');
	
	}
    //Send the initial position and ID to connecting player
	
	console.log(myNumber + ' sent: ' + 'I,' + mySelf[0] + ',' + mySelf[1] + ',' + mySelf[2]);
    
	socket.send('I,' + mySelf[0] + ',' + mySelf[1] + ',' + mySelf[2]);
	
    //Send to conencting client the current state of all the other players
    /*for (var entity_idx = 0; entity_idx < entities.length; entity_idx++) { //send initial update  
        if (entity_idx != myNumber) {
            entity = entities[entity_idx];
            if (typeof (entity) != "undefined" && entity != null) {

                console.log(myNumber + ' sent: C for ' + entity_idx);
                socket.send('C,' + entity[0] + ',' + entity[1] + ',' + entity[2]); //send the client that just connected the position of all the other clients 
            }
        }
    }*/
    //create new entity in master
	console.log('to master, create!')
    io.sockets.socket(master).emit("message",
		'C,' + mySelf[0] + ',' + mySelf[1] + ',' + mySelf[2]);
    socket.on("message", function (data) {
        
        //if (myNumber == 0)
        //    console.log(myNumber + ' sent: ' +data);
        var new_data = data.split(',');
        if (new_data[0] == 'UM') {
            mySelf[1] = new_data[1];
            mySelf[2] = new_data[2];
            mySelf[3] = new_data[3];
            mySelf[4] = new_data[4];
            //Update all the other clients about my update
             io.sockets.socket(master).emit("message",
			'UM,' + mySelf[0] + ',' + mySelf[1] + ',' + mySelf[2] + ',' + mySelf[3] + ',' + mySelf[4]);
        }
        else if (new_data[0] == 'S') { // a s message
			
			var shoot_info = [];
            shoot_info[0] = new_data[1]; //ini x
            shoot_info[1] = new_data[2]; //ini y

            shoot_info[2] = new_data[3]; //degrees

            //Update master about my update
            io.sockets.socket(master).emit("message",
			'S,' + mySelf[0] + ',' + shoot_info[0] + ',' + shoot_info[1] + ',' + shoot_info[2]);
        }
		else if (new_data[0] == 'H') { // a health message
			console.log('Health:' + new_data[1] + ',' + new_data[2]);
            //Update clients about new health
            socket.broadcast.emit("message", 'H' + ',' + new_data[1] + ',' + new_data[2]);
        }
		else if (new_data[0] == 'NAME') { // a name message
			console.log('New Player: ' + new_data[1]+ ',' + new_data[2]);
            //Update master abut name
            io.sockets.socket(master).emit("message", 'NAME' + ',' + new_data[1]+ ',' + new_data[2]);
        }
    });

});

