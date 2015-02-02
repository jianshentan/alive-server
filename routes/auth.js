var User = require( '../models/user' );
var Util = require( '../util' );

module.exports = function( app, passport ) {
  // redirect if signup fails
  app.get( '/signup/fail', function( req, res ) {
    res.json( Util.buildResponse( false, "username taken", {} ) );
  });

  // Signup / create user
  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/signup/fail' } ), 
    function( req, res ) {
      var package = {
        access_token: req.user.access_token,
        user_id: req.user._id
      }
      res.json( Util.buildResponse( true, "", package ) );
    });

  // redirect if login fails
  app.get( '/login/fail', function( req, res ) {
    res.json( Util.buildResponse( false, "invalid username/password", {} ) );
  });

  // login / new user access_token
  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/login/fail' } ), 
    function( req, res ) {
      var package = {
        access_token: req.user.access_token,
        user_id: req.user._id
      }
      res.json( Util.buildResponse( true, "", package ) );
    });

};

