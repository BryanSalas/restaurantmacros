// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var less           = require('less');
var fs             = require('fs');
var passport       = require('passport');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');


// configuration ===========================================

require('./config/passport')(passport); // pass passport for configuration

// compile less
fs.readFile('./public/less/styles.less', function(err,styles) {
    if(err) return console.error('Could not open file: %s',err);
    less.render(styles.toString(), {compress: true}, function(er,output) {
        if(er) return console.error(er);
        fs.writeFile('./public/css/styles.css', output.css, function(e) {
            if(e) return console.error(e);
            console.log('Successfully compiled less');
        });
    });
});

// config files
var config = require('./config/db');

// set our port
var port = process.env.PORT || 3000;

// connect to our mongoDB database
mongoose.connect(config.url);

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

///////////////////////////////////////////////////////////
// set up our express application
//app.use(express.logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// required for passport
app.use(session({
  secret: 'ilovescotchscotchyscotchscotch',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routes ==================================================
require('./app/routes')(app, passport); // configure our routes

// start app ===============================================
app.listen(port);

// shoutout to the user
console.log('Running restaurantmacros on ' + port);

// expose app
exports = module.exports = app;