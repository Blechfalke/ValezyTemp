var express = require('express');
var http = require('http');
var multer = require('multer');
var app = express();
var rooms = [];						//array to populate with created rooms

app.configure(function(){
	app.set('port', 8080);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
	app.use(multer({ dest: './uploads/'}));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./app/server/router')(app, rooms);

var server = http.createServer(app);

//include socket.io modlue and listen to server
var io = require('socket.io').listen(server);

//include socket.js
require('./app/server/socket/socket.js')(io, rooms);

server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
})
