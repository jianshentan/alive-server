var redis = require('redis');
var Room = require( '../models/room' );
var User = require( '../models/user' );

var rooms = {}; 
var redisClient = redis.createClient(); // can specify ( post, host )

/* ===========================================================

REDIS client structure

(unique) 'rooms': SORTED SET <room_id>, represents all rooms
'room:'<room_id>: SORTED SET <user_id>, represents all users in the room
(unique) 'users': SORTED SET <user_id>, represents all connected users
'user:'<user_id>: STRING of stringified user data

=========================================================== */

redisClient.on( 'connect', function() {
  console.log( "redis db connected" );
});

exports.start = function(io) {
  
  io.on( 'connection', function( socket ) { 
    var userId = null;

    socket.on( 'enter', function( data ) {
      userId = data.user; 

      // add data to redis client 'users' key
      redisClient.zadd([ 'users', Date.now(), userId ], 
        function( err, reply ) {
          if( err ) throw err; 
        });

      // add user data to redis clients 'user:<id>' key via mongo
      User.findById( userId, function( err, user ) {
        if( err ) throw err;
        if( !user ) {
          console.log( "ERROR: invalid user opened a socket" );
          return;
        }
        redisClient.set([ 'user:'+userId, JSON.stringify( user ) ],
          function( err, reply ) {
            if( err ) throw err; 
          });
      });
    });

    socket.on( 'disconnect', function() {
      // remove user in redis client from 'users' key
      redisClient.zrem([ 'users', userId ], 
        function( err, reply ) {
          if( err ) throw err;
        });

      // remove user key:value pair from redis client
      redisClient.del([ 'user:' +userId ], 
        function( err, reply ) {
          if( err ) throw err; 
        });
    });

    socket.on( 'join', function( data ) {
      var roomId = data.room;

      // check that users joins a room (and doesnt make one up)
      redisClient.zrank([ 'rooms', roomId ], function( err, reply ) {
        if( err ) throw err;

        // if roomId is valid/exists, reply will be an integer between [0, infinity]
        if( !isInteger( reply ) ) {
          io.to( socket.id ).emit( 'error', { message: 'roomId was not valid' } );
          return;
        }
 
        socket.join( roomId );

        // MONGO UPDATE: add user to room in mongodb
        updateRoomEntry( roomId, userId );
        // add user_id to 'room:<room_id>' in redis client
        redisClient.zadd([ "room:"+roomId, Date.now(), userId ], 
          function( err, reply ){
            if( err ) throw err;
            
            io.to( roomId ).emit( 'user joined', userId );
            io.to( socket.id ).emit( 'user list', user._id );
          });
 
      });
    });

    socket.on( 'leave', function( data ) {
      var roomId = data.room;

      socket.leave( roomId );

      // remove user from room in redis
      redisClient.zrem([ "room:"+roomId, userId ], 
        function( err, reply ) {
          if( err ) throw err;
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

