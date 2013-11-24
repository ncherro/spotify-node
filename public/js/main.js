(function(io, undefined) {

  var socket = io.connect('http://localhost:3000'); // connect to our node.js app

  // event handlers
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

  socket.on('users_count', function(count) {
    $('.title').text('There are ' + count + ' users');
  });

}(io));
