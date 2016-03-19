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
// # Helper
// ########################################################################################################################
const scaffoldRoutes = require('./scaffoldRoutes'),
	scaffoldSocketio = require('./scaffoldSocketio');

// ########################################################################################################################
// # HTTP Routes
// ########################################################################################################################
scaffoldRoutes(app);

// ########################################################################################################################
// # Socket.io
// ########################################################################################################################
scaffoldSocketio(io);

// ########################################################################################################################
// # Fire up server
// ########################################################################################################################
server.listen(constants.PORT, ()=> {
	console.log(`listening on *:${constants.PORT}`);
});