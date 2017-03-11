var request  = require('request');
var ObjectId = require('mongoose').Types.ObjectId;

var Restaurant = require('./models/restaurant');

// Authentication middleware for passport
function authenticated(request, response, next) {

    if ( request.isAuthenticated() ) {
        return next();
    }

    response.send(401, "User not authenticated");
}

// This gets the ID from currently logged in user
function get_user_id(request, response) {
    return request.user._id;
}

module.exports = function(app, passport, acl) {

    // =====================================
    // ACL =================================
    // =====================================

    // admin => devs
    // member => TBD
    // user => regular user

    acl.allow([
        {
            roles: "admin",
            allows: [
                {
                    resources: ["/api/add_restaurant"],
                    permissions: "post"
                },
                {
                    resources: ["/api/restaurant_schema",
                                "/add-restaurant"],
                    permissions: "get"
                }
            ]
        }, {
            roles: "member",
            allows: []
        }, {
            roles: "user",
            allows: []
        }
    ]);

    acl.addRoleParents( "member", "user");
    acl.addRoleParents( "admin", "member" );

    // set Nutritionix APP_ID and APP_KEY
    app.locals.NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
    app.locals.NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY;

    // =====================================
    // LOGIN ===============================
    // =====================================

    // route to login
    app.post("/login", function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                res.send(401, info);
                return;
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.send(user);
            });
        })(req, res, next);
    });

    // route to test if the user is logged in or not
    app.get('/loggedin', function(req, res) {
      res.send(req.isAuthenticated() ? req.user : "0");
    });

    // route to log out
    app.post('/logout', function(req, res){
      req.logOut();
      res.send(200);
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================

    // process the signup form
    app.post("/signup", function(req, res, next) {

        var json_resp = {
                            errors: {
                                name: null,
                                email: null,
                                password: null
                            }
                        }

        // check if name was given
        if(!req.body.name) {
            json_resp.errors.name = "Please enter your full name";
        }

        // TODO: check if valid email
        if(!req.body.email) {
            json_resp.errors.email = "Please enter a valid e-mail address";
        }

        // check if password given
        if(!req.body.password) {
            json_resp.errors.password = "Please enter a password";
        }

        // check if passwords match
        if(req.body.password != req.body.confirm_password) {
            res.send(400, json_resp);
            return;
        }

        if(json_resp.errors.name || json_resp.errors.email || json_resp.errors.password) {
            res.send(400, json_resp);
            return;
        }

        passport.authenticate("local-signup", function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                res.send(400, info);
                return;
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.send(user);
            });
        })(req, res, next);
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================

    // route for facebook authentication and login
    app.post("/auth/facebook", passport.authenticate('facebook', { scope: 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', function(req, res, next) {
        passport.authenticate('facebook', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                res.redirect("/");
                return;
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect("/profile");
            });
        })(req, res, next);
    });

    // =====================================
    // ADMIN API ROUTES ====================
    // =====================================

    app.post("/api/add_restaurant", [authenticated, acl.middleware(2, get_user_id)], function(req, res) {
        // check if restaurant already exists
        Restaurant.find({name: req.body.name}, function(err, docs) {
            if(!err && docs.length == 0) {
                var newRestaurant = new Restaurant(req.body);
                newRestaurant.save(function(err) {
                    if(err) {
                        res.status(400).json(err.errors);
                    }
                    else {
                        res.send({created: newRestaurant});
                    }
                });
            }
            else if(!err && docs.length != 0) {
                res.json({exists: docs});
            }
            else {
                res.send(500);
            }
        });
    });

    app.get("/api/restaurant_schema", [authenticated, acl.middleware(2, get_user_id)], function(req, res) {
        res.json(Restaurant.schema);
    });

    // =====================================
    // ADMIN UI ROUTES =====================
    // =====================================

    app.get("/add-restaurant", [authenticated, acl.middleware(1, get_user_id)], function(req, res) {
        res.sendfile("./public/views/index.html");
    })

    // =====================================
    // MEMBER API ROUTES ===================
    // =====================================

    // TBD

    // =====================================
    // USER API ROUTES =====================
    // =====================================

    // TBD

    // =====================================
    // GUEST API ROUTES ====================
    // =====================================

    // get results of restaurant search
    app.post("/api/results", function(req, res) {
        if(app.locals.OUT_OF_API_CALLS) {
            res.status(500).json({error_message: "Sorry, Restaurant Macros is out of API calls for today."});
            return;
        }

        // validate that only 5 restaurants are searched for
        if(req.body.restaurants.length > 2) {
            res.status(403).json({error_message: "Sorry, you may only search for 2 restaurants at a time, try removing a restaurant first"});
            return;
        }

        var results = {};
        var totalRestaurants = req.body.restaurants.length;
        var totalItems = {};
        var restaurantsDone = 0;
        var searchError = false;

        var MACROS = ["calories", "protein", "fat", "carbs"];

        for(var i = 0; i < MACROS.length; i++) {
            if(!req.body.hasOwnProperty(MACROS[i])) {
                res.status(400).json({error_message: "Please enter a valid number for " + MACROS[i]});
                return;
            }
            else if(req.body[MACROS[i]] < 0) {
                res.status(400).json({error_message: "Please enter a valid number for " + MACROS[i]});
                return;
            }
        }

        var cal_max = req.body.calories == null ? Number.MAX_SAFE_INTEGER : req.body.calories;
        var pro_max = req.body.protein == null ? Number.MAX_SAFE_INTEGER : req.body.protein;
        var fat_max = req.body.fat == null ? Number.MAX_SAFE_INTEGER : req.body.fat;
        var carb_max = req.body.carbs == null ? Number.MAX_SAFE_INTEGER : req.body.carbs;

        for(i = 0; i < totalRestaurants; i++) {
            // API call to get brand_id
            request.post(
                'https://api.nutritionix.com/v1_1/search',
                { json:
                    {
                        "appId": app.locals.NUTRITIONIX_APP_ID,
                        "appKey": app.locals.NUTRITIONIX_APP_KEY,
                        "offset": 0,
                        "limit": 1,
                        "fields":["brand_id"],
                        "filters": {
                            "item_type": 1
                        },
                        "queries": {
                            "brand_name": req.body.restaurants[i].name
                        }
                    }
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        findItems(body.hits[0].fields.brand_id, 0);
                    }
                    else {
                        if(response.body.error_message == "usage limits are exceeded") {
                            app.locals.OUT_OF_API_CALLS = true;
                            res.status(500).json({error_message: "Sorry, Restaurant Macros is out of API calls for today."});
                            return;
                        }
                        res.status(500).json(response.body);
                    }
                }
            );
        }

        function findItems(brandId, offset) {
            request.post(
                'https://api.nutritionix.com/v1_1/search',
                { json:
                    {
                        "appId": app.locals.NUTRITIONIX_APP_ID,
                        "appKey": app.locals.NUTRITIONIX_APP_KEY,
                        "offset": offset,
                        "limit": 50,
                        "fields":["item_name", "brand_name","nf_calories", "nf_total_carbohydrate",
                        "nf_total_fat", "nf_protein"],
                        "filters": {
                            "brand_id": brandId,
                            "nf_calories":{
                                "lte": cal_max
                            },
                            "nf_total_carbohydrate": {
                                "lte": carb_max
                            },
                            "nf_total_fat": {
                                "lte": fat_max
                            },
                            "nf_protein": {
                                "lte": pro_max
                            }
                        }
                    }
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if(searchError) {
                            return;
                        }
                        if(offset == 0) {
                            results[brandId] = [];
                        }

                        // restaurant done
                        if(body.hits.length == 0) {
                            restaurantsDone++;

                            // done
                            if(restaurantsDone == totalRestaurants) {
                                var toReturn = [];
                                Object.keys(results).forEach(function(key) {
                                    toReturn = toReturn.concat(results[key]);
                                });
                                res.json(toReturn);
                            }
                        }

                        else {
                            for(i = 0; i < body.hits.length; i++) {
                                var item = {
                                    restaurant: body.hits[i].fields.brand_name,
                                    name : body.hits[i].fields.item_name,
                                    calories: body.hits[i].fields.nf_calories,
                                    protein: body.hits[i].fields.nf_protein,
                                    fat: body.hits[i].fields.nf_total_fat,
                                    carbs: body.hits[i].fields.nf_total_carbohydrate
                                }
                                results[brandId].push(item);
                            }

                            findItems(brandId, offset + 50);
                        }
                    }
                    else {
                        searchError = true;
                        if(response.body.error_message == "usage limits are exceeded") {
                            app.locals.OUT_OF_API_CALLS = true;
                            res.status(500).json({error_message: "Sorry Restaurant Macros is out of API calls for today."});
                            return;
                        }
                        res.status(500).json(response.body);
                    }
                }
            );
        }
    });

    // get all restaurants
    app.get("/api/restaurants", function(req, res) {
        Restaurant.find({}, function(err, docs) {
            if(!err) {
                res.json(docs);
            }
            else {
                res.json({});
            }
        });
    });

    // check API calls
    app.get("/api/check_api_calls", function(req, res) {
        if(app.locals.OUT_OF_API_CALLS) {
            res.json({outOfAPICalls: true});
        }
        else {
            res.json({outOfAPICalls: false});
        }

    });

    app.use(acl.middleware.errorHandler("json"));

    // =====================================
    // FRONTEND ROUTES =====================
    // =====================================

    // route to handle all angular requests
    app.get("*", function(req, res) {
        res.sendfile("./public/views/index.html");
    });

};