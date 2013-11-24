var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    spotify = require('node-spotify')({
      appkeyFile: __dirname + '/config/spotify_appkey.key'
    });


server.listen(3000);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});



spotify.ready( function() {
  var playlists = spotify.getPlaylists();
  console.log(playlists.length);
  console.log(playlists[0].getTracks());
  //spotify.player.play('spotify:track:5421318643512hd45');
});
spotify.login(
  process.env.SPOTIFY_USERNAME,
  process.env.SPOTIFY_PASSWORD,
  false,
  false
);




io.sockets.on('connection', function (socket) {
  socket.emit
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
