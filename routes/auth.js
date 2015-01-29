var secret = require( '../config/secret' ).app_secret;
var jwt = require( 'jwt-simple' );
var User = require( '../models/user' );

module.exports = function( app, passport ) {
  app.get( '/signup/fail', function( req, res ) {
    res.send( "username taken" );
  });

  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/signup/fail' }), 
    function( req, res ) {
      console.log( req.user );
      var token = jwt.encode( { username: req.body.username }, secret );
      updateAccessToken( { username: req.body.username }, token, res );
    });

  app.get( '/login/fail', function( req, res ) {
    res.send( "login fail" );
  });

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/login/fail' }), 
    function( req, res ) {
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
      console.log( "ERROR: user not found by access token" );
      res.sendStatus( 500 );
    } else {
      res.json({ access_token: token });
    } 
  });
};
