var Restaurant = require('./models/restaurant');
var Item = require('./models/item');
var http = require('http');
var request = require('request');
var ObjectId = require('mongoose').Types.ObjectId;

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated())
  	res.send(401);
  else
  	next();
};

    module.exports = function(app, passport) {

        // route to test if the user is logged in or not
        app.get('/loggedin', function(req, res) {
          res.send(req.isAuthenticated() ? req.user : '0');
        });

        // route to log out
        app.post('/logout', function(req, res){
          req.logOut();
          res.send(200);
        });

        app.get('/users', auth, function(req, res){
            res.send([{name: "user1"}, {name: "user2"}]);
        });

        // route to log in
        app.post('/login', passport.authenticate('local-login'), function(req, res) {
            res.send(req.user);
        });

	    // =====================================
        // SIGNUP ==============================
        // =====================================

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
        }));

        // =====================================
        // FACEBOOK ROUTES =====================
        // =====================================
        // route for facebook authentication and login
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

        // server routes ===========================================================

        app.post('/api/results', function(req, res) {
            // validate that only 5 restaurants are searched for
            if (req.body.restaurants.length > 5) {
                res.status(403).send('Sorry, you may only search for 5 restaurants at a time, try removing a restaurant first');
                return;
            }
            var results = [];
            var cal_max = req.body.calories ? req.body.calories : 1233330;
            var pro_max = req.body.protein ? req.body.protein : 123131230;
            var fat_max = req.body.fat ? req.body.fat : 123123130;
            var carb_max = req.body.carbs ? req.body.carbs : 123123130;

            findItems(req.body.restaurants[0]);
            //for(index in req.body.restaurants) {
            //    searchRestaurant(req.body.brands[index]._id, req.body.brands[index].name, 0, {});
            //}
            function findItems(rest) {
                Item.
                  find({restaurant: "587ed056bb2e6c69eaa4a118"}).
                  exec(callback);

                function callback(err, docs) {
                    if(!err) {
                        res.json(docs);
                    }
                    else {
                        res.json({});
                    }
                }
            }
        });

        // get all items
        app.get('/api/items', function(req, res) {
            Item.find({}, function(err, docs) {
                if(!err) {
                    res.json(docs);
                }
                else {
                    res.json({});
                }
            });
        });

        // get all restaurants
        app.get('/api/restaurants', function(req, res) {
            Restaurant.find({}, function(err, docs) {
                if(!err) {
                    res.json(docs);
                }
                else {
                    res.json({});
                }
            });
        });

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html');
        });

    };

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}