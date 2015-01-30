var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema;

var roomSchema = new Schema({
    name: { type: String, unique: true, require: true, default: "" },
    creator: { type: Schema.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    users: [{ 
            user: { type: Schema.ObjectId, ref: 'User' },
            date: { type: Date, default: Date.now }
           }]
});

roomSchema.path( 'name' ).validate( function( name ) {
    return !/\s/.test( name );
}, 'white spaces are invalid' );

roomSchema.path( 'name' ).validate( function( name ) {
    return !name.length <= 3;
}, 'name is too short' );

module.exports = mongoose.model( 'Room', roomSchema );
