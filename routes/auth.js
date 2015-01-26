var secret = require( '../config/secret' ).app_secret;
var jwt = require( 'jwt-simple' );
var User = require( '../models/user' );

module.exports = function( app, passport ) {
  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/' } ),
    function( req, res ) {
      console.log( "SIGNUP - SUCCESS" );
      var token = jwt.encode( { username: req.body.username }, secret );
      updateAccessToken( { username: req.body.username }, token, res );
    });

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/' } ),
    function( req, res ) {
      console.log( "LOGIN - SUCCESS" );
      var token = jwt.encode( { username: req.body.username }, secret );
      updateAccessToken( { username: req.body.username }, token, res );
    });
};

function updateAccessToken( query, token, res ) {
  // update user in DB with new access token
  User.findOneAndUpdate( query, { access_token: token }, function( err, user ) {
    if( err ) { throw err }
    if( !user ) {
      // ERROR: username can't be found
      console.log( "ERROR in update DB with new access token" );
      res.sendStatus( 500 );
    } else {
      res.json({ access_token: token });
    } 
  });
};
