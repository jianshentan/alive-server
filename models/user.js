var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, unique: true, require: true, default: "" },
    active_room: { type: Schema.ObjectId, ref: 'Room' },
    facebook_id: { type: String },
    facebook_token: { type: String },
    facebook_email: { type: String }
});

userSchema.path( 'username' ).validate( function( username ) {
    return !/\s/.test( username );
}, 'white spaces are invalid' );

userSchema.path( 'username' ).validate( function( username ) {
    return username.length;
}, 'username cannot be blank' );

userSchema.path( 'username' ).validate( function( username, cb ) {
    var User = mongoose.model( 'User' );
    User.find({ username: username }).exec( function( err, users ) {
        cb( !err && users.length == 0 );
    });
}, 'username is already in use' );

module.exports = mongoose.model( 'User', userSchema );
