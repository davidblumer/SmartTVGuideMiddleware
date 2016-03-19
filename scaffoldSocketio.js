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
		this.uuid = socket.uuid;
		this.socket = socket;
	}
}

module.exports = (io)=> {
	io.use((socket, next)=> {
		const data = socket.request;
		socket.type = data._query['type'];
		socket.udid = data._query['udid'];

		console.log(`new device ${socket.type} ${socket.udid}`);
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
			api.userSwitchedChannel(channel)
				.then((response)=> {

				})
				.catch((error)=> {
					
				});
		});

		socket.on('request_code', ()=> {
			console.log(`user wants a code`);
			socket.emit('receive_code', {code: socket.uuid});
		});
	});
};