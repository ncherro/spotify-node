(function(io, undefined) {

  var socket = null;


  var controls = {
    $playpause: null,
    $next: null,
    $prev: null,
    playPause: function(e) {
      e.preventDefault();
      socket.emit('playpause');
    },
    prev: function(e) {
      e.preventDefault();
      socket.emit('prev');
    },
    next: function(e) {
      e.preventDefault();
      socket.emit('next');
    }
  };

  var info = {
    $track: null,
    $artist: null,
    $album: null,
    $length: null,
    trackChanged: function(track) {
      if (typeof track === 'object') {
        info.$track.text(track.name);
        info.$length.text(track.duration);
        info.$album.text(track.album.name);
        var artists = [], i, len;
        for (i=0, len=i < track.artists.length; i < len; i++) {
          artists.push(track.artists[i].name);
        }
        info.$artist.text(artists.join(', '));
      } else {
        info.$track.add(info.$artist).add(info.$album).add(info.$length).text('');
      }
    }
  };

  var tracklist = {
    changed: function(tracklist) {
    }
  };


  function init() {
    // DOM objects
    controls.$playpause = $('#playpause');
    controls.$next = $('#next');
    controls.$prev = $('#prev');

    controls.$playpause.click(controls.playPause)
    controls.$next.click(controls.next)
    controls.$prev.click(controls.prev)


    info.$track = $('#current-track');
    info.$album = $('#current-album');
    info.$artist = $('#current-artist');
    info.$length = $('#current-length');


    // SOCKET
    socket = io.connect('http://localhost:3000'); // connect to our node.js app

    // event handlers
    socket.on('users_count', function(count) {
      $('.title').text('There are ' + count + ' users');
    });

    socket.on('player_state_changed', function(state) {
      switch(state) {
        case 'playing':
          controls.$playpause.text('Pause');
          break;
        case 'paused':
          controls.$playpause.text('Play');
          break;
      }
    });

    socket.on('track_changed', info.trackChanged);

    socket.on('tracklist_changed', tracklist.changed);
  }


  $(init);

}(io));
