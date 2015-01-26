var secret = require( '../config/secret' ).app_secret;
var User = require( '../models/user' );
var Room = require( '../models/room' );
var jwt = require( 'jwt-simple' );

module.exports = function( app, passport ) {
  app.get( '/users',
    passport.authenticate( 'bearer', { session: false } ),
    function( req, res ) {
      User.find( function( err, users ) {
        if( err ) { return res.sendStatus( 404 ); }
        res.json( users);
      });
    });
};

