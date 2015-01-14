var Room = require( '../models/room' );
var express = require( 'express' );
var router = express.Router();

router.route( '/room' )
    .get( function( req, res ) {
        Room.find( { 'active': true }, function( err, rooms ) {
            if( err ) { return res.send( err ) }
            res.json( rooms );
        });
    })
    .post( function( req, res ) {
        var room = new Room( req.body );

        room.save( function( err ) {
            if( err ) { return res.send( err ); }
            res.send({ message: 'Room added' });
        });
    });

router.route( '/room/:id' )
    .get( function( req, res ) {
        if( err ) { return res.send( err ); }
        res.json( room );
    })
    .put( function( req, res ) {
        Room.findOne({ _id: req.params.id }, function( err, room ) {
            if( err ) { return res.send( err ); }

            for( el in req.body ) {
                room[el] = req.body[el];
            }
            
            room.save( function( err ) {
                if( err ) { return res.send( err ); }
                res.json({ message: "Room updated!" });
            });
            
        });
    });


module.exports = router;
