var secret = require( '../config/secret' ).app_secret;
var User = require( '../models/user' );
var Room = require( '../models/room' );
var jwt = require( 'jwt-simple' );
var Util = require( '../util' );

module.exports = function( app, passport ) {

  // Get all users
  // TODO: passing entire user object, INCLUDING (hashed) PASSWORD
  app.get( '/users',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      User.find( function( err, users ) {
        if( err ) throw err;
        res.json( Util.buildResponse( true, "", { users: users } ) );
      });
    });

  // Get all rooms
  app.get( '/rooms',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      Room.find( function( err, rooms ) {
        if( err ) throw err;
        res.json( Util.buildResponse( true, "", { rooms: rooms } ) );
      }); 
    });
  

  // Get user // for now, return same data for all users, including self
  // TODO: passing entire user object, INCLUDING (hashed) PASSWORD
  app.get( '/user/:username',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      var username = req.params.username;
      User.findOne( { username: username }, function( err, user ) {
        if( err ) throw err;
        if( !user ) {
          res.json( Util.buildResponse( false, "no such user", {} ) );
        } else {
          res.json( Util.buildResponse( true, "", { user: user } ) );
        }
      });
    });

  // Get room data: room name, room stats, etc
  app.get( '/room/:id',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      var userId = req.user._id;
      Room.findById( req.params.id, function( err, room ) {
        if( err ) throw err;
        room.users.push( { user: userId, date: Date.now() } ); 
        room.save( function( err ) {
          if( err ) throw err;
          res.json( Util.buildResponse( true, "", { room: room } ) );
        });
      });
    });

  // Post new room
  app.post( '/room',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      var roomName = req.body.room_name,
          userId = req.user._id;
      Room.findOne({ name: roomName }, function( err, room ) {
        if( err ) { throw err }
        if( room ) { 
          res.json( Util.buildResponse( false, "room name is token", {} ) );
        } else {
          var room = new Room();
          room.name = roomName;
          room.creator = userId;
          room.save( function( err ) {
            if( err ) throw err;
            res.json( Util.buildResponse( true, "", {} ) );  
          });
        }
      });
    });

  // Search rooms
  app.get( '/search/:query',
    function( req, res ) {
      var query = req.params.query;
      Room.find( { name: new RegExp( query, 'i' ) }, function( err, rooms ) {
        if( err ) throw err;
        res.json( Util.buildResponse( true, "", { rooms: rooms } ) );
      });
    });

};



