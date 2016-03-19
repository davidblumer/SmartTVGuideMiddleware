const constants = require('./constants');

// ########################################################################################################################
// # Third Party
// ########################################################################################################################
const express = require('express'),
	http = require('http'),
	socketio = require('socket.io');

// ########################################################################################################################
// # Instances
// ########################################################################################################################
const app = express();
const server = http.Server(app);
const io = socketio(server);

// ########################################################################################################################
// # HTTP Routes
// ########################################################################################################################
app.get('/', (req, res)=> {
	res.json({version: constants.VERSION, description: constants.DESCRIPTION});
});

// ########################################################################################################################
// # Socket.io
// ########################################################################################################################
io.on('connection', (socket)=> {
	console.log('user connected');

	socket.on('disconnect', ()=> {
		console.log('user disconnected');
	});
});

// ########################################################################################################################
// # Fire up server
// ########################################################################################################################
server.listen(constants.PORT, ()=> {
	console.log(`listening on *:${constants.PORT}`);
});