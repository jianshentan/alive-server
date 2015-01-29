var secret = require( '../config/secret' ).app_secret;
var User = require( '../models/user' );
var Room = require( '../models/room' );
var jwt = require( 'jwt-simple' );

module.exports = function( app, passport ) {

  // Get all users
  app.get( '/users',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      User.find( function( err, users ) {
        if( err ) { throw err }
        res.json( users );
      });
    });

  // Get all rooms
  app.get( '/rooms',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      Room.find( function( err, rooms ) {
        if( err ) { throw err }
        res.json( rooms );
      }); 
    });
  
  // Get room data: room name, room stats, etc
  app.get( '/room/:id',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      var userId = req.user._id;
      Room.findById( req.params.id, function( err, room ) {
        if( err ) { throw err }
        room.users.push( { user: userId, date: Date.now() } ); 
        room.save( function( err ) {
          if( err ) throw err;
          res.status(200).json( room );
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
          res.status(200).json({ message: "NAME-IN-USE" }) 
        } else {
          var room = new Room();
          room.name = roomName;
          room.creator = userId;
          room.save( function( err ) {
            if( err ) throw err;
            res.status(200).json({ message: "OK" });
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
        if( !rooms ) {
          // there are no rooms that satisfy the query
          res.status(200).send( "" );
        } else {
          res.status(200).json( rooms );
        }
      });
    });

};



