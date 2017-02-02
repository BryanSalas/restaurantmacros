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
var MongoStore     = require('connect-mongo')(session);
var acl            = require('acl');

// compile less
fs.readFile("./public/less/styles.less", function(err,styles) {
    if(err) return console.error("Could not open file: %s", err);

    less.render(styles.toString(), {compress: true}, function(er,output) {
        if(er) return console.error(er);
        fs.writeFile("./public/css/styles.css", output.css, function(e) {
            if(e) return console.error(e);
            console.log("Successfully compiled less");
        });
    });
});

var dbConfig = require("./config/db");
var port = process.env.PORT || 3000;

// connect to mongoDB
mongoose.connect(dbConfig.url, function(err) {
    if(!err) {
        acl = new acl(new acl.mongodbBackend(mongoose.connection.db, "acl_"));

        // passport config
        require('./config/passport')(passport, acl);

        // set routes
        require("./app/routes")(app, passport, acl);
    }
});

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

// read cookies (needed for auth)
app.use(cookieParser());

// required for passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  maxAge: new Date(Date.now() + 3600000),
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());

// persistent login sessions
app.use(passport.session());

function ensureSecure(req, res, next){
    if(req.headers["X-Forwarded-Proto"] == "http"){
        res.redirect('https://' + req.hostname + req.url);
    };
    // handle port numbers if you need non defaults
    return next();
};

app.all('*', ensureSecure); // at top of routing calls

// start app
app.listen(port);

console.log("Running restaurantmacros on " + port);

// expose app
exports = module.exports = app;