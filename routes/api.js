var secret = require( '../config/secret' ).app_secret;
var User = require( '../models/user' );
var Room = require( '../models/room' );
var jwt = require( 'jwt-simple' );

module.exports = function( app, passport ) {

  // requests all users
  // returns list of usernames
  app.get( '/users',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      User.find( function( err, users ) {
        if( err ) { return res.sendStatus( 404 ); }
        res.json( users );
      });
    });

  // request all rooms
  // returns list of rooms
  app.get( '/rooms',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      Room.find( function( err, rooms ) {
        if( err ) { return res.sendStatus( 404 ); };
        res.json( rooms );
      }); 
    });
  
  // request room data: room name, room stats, etc
  // returns json
  app.get( '/room/:id',
    function( req, res ) {
      Room.findById( req.params.id, function( err, room ) {
        if( err ) { return res.sendStatus( 404 ); };
        res.json( room ); 
      });
    });

};

