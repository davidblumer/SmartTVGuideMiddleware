/**
 * Created by helion on 19/03/16.
 */
'use strict';
const _ = require('lodash');

const constants = require('./constants'),
	api = require('./api');

let pairedDevices = new Array(); // devices that are bound. tv <> smartphone
let unboundDevices = new Array(); // random unbound devices. tv | smartphone | smartphone | .... | tv

class Device {
	constructor(socket) {
		this.type = socket.type;
		this.udid = socket.udid;
		this.socket = socket;
	}
}

class Pair {
	constructor(tv, smartphone) {
		this.tv = tv;
		this.smartphone = smartphone;
	}
}

module.exports = (io)=> {
	// Connection middleware. Socket connects then save the type and udid in the socket object.
	io.use((socket, next)=> {
		const data = socket.request;
		socket.type = data._query['type'];
		socket.udid = data._query['udid'];
		console.log(`new device ${socket.type} ${socket.udid}`);
		next();
	});

	// Device connected, bind listeners and events.
	io.on('connection', (socket)=> {
		socket.emit('connected');
		// send connection event to backend. not really useful right now but who cares :D
		api.userConnected();

		// append the new device to the unbound list for later.
		let thisDevice = new Device(socket);
		unboundDevices.push(thisDevice);

		// socket disconnects, remove it from the lists.
		socket.on('disconnect', ()=> {
			_.remove(unboundDevices, (device)=> {
				return device.udid === socket.udid;
			});

			// send disconnect event to backend. not really useful right now but who cares :D
			api.userDisconnected();
		});

		// just the tv events like switching the channel or requesting a qr code
		if (socket.type === constants.TV) {

			// tv switched the channel. send event to backend to get meta data for the channel.
			socket.on('switch_channel', (channel)=> {

				// send channel switch to backend
				api.userSwitchedChannel(channel)
					.then((response)=> {
						// on success send the meta data back to the tv and smartphone
					})
					.catch((error)=> {
						// on error send the error message to the tv and smartphone
					});
			});

			// tv is requesting a code. for now just send the udid that gets sent on connection
			socket.on('request_code', ()=> {
				console.log(`user wants a code`);
				socket.emit('receive_code', {code: socket.udid});
			});
		} else if (socket.type === constants.PHONE) {
			socket.on('selection_down', ()=> {
			});
			socket.on('selection_up', ()=> {
			});
			socket.on('selection_click', ()=> {
			});
			socket.on('selection_remove', ()=> {
			});
			socket.on('send_code', (code)=> {
				console.log('send_code', code);
				let foundTv = _.find(unboundDevices, (device)=> {
					return device.udid === code;
				});
				if (foundTv) {
					console.log('found_tv', code);
					pairedDevices.push(new Pair(foundTv, thisDevice));
					_.remove(unboundDevices, (device)=> {
						return device.udid === code;
					});
					foundTv.socket.emit('receive_code', code);
					socket.emit('tv_found');
				} else {
					console.log('tv_not_found');
				}
			});
		}
	});
};