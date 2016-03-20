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

		console.log(`new pair tv ${tv.udid} smartphone ${smartphone.udid}`);
	}

	emit(message, data) {
		if (this.tv && this.tv.socket) {
			this.tv.socket.emit(message, data);
		}
		if (this.smartphone && this.smartphone.socket) {
			this.smartphone.socket.emit(message, data);
		}
	}

	disconnect() {
		if (this.tv && this.tv.socket) {
			this.tv.socket.disconnect();
		}
		if (this.smartphone && this.smartphone.socket) {
			this.smartphone.socket.disconnect();
		}
	}
}

const findDeviceById = (id) => {
	return (device)=> {
		return device.udid === id;
	}
};

module.exports = (io)=> {
	// Connection middleware. Socket connects then save the type and udid in the socket object.
	io.use((socket, next)=> {
		const data = socket.request;
		socket.type = data._query['type'];
		socket.udid = data._query['udid'];
		console.log(`> ${socket.type} > ${socket.udid}`);
		next();
	});

	// Device connected, bind listeners and events.
	io.on('connection', (socket)=> {
		socket.on('beard_show', ()=> {
			io.sockets.emit('beard_show')
		});
		socket.on('beard_hide', ()=> {
			io.sockets.emit('beard_hide')
		});
		socket.on('beard_set_position', (data)=> {
			io.sockets.emit('beard_set_position', data)
		});
		socket.on('beard_set_rotation', (data)=> {
			io.sockets.emit('beard_set_rotation', data)
		});
		socket.on('beard_set_zoom', (data)=> {
			io.sockets.emit('beard_set_zoom', data)
		});
		socket.on('beard_set_index', (data)=> {
			io.sockets.emit('beard_set_index', data)
		});
		socket.on('beard_update', (data)=> {
			io.sockets.emit('beard_update', data)
		});
		socket.on('send_message', (data)=> {
			console.log('send_message', data.message);
			io.sockets.emit('receive_message', data)
		});
		socket.on('create_vote', (data)=> {
			console.log('create_vote', data.message);
			io.sockets.emit('create_vote', data)
		});


		const foundUnboundDevice = _.find(unboundDevices, findDeviceById(socket.udid));
		if (!foundUnboundDevice) {
			unboundDevices.push(new Device(socket));
		} else {
			foundUnboundDevice.socket = socket;
		}

		socket.emit('connected');

		// socket disconnects, remove it from the lists.
		socket.on('disconnect', ()=> {
			_.remove(unboundDevices, findDeviceById(socket.udid));
			const foundPair = _.find(pairedDevices, (pair)=> {
				if (socket.type === constants.TV) {
					return pair.tv.udid === socket.udid;
				} else {
					return pair.smartphone.udid === socket.udid;
				}
			});

			if (foundPair) {
				foundPair.emit('pair_disconnected');
				foundPair.disconnect();
				_.remove(unboundDevices, findDeviceById(foundPair.tv.udid));
				_.remove(unboundDevices, findDeviceById(foundPair.smartphone.udid));
				_.remove(pairedDevices, (pair)=> {
					return pair.tv.udid === foundPair.tv.udid && pair.smartphone.udid === foundPair.smartphone.udid;
				});
			}
		});

		// just the tv events like switching the channel or requesting a qr code
		if (socket.type === constants.TV) {

			// tv switched the channel. send event to backend to get meta data for the channel.
			socket.on('switch_channel', (data)=> {

				// send channel switch to backend
				api.userSwitchedChannel(data.channel)
					.then((response)=> {
						// on success send the meta data back to the tv and smartphone
						socket.emit('receive_switch_channel', response);
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

				const foundPair = _.find(pairedDevices, (pair)=> {
					return pair.smartphone.udid === socket.udid;
				});
				if (foundPair) {
					foundPair.tv.socket.emit('selection_down');
					console.log('found_pair');
				} else {
					console.log('pair_not_found');
				}
			});
			socket.on('selection_up', ()=> {
				const foundPair = _.find(pairedDevices, (pair)=> {
					return pair.smartphone.udid === socket.udid;
				});
				if (foundPair) {
					foundPair.tv.socket.emit('selection_up');
					console.log('found_pair');
				} else {
					console.log('pair_not_found');
				}
			});
			socket.on('selection_click', ()=> {
				const foundPair = _.find(pairedDevices, (pair)=> {
					return pair.smartphone.udid === socket.udid;
				});
				if (foundPair) {
					foundPair.tv.socket.emit('selection_click');
					console.log('found_pair');
				} else {
					console.log('pair_not_found');
				}
			});
			socket.on('selection_remove', ()=> {
				const foundPair = _.find(pairedDevices, (pair)=> {
					return pair.smartphone.udid === socket.udid;
				});
				if (foundPair) {
					foundPair.tv.socket.emit('selection_remove');
					console.log('found_pair');
				} else {
					console.log('pair_not_found');
				}
			});
			socket.on('send_code', (code)=> {
				let foundTv = _.find(unboundDevices, findDeviceById(code));
				if (foundTv) {
					console.log(`push tv ${foundTv.udid} and smartphone ${socket.udid}`);
					pairedDevices.push(new Pair(foundTv, new Device(socket)));

					_.remove(unboundDevices, findDeviceById(code));
					_.remove(unboundDevices, findDeviceById(socket.udid));

					foundTv.socket.emit('receive_code', code);
					socket.emit('tv_found');
				}
			});
		}
	});
};

setInterval(()=> {
	console.log('boundDevices', pairedDevices.length);
	console.log('unboundDevices', unboundDevices.length);
}, 2000);