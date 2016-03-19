/**
 * Created by helion on 19/03/16.
 */
'use strict';
const constants = require('./constants');

module.exports = (io)=> {
	io.on('connection', (socket)=> {
		console.log('user connected');

		socket.on('disconnect', ()=> {
			console.log('user disconnected');
		});

		socket.on('switch-channel', (channel)=> {
			console.log(`user switched the channel to ${channel}`);
		});
	});
};