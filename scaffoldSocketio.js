/**
 * Created by helion on 19/03/16.
 */
'use strict';
const constants = require('./constants'),
	api = require('./api');

module.exports = (io)=> {
	io.on('connection', (socket)=> {
		console.log('user connected');
		api.userConnected();

		socket.on('disconnect', ()=> {
			console.log('user disconnected');
			api.userDisconnected();
		});

		socket.on('switch-channel', (channel)=> {
			console.log(`user switched the channel to ${channel}`);
			api.userSwitchedChannel();
		});
	});
};