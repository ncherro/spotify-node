var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    spotify = require('node-spotify')({
      settingsFolder: 'settings',
      cacheFolder: 'cache',
      appkeyFile: __dirname + '/config/spotify_appkey.key'
    }),
    spotify_events = {
      // Playlists
      playlist_renamed: 'playlist_renamed',
      playlist_tracks_added: 'playlist_tracks_added',

      // Player
      player_end_of_track: 'player_end_of_track'
    },

    bbox = {
      sockets: 0,
      tracklist: [],
      current_track: 0,

      // functions
      playNext: function() {
        if ((bbox.current_track + 1) > bbox.tracklist.length) {
          // do nothing
          console.log("End of tracklist");
          bbox.state = 'stopped';
        } else {
          console.log("Playing track " + bbox.current_track);
          bbox.current_track += 1;
          spotify.player.play(bbox.tracklist[bbox.current_track]);
          bbox.state = 'playing';
        }
      }
    };


// listen at localhost:3000
server.listen(3000);

// serve static files
app.use('/', express.static(__dirname + '/public'));

// serve index.html at /
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});



// spotify ready event handler
spotify.ready(function() {
  var search = new spotify.Search('smashing pumpkins');

  search.execute(function(err, results) {
    if (err) {
      // something went wrong
    } else {
      bbox.tracklist = bbox.tracklist.concat(results.tracks);
      console.log("There are " + bbox.tracklist.length + " tracks in our tracklist");
      if (bbox.state != 'playing') {
        bbox.playNext();
      }
    }
  });
});

// spotify event listeners
spotify.player.on(spotify_events.player_end_of_track, function(err, player) {
  console.log("End of track");
  bbox.playNext();
});

// log into spotify
spotify.login(
  process.env.SPOTIFY_USERNAME,
  process.env.SPOTIFY_PASSWORD,
  false,
  false
);



// initialize websockets
io.sockets.on('connection', function (socket) {
  bbox.sockets += 1;
  console.log("There are " + bbox.sockets + " sockets");

  // broadcasters
  socket.emit;

  // broadast user count to ALL sockets
  io.sockets.emit('users_count', bbox.sockets);

  // ui listeners
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('play', function(a, b, c) {
    console.log(a, b, c);
    spotify.player.play();
  });

  socket.on('pause', function(a, b, c) {
    console.log(a, b, c);
    spotify.player.pause();
  });

  socket.on('disconnect', function () {
    bbox.sockets -= 1;
    // broadast to EVERY OTHER socket
    socket.broadcast.emit('users_count', bbox.sockets);
  });

});
