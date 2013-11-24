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
    },
    playTrack: function(e) {
      e.preventDefault();
      socket.emit('playTrack', $(this).attr('rel'));
    }
  };

  var info = {
    $track: null,
    $artist: null,
    $album: null,
    $length: null,
    trackChanged: function(track, current_track) {
      if (typeof track === 'object') {
        info.$track.text(track.name);
        var minutes = Math.floor(track.duration / 60),
            seconds = track.duration - minutes * 60;
        info.$length.text(minutes + ":" + seconds + (seconds < 10 ? '0' : ''));
        info.$album.text(track.album.name);
        var artists = [], i, len;
        for (i=0, len=i < track.artists.length; i < len; i++) {
          artists.push(track.artists[i].name);
        }
        info.$artist.text(artists.join(', '));
        tracklist.currentTrackChanged(current_track);
      } else {
        info.$track.add(info.$artist).add(info.$album).add(info.$length).text('');
      }
    }
  };

  var tracklist = {
    $list: null,
    changed: function(tracks, current_track) {
      var html = '', track;
      for (var i=0, len=tracks.length; i < len; i++) {
        track = tracks[i];
        css_class = i == current_track ? ' class="on"' : '';
        html += '<li rel="' + i + '"' + css_class + '>';
        html += track.name;
        html += '</li>';
      }
      tracklist.$list.html(html);
      tracklist.$list.find('li').click(controls.playTrack);
    },
    currentTrackChanged: function(current_track) {
      tracklist.$list.find('li').removeClass('on').end().
        find('[rel=' + current_track + ']').addClass('on');
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

    tracklist.$list = $('#tracklist');


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
        case 'stopped':
          controls.$playpause.text('Play');
          break;
      }
    });

    socket.on('track_changed', info.trackChanged);

    socket.on('tracklist_changed', tracklist.changed);
  }


  $(init);

}(io));
