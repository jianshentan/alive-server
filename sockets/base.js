var async = require( 'async' );
var redis = require( 'redis' );
var Room = require( '../models/room' );
var User = require( '../models/user' );

var rooms = {}; 
var redisClient = redis.createClient(); // can specify ( post, host )

/* ===========================================================

REDIS client structure

(unique) 'rooms': SORTED SET <room_id>, represents all rooms
'room:'<room_id>: SORTED SET <user_id>, represents all users in the room
'guest_room:'<room_id>: SET <guest_id>, represents all guests in the room
'user:'<user_id>: STRING of stringified user data

No actually functionality (yet):
(unique) 'users': SORTED SET <user_id>, represents all connected users 
(unique) 'guests': SET <guest_id>, represents all connected guests

=========================================================== */

redisClient.on( 'connect', function() {
  console.log( "redis db connected" );
});

exports.start = function(io) {
  
  io.on( 'connection', function( socket ) { 
    var userId = null;
    var guest = false;

    socket.on( 'enter', function( data ) {
      userId = data.user; 

      User.findById( userId, function( err, user ) {
        // if no user found, then it must be a guest
        if( !user || err ) {
          guest = true;

          // add data to redis client 'guest' key
          redisClient.sadd([ 'guests', userId ],
            function( err, reply ) {
              if( err ) throw err;
            });

        } else {
          guest = false;

          // add data to redis client 'users' key
          redisClient.zadd([ 'users', Date.now(), userId ], 
            function( err, reply ) {
              if( err ) throw err; 
            });

          // add user data to redis clients 'user:<id>' key via mongo
          redisClient.set([ 'user:'+userId, JSON.stringify( user ) ],
            function( err, reply ) {
              if( err ) throw err; 
            });

        }
      });
    });

    socket.on( 'disconnect', function() {
      if( guest ) {
        // remove user in redis client from 'guests' key
        redisClient.srem([ 'guests', userId ], 
          function( err, reply ) {
            if( err ) throw err;
          });
      } else {
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
      }
    });

    socket.on( 'join', function( data ) {
      var roomId = data.room;

      // check that users joins a room (and doesnt make one up)
      redisClient.zrank([ 'rooms', roomId ], 
        function( err, reply ) { 
          if( err ) throw err;

          // new ------------------------------------------
          
          if( !isInteger( reply ) ) {
            // fall back to mongo 
            console.log("room not found on redis");
            Room.findById(roomId, function(err, room){
                if( err ) throw err;

                // room has been found
                if( !room ){
                    io.to( socket.id ).emit( 'error', { message: 'invalid roomId' } );
                    return;
                }
                
                // room found on db--add it to redis, add users recorded on db

            });
          } 

          // old ------------------------------------------

          // if roomId exists, reply will be an integer between [0, infinity]
          if( !isInteger( reply ) ) {
            console.log( "Invalid roomId" );
            io.to( socket.id ).emit( 'error', { message: 'invalid roomId' } );
            return;
          }

          // old ------------------------------------------
   
          socket.join( roomId );

          // MONGO UPDATE: add user to room in mongodb
          updateRoomEntry( roomId, userId );
 
          // add user_id to 'room:<room_id>' in redis client
          redisClient.zadd([ "room:"+roomId, Date.now(), userId ], 
            function( err, reply1 ){
              if( err ) throw err;
            });

          // get user data from 'user:<user_id>' key in redis client
          redisClient.get([ "user:"+userId ], 
            function( err, reply1 ) {
              if( err ) throw err;
              io.to( roomId ).emit( 'user joined', JSON.parse( reply1 ) );
            });

          // get list of user to send back to client (including users + guests)
          returnUserList( io, socket, roomId, userId );
          
      });
    });

    socket.on( 'guest join', function( data ) {
      var roomId = data.room;

      // check that users joins a room (and doesnt make one up)
      redisClient.zrank([ 'rooms', roomId ], 
        function( err, reply ) { 
          if( err ) throw err;

          // if roomId exists, reply will be an integer between [0, infinity]
          if( !isInteger( reply ) ) {
            console.log( "Invalid roomId" );
            io.to( socket.id ).emit( 'error', { message: 'invalid roomId' } );
            return;
          }
   
          socket.join( roomId );

          // MONGO UPDATE: add user to room in mongodb
          updateRoomEntry( roomId, userId, true );

          // add user_id to 'guest_room:<room_id>' in redis client
          redisClient.sadd([ "guest_room:"+roomId, userId],
            function( err, reply1 ) {
              if( err ) throw err;
            });

          io.to( roomId ).emit( 'guest joined', userId );

          // get list of user to send back to client (including users + guests)
          returnUserList( io, socket, roomId, userId );
          
      });

    });

    socket.on( 'leave', function( data ) {
      var roomId = data.room;
      socket.leave( roomId );

      // remove user from <room:room_id> in redis
      redisClient.zrem([ "room:"+roomId, userId ], 
        function( err, reply ) {
          if( err ) throw err;
          io.to( roomId ).emit( 'user left', userId );
        });
    });

    socket.on( 'guest leave', function( data ) {
      var roomId = data.room;
      socket.leave( roomId );

      // remove guest_user from <guest_room:room_id> in redis
      redisClient.srem([ "guest_room:"+roomId, userId ],
        function( err, reply ) {
          if( err ) throw err;
          io.to( roomId ).emit( 'guest left', userId ); 
        });
    });
    
  });
}

exports.addRoom = function( roomId ) {
  var score = Date.now();
  redisClient.zadd([ 'rooms', score, roomId ], 
    function( err, reply ) {
      if( err ) throw err;
    });
};

// send user + guest list to client
function returnUserList( io, socket, roomId, userId ) {
  // get users from 'room:<room_id>' key in redis client 
  redisClient.zrangebyscore( "room:"+roomId, '-inf', '+inf', 
    function( err, reply ) {
      if( err ) throw err;
      
      async.map( reply, 
        function( item, cb ){
          if( item != userId ) {
            console.log( item );
            redisClient.get( "user:"+item,
              function( err, reply1 ) {
                if( err ) throw err;
                if( !reply1 ) {
                  cb( "ERROR: no user here" );
                } 
                cb( null, JSON.parse( reply1 ) );
              });
          } else {
            cb( null, {} );
          }
        }, 
        function( err, result ){
          if( err ) {
            console.log( err );
            throw err;
          };

          // get guest users from 'guest_room:<room_id>'
          redisClient.smembers( "guest_room:"+roomId,
            function( err, reply1 ) { 
              if( err ) { console.log( "THROWIN'"); throw err; }

              package = {
                users: result,
                guests: reply1 
              }
              console.log( package );

              io.to( socket.id ).emit( 'user list', package );   
            });
        });
    });
}

function updateRoomEntry( roomId, userId, isGuest ) {
  Room.findById( roomId, function( err, room ) {
    if( err ) throw err;
    if( !room ) throw err;
    if( isGuest ) {
      room.guests.push( { guest: userId, date: Date.now() } );
    } else {
      room.users.push( { user: userId, date: Date.now() } );
    }
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

