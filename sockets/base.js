var Room = require( '../models/room' );
var rooms = {}; 

exports.addRoom = function( roomId ) {
  rooms[ roomId ] = [];
};

exports.start = function(io) {
  
  // TODO: consider redis, ram problems...
  
  Room.find( {}, function( err, data ) {
    if( err ) throw err;
    for( var i in data ) {
      rooms[ data[i]._id ] = [];
    }
  });

  io.on( 'connection', function( socket ) { 
    var userId = null;

    socket.on( 'enter', function( data ) {
      var roomId = data.room;
      userId = data.user;

      // check that users joins a room (and doesnt make one up)
      if( rooms[ roomId ] != null ) {
        socket.join( roomId );

        updateRoom( roomId, userId );

        if( !rooms[ roomId ] ) {
          rooms[ roomId ] = [ userId ];
        } else {
          rooms[ roomId ].push( userId );
        }

        io.to( roomId ).emit( 'user joined', userId );
        io.to( roomId ).emit( 'user list', rooms[ roomId ] );
      }
    });

    socket.on( 'leave', function( data ) {
      var roomId = data.room;
      //var userId = data.user;

      socket.leave( roomId );

      if( inArray( userId, rooms[ roomId ] ) ) {
        var userIndex = rooms[ roomId ].indexOf( userId );
        rooms[ roomId ].splice( userIndex, 1 ); 
      }

      io.to( roomId ).emit( 'user left', userId );
      io.to( roomId ).emit( 'user list', rooms[ roomId ] );
    });
    
  });
}

function updateRoom( roomId, userId ) {
  // update room in db
  Room.findById( roomId, function( err, room ) {
    if( err ) throw err;
    // TODO: check that userId is valid before putting it in db
    room.users.push( { user: userId, date: Date.now() } );
    room.save( function( err ){
      if( err ) throw err;
    });
  });
};

function inArray( item, array ) {
  var inArray = false;
  for( var i in array ) {
    if( item == array[i] ) {
      inArray = true;
    }
  }
  return inArray;
};


