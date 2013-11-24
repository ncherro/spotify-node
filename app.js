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
    };


// Our API
var bbox = {
  sockets: 0,
  tracklist: [],
  current_track: 0,
  state: 'paused',

  // functions
  playPause: function() {
    if (bbox.state == 'playing') {
      spotify.player.pause();
      bbox.setState('paused');
    } else {
      spotify.player.resume();
      bbox.setState('playing');
    }
  },

  playNext: function() {
    if ((bbox.current_track + 1) > bbox.tracklist.length) {
      // do nothing
      spotify.player.stop();
      bbox.setState('stopped');
    } else {
      bbox.current_track += 1;
      bbox.playTrack();
    }
  },

  playPrev: function() {
    if ((bbox.current_track - 1) < 0) {
      // do nothing
      spotify.player.stop();
      bbox.setState('stopped');
    } else {
      bbox.current_track -= 1;
      bbox.playTrack();
    }
  },

  playTrack: function(cur) {
    var cur = cur || bbox.current_track;
    spotify.player.play(bbox.tracklist[cur]);
    bbox.setState('playing');
  },

  setState: function(state) {
    bbox.state = state;
    io.sockets.emit('player_state_changed', bbox.state);
    if (state === 'stopped') {
      io.sockets.emit('track_changed', null);
    } else if (bbox.tracklist[bbox.current_track]) {
      io.sockets.emit('track_changed', bbox.tracklist[bbox.current_track]);
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
      if (bbox.state != 'playing') {
        bbox.playNext();
      }
    }
  });
});

// spotify event listeners
spotify.player.on(spotify_events.player_end_of_track, function(err, player) {
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
  // add to the users count
  bbox.sockets += 1;

  // initialize
  socket.emit;

  // broadast user count to ALL sockets
  io.sockets.emit('users_count', bbox.sockets);

  // set current play state on this socket
  socket.emit('player_state_changed', bbox.state);
  // set current track info on this socket
  if (bbox.state !== 'stopped' && bbox.tracklist[bbox.current_track]) {
    socket.emit('track_changed', bbox.tracklist[bbox.current_track]);
  }


  // ui listeners
  socket.on('playpause', bbox.playPause);

  socket.on('next', bbox.playNext);

  socket.on('prev', bbox.playPrev);

  socket.on('playTrack', function(i) {
    console.log("Play track " + i);
  });



  socket.on('disconnect', function () {
    bbox.sockets -= 1;
    // broadast to EVERY OTHER socket
    socket.broadcast.emit('users_count', bbox.sockets);
  });

});
