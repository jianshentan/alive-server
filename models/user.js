var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema;

var bcrypt = require( 'bcrypt-nodejs' );

var userSchema = new Schema({
  username: { type: String, unique: true, require: true, default: "" },
  password: { type: String, require: true, default: "" },
  access_token: { type: String, default: "" },
  visited_rooms: [{ 
                  room: { type: Schema.ObjectId, ref: 'Room'},
                  date: { type: Date, default: Date.now }
                 }],
  date_created: { type: Date, default: Date.now },
  login_dates: [{ type: Date }],
  phone_number: { type: String }
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

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model( 'User', userSchema );
