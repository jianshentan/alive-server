var FacebookStrategy = require( 'passport-facebook' ).Strategy;
var User = require( '../models/user' );
var configAuth = require( './auth' );

module.exports = function( passport ) {
    passport.use( new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL
    },

    // facebook will send back the token and profile
    function( token, refreshToken, profile, done ) {
        process.nextTick( function() {
            User.findOne({ 'facebook_id' : profile.id }, function( err, user ) {
                if( err ) { return done( err ); }

                if( user ) { // user exists
                    return done( null, user );
                } else { // user does not exist
                    var newUser = new User();
                    newUser.facebook_id = profile.id;
                    newUser.facebook_token = token;
                    newUser.facebook_email = profile.email;

                    /*
                    newUser.save( function( err ) {
                        if( err ) { throw err; }
                        return done( null, newUser );
                    });
                    */
                }
                
            }); 
        });
    }))

};
