var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema;

var roomSchema = new Schema({
    name: { type: String, unique: true, require: true, default: "" },
    active: { type: Boolean, default: false },
    users: [{ type: Schema.ObjectId, ref: 'User' }]
});

roomSchema.path( 'name' ).validate( function( name ) {
    return !/\s/.test( name );
}, 'white spaces are invalid' );

roomSchema.path( 'name' ).validate( function( name ) {
    return !name.length <= 3;
}, 'name is too short' );

roomSchema.path( 'name' ).validate( function( name ) {
    return !name.length > 15;
}, 'name is too long' );

roomSchema.path( 'name' ).validate( function( name, cb ) {
    var Room = mongoose.model( 'Room' );
    Room.find({ name: name }).exec( function( err, rooms ) {
        cb( !err && rooms.length == 0 );
    });
}, 'name is already in use' );


module.exports = mongoose.model( 'Room', roomSchema );
