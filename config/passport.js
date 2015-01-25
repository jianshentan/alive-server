var LocalStrategy = require( 'passport-local' ).Strategy;
var User = require( '../models/user' );
var configAuth = require( './auth' );

module.exports = function( passport ) {

  passport.use( 'local-signup', new LocalStrategy(
    function( username, password, done ) {
      User.findOne({ username: username }, function (err, user) {
        if ( err ) { return done(err); }
        if ( user ) { 
          return done(null, false);  //username taken
        } else {
          var newUser = new User();
          newUser.username = username;
          newUser.password = newUser.generateHash( password );;

          newUser.save( function( err ) {
            if ( err )
              throw err;
            return done(null, newUser);
          });
        }
      });
    }
  ));

};
