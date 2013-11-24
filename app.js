/*
var express = require('express');
var app = express();

app.get('/hello.txt', function(req, res){
  res.send('Hello World');
});

app.listen(3000);
console.log('Listening on port 3000');
*/


var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);


server.listen(3000);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
