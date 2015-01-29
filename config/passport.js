var LocalStrategy = require( 'passport-local' ).Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require( '../models/user' );
var jwt = require( 'jwt-simple' );

module.exports = function( passport ) {

  passport.use( 'local-signup', new LocalStrategy(
    function( username, password, done ) {
      User.findOne({ username: username }, function( err, user ) {
        if ( err ) { return done(err); }
        if ( user ) { 
          return done(null, false );  //username taken
        } else {
          var newUser = new User();
          newUser.username = username;
          newUser.password = newUser.generateHash( password );;
          newUser.login_dates.push( Date.now() );

          newUser.save( function( err ) {
            if ( err ) throw err;
            return done(null, newUser);
          });
        }
      });
    }
  ));

  passport.use( 'local-login', new LocalStrategy(
    function( username, password, done ) {
      User.findOne({ username: username }, function( err, user ) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); } // no user found
        if (!user.verifyPassword(password)) 
          return done(null, false);  // invalid password

        user.login_dates.push( Date.now() );
        user.save( function( err ) {
          if( err ) { console.log( err ); throw err; } 
          return done(null, user);
        });

      }); 
    }
  ));

  passport.use( new BearerStrategy(
    function( token, done ) {
      User.findOne({ access_token: token }, function( err, user ) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user, { scope: 'all' });
      });
    }
  ));

};
