var User = require( '../models/user' );
var Util = require( '../util' );

module.exports = function( app, passport ) {
  app.get( '/signup/fail', function( req, res ) {
    res.json( Util.buildResponse( false, "username taken", {} ) );
  });

  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/signup/fail' } ), 
    function( req, res ) {
      res.json( 
        Util.buildResponse( true, "", { access_token: req.user.access_token } ) );
    });

  app.get( '/login/fail', function( req, res ) {
    res.json( Util.buildResponse( false, "invalid username/password", {} ) );
  });

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/login/fail' } ), 
    function( req, res ) {
      res.json( 
        Util.buildResponse( true, "", { access_token: req.user.access_token } ) );
    });

};

