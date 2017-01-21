// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var Secret = require("../app/models/secret");

var facebookClientID;
var facebookClientSecret;
var facebookCallbackURL;

// expose this function to our app using module.exports
module.exports = function(passport) {

    // set facebook auth info
    Secret.find({type: "facebook"}, function(err, docs) {
        if (!err){
            facebookClientID = docs[0].secrets.clientID;
            facebookClientSecret = docs[0].secrets.clientSecret;
            facebookCallbackURL = "http://localhost:8080/auth/facebook/callback";
            setPassportConfig();
        }
        else {
            console.log("error");
            throw err;
        }
    });

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    function setPassportConfig() {
        // used to serialize the user for the session
        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        // used to deserialize the user
        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        // =========================================================================
        // LOCAL LOGIN =============================================================
        // =========================================================================
        // we are using named strategies since we have one for login and one for signup
        // by default, if there was no name, it would just be called 'local'

        passport.use('local-login', new LocalStrategy(
          function(username, password, done) {
            if (username === "admin" && password === "admin") // stupid example
              return done(null, {name: "admin"}, { message: 'Success!' });

            return done(null, false, { message: 'Incorrect username.' });
          }
        ));

        /*passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return successful user
                return done(null, user);
            });

        }));*/

        // =========================================================================
        // FACEBOOK ================================================================
        // =========================================================================

        passport.use(new FacebookStrategy({

            clientID        : facebookClientID,
            clientSecret    : facebookClientSecret,
            callbackURL     : facebookCallbackURL

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));
    }
};