var User = require( '../models/user' );
var express = require( 'express' );
var router = express.Router();

router.route( '/user' )
    .get( function( req, res ) {
        User.find( function( err, users ) {
            if( err ) { return res.send( err ) }
            res.json( users );
        });
    })
    .post( function( req, res ) {
        var user = new User( req.body );

        user.save( function( err ) {
            if( err ) { return res.send( err ); }
            res.send({ message: 'User added' });
        });
    });

router.route( '/user/:id' )
    .get( function( req, res ) {
        User.findOne({ _id: req.params.id }, function( err, user ) {
            if( err ) { return res.send( err ); }
            res.json( user );
        });
    })
    .put( function( req, res ) {
        User.findOne({ _id: req.params.id }, function( err, user ) {
            if( err ) { return res.send( err ); }
            
            for( el in req.body ) {
                user[el] = req.body[el];
            }

            user.save( function( err ) {
                if( err ) { return res.send( err ); }
                res.json({ message: "User updated!" });
            });

        });
    })
    .delete( function( req, res ) {
        User.remove({ _id: req.params.id }, function( err, user ) {
            if( err ) { return res.send( err ); }
            res.json({ message: 'User deleted' });
        });
    });

module.exports = router;
