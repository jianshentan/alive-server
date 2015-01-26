/* ========================================================
                        BASE SETUP
======================================================== */

/* ------------- call the packages we need ------------- */
var express       = require('express');
var app           = express();
var mongoose      = require('mongoose');
var bodyParser    = require('body-parser');
var passport      = require('passport');

// ( for browser client )
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');

/* --------------------- connect db -------------------- */
mongoose.connect( 'mongodb://localhost:27017/alive' );

/*------------------ view engine setup ----------------- */
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'ejs');

/*--------------------- configure app ------------------ */

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

require('./config/passport')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// ( for browser client )
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* ========================================================
                     ROUTES FOR API 
======================================================== */

// routing:
require('./routes/auth')(app, passport); // auth
require('./routes/api')(app, passport); // api
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
