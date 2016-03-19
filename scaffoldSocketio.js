/**
 * Created by helion on 19/03/16.
 */
'use strict';
const _ = require('lodash');

const constants = require('./constants'),
	api = require('./api');

let boundDevices = new Map(); // devices that are bound. tv <> smartphone
let unboundDevices = new Array(); // random unbound devices. tv | smartphone | smartphone | .... | tv

class Device {
	constructor(socket) {
		this.qrCode = '';
		this.type = socket.type;
		this.socket = socket;
	}
}

module.exports = (io)=> {
	io.use((socket, next)=> {
		const data = socket.request;
		socket.type = data._query['type'];
		next();
	});

	io.on('connection', (socket)=> {
		console.log('user connected');
		api.userConnected();

		unboundDevices.push(new Device(socket));

		socket.on('disconnect', ()=> {
			console.log('user disconnected');
			api.userDisconnected();
		});

		socket.on('switch_channel', (channel)=> {
			console.log(`user switched the channel to ${channel}`);
			api.userSwitchedChannel();
		});

		socket.on('request_code', ()=> {
			console.log(`user wants a code`);
			socket.emit('receive_code', Math.random());
		});
	});
};