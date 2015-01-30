var User = require( '../models/user' );

module.exports = function( app, passport ) {
  app.get( '/signup/fail', function( req, res ) {
    res.send( "username taken" );
  });

  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/signup/fail' }), 
    function( req, res ) {
      res.json({ access_token: req.user.access_token });
    });

  app.get( '/login/fail', function( req, res ) {
    res.send( "login fail" );
  });

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/login/fail' }), 
    function( req, res ) {
      res.json({ access_token: req.user.access_token });
    });

};
