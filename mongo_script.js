var mongoose = require( 'mongoose' );
var User = require( './models/user' );
var Room = require( './models/room' );
var jwt = require( 'jwt-simple' );
var secret = require( './config/secret' ).app_secret;
var bcrypt = require( 'bcrypt-nodejs' );
var Socket = require( 'sockets/base' );

mongoose.connect( 'mongodb://localhost/alive' );
var db = mongoose.connection;

db.once( 'open', function callback() {
  console.log( "running mongo development script" );
  
  // clear db
  var clearDb = true;
  if( clearDb ) {
    User.remove({}, function( err ) {
      if( err ) {
        console.log( "ERROR: could not remove 'user' collection. " + err );
        return;
      }
    });
    Room.remove({}, function( err ) {
      if( err ) {
        console.log( "ERROR: could not remove 'room' collection. " + err );
        return;
      };
    });
  }
    
  // CREATE DUMMY USERS
  var dummyUsers = [];
  var dummyUser01 = new User({
    username: 'js',
    access_token: jwt.encode( { username: 'js' }, secret )
  });
  dummyUser01.password = dummyUser01.generateHash( 'tan' );
  dummyUsers.push( dummyUser01 );

  var dummyUser02 = new User({
    username: 'minsoo',
    access_token: jwt.encode( { username: 'minsoo' }, secret )
  });
  dummyUser02.password = dummyUser02.generateHash( 'thigpen' );
  dummyUsers.push( dummyUser02 );

  var dummyUser03 = new User({
    username: 'pete',
    access_token: jwt.encode( { username: 'pete' }, secret )
  });
  dummyUser03.password = dummyUser03.generateHash( 'kim' );
  dummyUsers.push( dummyUser03 );

  var dummyUser04 = new User({
    username: 'cody',
    access_token: jwt.encode( { username: 'cody' }, secret )
  });
  dummyUser04.password = dummyUser04.generateHash( 'fitzgerald' );
  dummyUsers.push( dummyUser04 );

  dummyUsers.forEach( function( dummyUser ) {
    dummyUser.save( function( err, user ) {
      if( err ) throw err;
      console.log( user.username + " saved" );
    });
  });

  // CREATE DUMMY ROOMS
  var dummyRooms = [];
  var dummyRoom01 = new Room({
    name: 'jsroom',
    creator: dummyUser01._id
  });
  dummyRooms.push( dummyRoom01 );

  var dummyRoom02 = new Room({
    name: 'peteroom',
    creator: dummyUser03._id
  });
  dummyRooms.push( dummyRoom02 );
  
  dummyRooms.forEach( function( dummyRoom ) {
    dummyRoom.save( function( err, room ) {
      if( err ) throw err;
      Socket.addRoom( room._id );
      console.log( room.name + " saved" );
    });
  });
  
});
