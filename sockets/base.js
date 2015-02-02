var redis = require('redis');
var Room = require( '../models/room' );
var User = require( '../models/user' );

var rooms = {}; 
var redisClient = redis.createClient(); // can specify ( post, host )

redisClient.on( 'connect', function() {
  console.log( "redis db connected" );
});

exports.start = function(io) {
  
  io.on( 'connection', function( socket ) { 
    var userId = null;

    socket.on( 'enter', function( data ) {
      var roomId = data.room;
      userId = data.user;

      // check that users joins a room (and doesnt make one up)
      redisClient.zrank([ 'rooms', roomId ], function( err, reply ) {
        if( err ) throw err;

        // if room exists, reply will be an integer between [0, infinity]
        if( !isInteger( reply ) ) {
          console.log( "ERROR: room id is not available on redis" );
          throw err;
        }
 
        socket.join( roomId );

        // add user to room in mongodb
        updateRoomEntry( roomId, userId );
        // add user to room in redis
        redisClient.zadd([ roomId, Date.now(), userId ], function(){} );

        io.to( roomId ).emit( 'user joined', userId );
        // TODO: emit list of users in room to current socket client
        // io.to( roomId ).emit( 'user list', user._id ); 
      });
    });

    socket.on( 'leave', function( data ) {
      var roomId = data.room;

      socket.leave( roomId );

      // remove user from room in redis
      redisClient.zrem([ roomId, userId ], function( err, reply ) {
        io.to( roomId ).emit( 'user left', userId );
      });

    });
    
  });
}

exports.addRoom = function( roomId ) {
  var score = Date.now();
  redisClient.zadd([ 'rooms', score, roomId ]);
};

function updateRoomEntry( roomId, userId ) {
  Room.findById( roomId, function( err, room ) {
    if( err ) throw err;
    if( !room ) throw err;
    room.users.push( { user: userId, date: Date.now() } );
    room.save( function( err ){
      if( err ) throw err;
    });
  });
};

function isInteger( data ) {
  if( typeof data==='number' && (data%1)===0 )
    return true;
  else
    return false;
};

