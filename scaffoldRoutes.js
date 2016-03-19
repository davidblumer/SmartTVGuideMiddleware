/**
 * Created by helion on 19/03/16.
 */
'use strict';
const constants = require('./constants');

module.exports = (app)=> {
	app.get('/', (req, res)=> {
		res.json({version: constants.VERSION, description: constants.DESCRIPTION});
	});
};