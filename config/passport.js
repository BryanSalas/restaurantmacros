var LocalStrategy    = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;

var User   = require("../app/models/user");
var Secret = require("../app/models/secret");

var facebookClientID;
var facebookClientSecret;
var facebookCallbackURL;

module.exports = function(passport, acl) {

    // set facebook auth info
    Secret.find({type: "facebook"}, function(err, docs) {
        if (!err){
            facebookClientID = docs[0].secrets.clientID;
            facebookClientSecret = docs[0].secrets.clientSecret;
            facebookCallbackURL = "https://www.restaurantmacros.com/auth/facebook/callback";
            setPassportConfig();
        }
        else {
            console.log("error");
            throw err;
        }
    });

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

        passport.use("local-login", new LocalStrategy({
            usernameField : "email",
            passwordField : "password",
            passReqToCallback : true
        },
          function(req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {

                var json_resp = {
                    errors: {
                        email: null,
                        password: null
                    }
                };

                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user) {
                    json_resp.errors.email = "No account found for this e-mail";
                    return done(null, false, json_resp);
                }

                // if the user is found but the password is wrong
                if (!user.validPassword(password)) {
                    json_resp.errors.password = "Incorrect password";
                    return done(null, false, json_resp);
                }

                // all is well, return successful user
                return done(null, user);
            });
          }
        ));

        // =========================================================================
        // LOCAL SIGNUP ============================================================
        // =========================================================================

        passport.use("local-signup", new LocalStrategy({
            usernameField : "email",
            passwordField : "password",
            passReqToCallback : true
        },
        function(req, email, password, done) {

            var json_resp = {
                errors: {
                    name: null,
                    email: null,
                    password: null
                }
            };

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err);
                    }
                    // check to see if theres already a user with that email
                    if (user) {
                        json_resp.errors.email = "E-mail already in use, try logging in";
                        return done(null, false, json_resp);
                    }
                    else {
                        // check to see if theres any facebook users with that email
                        User.findOne({ 'facebook.email' :  email }, function(err, user) {
                            // if there are any errors, return the error
                            if (err) {
                                return done(err);
                            }
                            // check to see if theres already a user with that email
                            if (user) {
                                json_resp.errors.email = "E-mail already associated with a Facebook login, " +
                                                          "try logging in with Facebook";
                                return done(null, false, json_resp);
                            }
                            else {
                                // create new user if there is no user with that email
                                var newUser            = new User();

                                // set the user's local credentials
                                newUser.local.email    = email;
                                newUser.local.password = newUser.hashPassword(password);
                                newUser.local.name     = req.body.name;

                                // save new user
                                newUser.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }

                                    // set user role
                                    acl.addUserRoles(newUser._id.toString(), "user");

                                    return done(null, newUser);
                                });
                            }
                        });
                    }
                });
            });
        }));

        // =========================================================================
        // FACEBOOK ================================================================
        // =========================================================================

        passport.use(new FacebookStrategy({

            clientID        : facebookClientID,
            clientSecret    : facebookClientSecret,
            callbackURL     : facebookCallbackURL,
            profileFields   : ["id", "displayName", "email", "name"]

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ "facebook.id" : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err) {
                        return done(err);
                    }

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    }
                    else {
                        // if there is no user found with that facebook id create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + " " + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        // save new user
                        newUser.save(function(err) {
                            if (err) {
                                throw err;
                            }

                            // set user role
                            acl.addUserRoles(newUser._id.toString(), "user");

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));
    }
};