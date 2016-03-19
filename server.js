const constants = require('./constants');

var app = require('express')();
var http = require('http').Server(app);

app.get('/', (req, res)=> {
	res.json({version: constants.VERSION, description: constants.DESCRIPTION});
});

http.listen(constants.PORT, ()=> {
	console.log(`listening on *:${constants.PORT}`);
});