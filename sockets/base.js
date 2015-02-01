/* ========================================================
                         SOCKETS 
======================================================== */
module.exports = function(io) {
  
  /*
  { <roomId>: [<users], ... }
  */
  var rooms = {};

  io.on( 'connection', function( socket ) { 

    console.log( "connection made" );

    socket.on( 'enter', function( package ) {
      var roomId = package.room;
      var userId = package.user;

      //console.log( userId + " joined room " + roomId );
      socket.join( roomId );

      if( !rooms[ roomId ] ) {
        rooms[ roomId ] = [ userId ];
      } else {
        rooms[ roomId ].push( userId );
      }

      io.to( roomId ).emit( 'user joined', userId );
      io.to( roomId ).emit( 'user list', rooms[ roomId ] );
    });

    socket.on( 'leave', function( package ) {
      var roomId = package.room;
      var userId = package.user;

      socket.leave( roomId );
      //console.log( userId + " left " + roomId );

      if( inArray( userId, rooms[ roomId ] ) ) {
        var userIndex = rooms[ roomId ].indexOf( userId );
        rooms[ roomId ].splice( userIndex, 1 ); 
      }

      io.to( roomId ).emit( 'user left', userId );
      io.to( roomId ).emit( 'user list', rooms[ roomId ] );
    });
    
  });

}

function inArray( item, array ) {
  var inArray = false;
  for( var i in array ) {
    if( item == array[i] ) {
      inArray = true;
    }
  }
  return inArray;

};
