module.exports = function( app, passport ) {
  app.post( '/signup', 
    passport.authenticate( 'local-signup', { failureRedirect: '/' } ),
    function( req, res ) {
      console.log( "SUCCESS" );
      res.redirect( '/' );
    });

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/' } ),
    function( req, res ) {
      console.log( "SUCCESS" );
      res.redirect( '/' );
    });
};

