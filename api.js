/**
 * Created by helion on 19/03/16.
 */
'use strict';
const request = require('request');
const constants = require('./constants');

class Api {

	constructor() {
		this.base = constants.API;
	}

	static post(path, data) {
		return new Promise((resolve, reject)=> {
			request({
				method: 'POST',
				uri: `${base}${path}`,
				json: true,
				body: data
			}, (error, response, body)=> {
				if (error) {
					reject(error);
				} else {
					resolve(body);
				}
			});
		});
	}

	static get(path) {
		return new Promise((resolve, reject)=> {
			request({
				method: 'GET',
				uri: `${base}${path}`,
				json: true
			}, (error, response, body)=> {
				if (error) {
					reject(error);
				} else {
					resolve(body);
				}
			});
		});
	}

	userConnected() {
		return Api.post('user-connected');
	}

	userDisconnected() {
		return Api.post('user-disconnected');
	}

	userSwitchedChannel(channel) {
		return Api.get(`user-switched-channel/${channel}`);
	}
}

module.exports = new Api();