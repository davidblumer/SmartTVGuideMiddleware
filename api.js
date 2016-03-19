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

	post(path, data) {
		console.log(`[POST]${this.base}${path}`);
		return new Promise((resolve, reject)=> {
			request({
				method: 'POST',
				uri: `${this.base}${path}`,
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

	get(path) {
		console.log(`[GET]${this.base}${path}`);
		return new Promise((resolve, reject)=> {
			request({
				method: 'GET',
				uri: `${this.base}${path}`,
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
		return this.post('user-connected');
	}

	userDisconnected() {
		return this.post('user-disconnected');
	}

	userSwitchedChannel(channel) {
		return this.get(`user-switched-channel/${channel}`);
	}
}

module.exports = new Api();